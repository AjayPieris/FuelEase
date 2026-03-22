<?php

namespace App\Http\Controllers;

use App\Models\RegistryFile;
use App\Models\RegistryEntry;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Shuchkin\SimpleXLSX;

class RegistryController extends Controller
{
    private function requireAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(response()->json(['message' => 'Unauthorized. Admins only.'], 403));
        }
    }

    /**
     * Upload an .xlsx registry file, parse it, save entries, then auto-approve pending vehicles.
     */
    public function uploadRegistry(Request $request)
    {
        $this->requireAdmin($request);

        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:10240',
        ]);

        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();

        // Use the uploaded file's real temp path directly
        $fullPath = $file->getRealPath();

        // Parse the Excel file
        $xlsx = SimpleXLSX::parse($fullPath);
        if (!$xlsx) {
            return response()->json(['message' => 'Failed to parse Excel file: ' . SimpleXLSX::parseError()], 400);
        }

        $rows = $xlsx->rows();
        if (count($rows) < 2) {
            return response()->json(['message' => 'Excel file appears empty (no data rows found).'], 400);
        }

        // First row is header
        $header = array_map(fn($h) => strtolower(trim($h)), $rows[0]);

        // Map columns (flexible matching)
        $colMap = [
            'vehicle_number' => $this->findColumn($header, ['vehicle_number', 'vehicle number', 'vehicle no', 'reg no', 'registration number', 'registration no']),
            'chassis_number' => $this->findColumn($header, ['chassis_number', 'chassis number', 'chassis no', 'chassis']),
            'nic_number'     => $this->findColumn($header, ['nic_number', 'nic number', 'nic no', 'nic', 'national id']),
            'full_name'      => $this->findColumn($header, ['full_name', 'full name', 'owner name', 'name', 'owner']),
            'fuel_type'      => $this->findColumn($header, ['fuel_type', 'fuel type', 'vehicle type', 'type']),
        ];

        if ($colMap['vehicle_number'] === null) {
            return response()->json(['message' => 'Could not find a "Vehicle Number" column in the Excel file. Please ensure the header row contains a column like "Vehicle Number" or "Reg No".'], 400);
        }

        // Create the registry file record
        $registryFile = RegistryFile::create([
            'file_name'     => $fileName,
            'total_records' => count($rows) - 1,
        ]);

        // Bulk insert entries
        $entries = [];
        for ($i = 1; $i < count($rows); $i++) {
            $row = $rows[$i];
            $vehicleNum = $colMap['vehicle_number'] !== null ? strtoupper(trim($row[$colMap['vehicle_number']] ?? '')) : '';
            if (empty($vehicleNum)) continue;

            $entries[] = [
                'registry_file_id' => $registryFile->id,
                'vehicle_number'   => $vehicleNum,
                'chassis_number'   => $colMap['chassis_number'] !== null ? strtoupper(trim($row[$colMap['chassis_number']] ?? '')) : null,
                'nic_number'       => $colMap['nic_number'] !== null ? strtoupper(trim($row[$colMap['nic_number']] ?? '')) : null,
                'full_name'        => $colMap['full_name'] !== null ? trim($row[$colMap['full_name']] ?? '') : null,
                'fuel_type'        => $colMap['fuel_type'] !== null ? trim($row[$colMap['fuel_type']] ?? '') : null,
                'created_at'       => now(),
                'updated_at'       => now(),
            ];
        }

        // Chunk insert for performance
        foreach (array_chunk($entries, 500) as $chunk) {
            RegistryEntry::insert($chunk);
        }

        // Update actual count
        $registryFile->update(['total_records' => count($entries)]);

        // Run auto-approval on all pending vehicles
        $autoApproved = $this->runAutoApproval();


        return response()->json([
            'message'       => "Registry uploaded! {$registryFile->total_records} records imported. {$autoApproved} vehicles auto-approved.",
            'registry_file' => $registryFile,
            'auto_approved' => $autoApproved,
        ], 201);
    }

    /**
     * Run auto-approval against all pending vehicles.
     */
    private function runAutoApproval(): int
    {
        $pendingVehicles = Vehicle::where('status', 'pending')->get();
        $approved = 0;

        $quotaMap = [
            'Motorcycles'            => 5,
            'Cars / Three-Wheelers'  => 15,
            'Vans'                   => 40,
            'Buses'                  => 60,
            'Land Vehicles'          => 25,
        ];

        foreach ($pendingVehicles as $vehicle) {
            $entry = RegistryEntry::where('vehicle_number', strtoupper($vehicle->vehicle_number))->first();

            if (!$entry) {
                $vehicle->update([
                    'failure_reason' => 'Vehicle not found in registry',
                ]);
                continue;
            }

            // Check chassis match
            if ($entry->chassis_number && $vehicle->chassis_number &&
                strtoupper($entry->chassis_number) !== strtoupper($vehicle->chassis_number)) {
                $vehicle->update([
                    'failure_reason' => 'Chassis number mismatch',
                ]);
                continue;
            }

            // Check NIC match
            if ($entry->nic_number && $vehicle->nic_number &&
                strtoupper($entry->nic_number) !== strtoupper($vehicle->nic_number)) {
                $vehicle->update([
                    'failure_reason' => 'NIC number mismatch',
                ]);
                continue;
            }

            // All checks passed — auto-approve
            $weeklyQuota = $quotaMap[$vehicle->fuel_type] ?? 20;
            $qrString = 'QR-' . strtoupper(Str::random(10));

            $vehicle->update([
                'status'          => 'approved',
                'qr_code'         => $qrString,
                'weekly_quota'    => $weeklyQuota,
                'remaining_quota' => $weeklyQuota,
                'approval_method' => 'auto',
                'failure_reason'  => null,
            ]);

            $approved++;
        }

        return $approved;
    }

    /**
     * List all registry files.
     */
    public function getRegistryFiles(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(RegistryFile::latest()->get(), 200);
    }

    /**
     * Delete a registry file and its entries.
     */
    public function deleteRegistryFile(Request $request, $id)
    {
        $this->requireAdmin($request);
        $file = RegistryFile::findOrFail($id);
        $file->delete(); // cascade deletes entries
        return response()->json(['message' => 'Registry file deleted.'], 200);
    }

    /**
     * Get the raw entries of a registry file for preview.
     */
    public function getRegistryEntries(Request $request, $id)
    {
        $this->requireAdmin($request);
        $file = RegistryFile::findOrFail($id);
        return response()->json([
            'file'    => $file,
            'entries' => $file->entries()->paginate(100),
        ], 200);
    }

    /**
     * Helper: find a column index from an array of possible header names.
     */
    private function findColumn(array $header, array $possibleNames): ?int
    {
        foreach ($possibleNames as $name) {
            $idx = array_search($name, $header);
            if ($idx !== false) return $idx;
        }
        return null;
    }
}
