<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Station;
use App\Models\FuelTransaction;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    private function requireAdmin(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            abort(response()->json(['message' => 'Unauthorized. Admins only.'], 403));
        }
    }

    // --- 1. VIEW ALL USERS ---
    public function getAllUsers(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(User::all(), 200);
    }

    // --- 2. VIEW ALL STATIONS ---
    public function getAllStations(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(Station::with('user')->get(), 200);
    }

    // --- 3. VIEW ALL TRANSACTIONS ---
    public function getAllTransactions(Request $request)
    {
        $this->requireAdmin($request);
        return response()->json(FuelTransaction::latest()->get(), 200);
    }

    // --- 4. APPROVE STATION ---
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

    // --- 5. REJECT STATION ---
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

    // --- 6. BLOCK USER ---
    public function blockUser(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);
        $user->update(['is_blocked' => true]);

        // Revoke all their tokens so they are immediately logged out
        $user->tokens()->delete();

        return response()->json(['message' => 'User blocked.'], 200);
    }

    // --- 7. UNBLOCK USER ---
    public function unblockUser(Request $request, $id)
    {
        $this->requireAdmin($request);

        $user = User::findOrFail($id);
        $user->update(['is_blocked' => false]);

        return response()->json(['message' => 'User unblocked.'], 200);
    }
}