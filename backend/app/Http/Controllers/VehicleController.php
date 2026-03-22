<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\FuelQuota;
use App\Models\RegistryEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VehicleController extends Controller
{
    /**
     * Register a new vehicle — auto-approves if registry match is found.
     */
    public function registerVehicle(Request $request)
    {
        $request->validate([
            'vehicle_number' => 'required|string|unique:vehicles',
            'fuel_type'      => 'required|string',
            'chassis_number' => 'nullable|string',
            'full_name'      => 'nullable|string',
            'nic_number'     => 'nullable|string',
        ]);

        $vehicle = Vehicle::create([
            'user_id'        => $request->user()->id,
            'vehicle_number' => $request->vehicle_number,
            'fuel_type'      => $request->fuel_type,
            'chassis_number' => $request->chassis_number,
            'full_name'      => $request->full_name,
            'nic_number'     => $request->nic_number,
            'qr_code'        => null,
            'status'         => 'pending',
        ]);

        // ─── Auto-Approval Engine ─────────────────────────
        $entry = RegistryEntry::where('vehicle_number', strtoupper($vehicle->vehicle_number))->first();

        if ($entry) {
            // Check chassis match
            if ($entry->chassis_number && $vehicle->chassis_number &&
                strtoupper($entry->chassis_number) !== strtoupper($vehicle->chassis_number)) {
                $vehicle->update(['failure_reason' => 'Chassis number mismatch']);
            }
            // Check NIC match
            elseif ($entry->nic_number && $vehicle->nic_number &&
                strtoupper($entry->nic_number) !== strtoupper($vehicle->nic_number)) {
                $vehicle->update(['failure_reason' => 'NIC number mismatch']);
            }
            // All match — auto-approve!
            else {
                $quotaMap = [
                    'Motorcycles' => 5, 'Cars / Three-Wheelers' => 15,
                    'Vans' => 40, 'Buses' => 60, 'Land Vehicles' => 25,
                ];
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

                return response()->json([
                    'message' => 'Vehicle auto-approved! Your QR code is ready.',
                    'vehicle' => $vehicle->fresh(),
                ], 201);
            }
        } else {
            $vehicle->update(['failure_reason' => 'Vehicle not found in registry']);
        }

        return response()->json([
            'message' => 'Vehicle submitted for admin verification!',
            'vehicle' => $vehicle->fresh(),
        ], 201);
    }

    /**
     * Get ALL vehicles belonging to the logged-in user.
     */
    public function getVehicle(Request $request)
    {
        $vehicles = Vehicle::where('user_id', $request->user()->id)->get();

        return response()->json($vehicles, 200);
    }
}