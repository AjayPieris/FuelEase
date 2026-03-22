<?php

namespace App\Http\Controllers;

use App\Models\FuelQuota;
use App\Models\FuelTransaction;
use Illuminate\Http\Request;

class FuelController extends Controller
{
    public function getQuota(Request $request)
    {
        // Find all approved vehicles for the user
        $vehicles = \App\Models\Vehicle::where('user_id', $request->user()->id)
            ->where('status', 'approved')
            ->get();
        
        if ($vehicles->isEmpty()) {
            return response()->json(['message' => 'No approved vehicles found for this user.'], 404);
        }

        $totalWeekly = $vehicles->sum('weekly_quota');
        $totalRemaining = $vehicles->sum('remaining_quota');

        return response()->json([
            'weekly_quota' => $totalWeekly,
            'remaining_quota' => $totalRemaining,
            'vehicles_quota' => $vehicles->map->only(['id', 'weekly_quota', 'remaining_quota'])
        ], 200);
    }

    // --- 2. VIEW FUEL HISTORY ---
    public function getHistory(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'station') {
            $station = \App\Models\Station::where('user_id', $user->id)->first();
            if (!$station) {
                return response()->json([], 200);
            }
            $history = FuelTransaction::where('station_id', $station->id)
                                      ->with(['user', 'user.vehicles', 'vehicle'])
                                      ->latest()
                                      ->get();
        } else {
            $history = FuelTransaction::where('user_id', $user->id)
                                      ->with(['station', 'vehicle'])
                                      ->latest()
                                      ->get();
        }

        return response()->json($history, 200);
    }
}