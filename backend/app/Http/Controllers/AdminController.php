<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Station;
use App\Models\Vehicle;
use App\Models\FuelQuota;
use App\Models\FuelTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    private function requireAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(response()->json(['message' => 'Unauthorized. Admins only.'], 403));
        }
    }

    // ─── USERS ────────────────────────────────────────────

    public function getAllUsers(Request $request)
    {
        $this->requireAdmin($request);
        $users = User::withCount('vehicles')->get();
        return response()->json($users, 200);
    }

    // ─── STATIONS ─────────────────────────────────────────

    public function getAllStations(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(Station::with('user')->get(), 200);
    }

    // ─── TRANSACTIONS ─────────────────────────────────────

    public function getAllTransactions(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(FuelTransaction::with(['user.vehicles', 'station'])->latest()->get(), 200);
    }

    // ─── APPROVE / REJECT STATION ─────────────────────────

    public function approveStation(Request $request, $id)
    {
        $this->requireAdmin($request);

        $station = Station::findOrFail($id);
        $station->update([
            'approval_status'  => 'approved',
            'rejection_reason' => null,
            'is_available'     => true,
        ]);

        return response()->json(['message' => 'Station approved!', 'station' => $station], 200);
    }

    public function rejectStation(Request $request, $id)
    {
        $this->requireAdmin($request);

        $request->validate([
            'reason' => 'required|string'
        ]);

        $station = Station::findOrFail($id);
        $station->update([
            'approval_status'  => 'rejected',
            'rejection_reason' => $request->reason,
            'is_available'     => false,
        ]);

        return response()->json(['message' => 'Station rejected.', 'station' => $station], 200);
    }

    // ─── BLOCK / UNBLOCK USER ─────────────────────────────

    public function blockUser(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);
        $user->update(['is_blocked' => true]);
        $user->tokens()->delete();

        return response()->json(['message' => 'User blocked.'], 200);
    }

    public function unblockUser(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);
        $user->update(['is_blocked' => false]);

        return response()->json(['message' => 'User unblocked.'], 200);
    }

    // ─── VEHICLES ─────────────────────────────────────────

    /**
     * List all vehicles with owner info.
     */
    public function getAllVehicles(Request $request)
    {
        $this->requireAdmin($request);
        $vehicles = Vehicle::with('user')->latest()->get();
        return response()->json($vehicles, 200);
    }

    /**
     * Approve a vehicle — generate QR code and create fuel quota.
     */
    public function approveVehicle(Request $request, $id)
    {
        $this->requireAdmin($request);

        $vehicle = Vehicle::findOrFail($id);

        if ($vehicle->status === 'approved') {
            return response()->json(['message' => 'Vehicle is already approved.'], 400);
        }

        // Generate unique QR string
        $qrString = 'QR-' . strtoupper(Str::random(10));

        // Map fuel_type to weekly quota
        $quotaMap = [
            'Motorcycles'            => 5,
            'Cars / Three-Wheelers'  => 15,
            'Vans'                   => 40,
            'Buses'                  => 60,
            'Land Vehicles'          => 25,
        ];
        $weeklyQuota = $quotaMap[$vehicle->fuel_type] ?? 20;

        $vehicle->update([
            'status'  => 'approved',
            'qr_code' => $qrString,
        ]);

        // Create or update fuel quota for this user
        $existingQuota = FuelQuota::where('user_id', $vehicle->user_id)->first();
        if (!$existingQuota) {
            FuelQuota::create([
                'user_id'         => $vehicle->user_id,
                'weekly_quota'    => $weeklyQuota,
                'remaining_quota' => $weeklyQuota,
            ]);
        } else {
            $existingQuota->update([
                'weekly_quota'    => $existingQuota->weekly_quota + $weeklyQuota,
                'remaining_quota' => $existingQuota->remaining_quota + $weeklyQuota,
            ]);
        }

        return response()->json([
            'message' => 'Vehicle approved and QR generated!',
            'vehicle' => $vehicle->fresh(),
        ], 200);
    }

    /**
     * Reject a vehicle.
     */
    public function rejectVehicle(Request $request, $id)
    {
        $this->requireAdmin($request);

        $vehicle = Vehicle::findOrFail($id);
        $vehicle->update(['status' => 'rejected']);

        return response()->json(['message' => 'Vehicle rejected.', 'vehicle' => $vehicle], 200);
    }
}