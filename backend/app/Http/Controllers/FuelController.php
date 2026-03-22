<?php

namespace App\Http\Controllers;

use App\Models\FuelQuota;
use App\Models\FuelTransaction;
use Illuminate\Http\Request;

class FuelController extends Controller
{
    // --- 1. VIEW REMAINING QUOTA ---
    public function getQuota(Request $request)
    {
        // Find the quota that belongs to the currently logged-in user
        $quota = FuelQuota::where('user_id', $request->user()->id)->first();
        
        // If they don't have a quota yet, tell them
        if (!$quota) {
            return response()->json(['message' => 'No quota found for this user.'], 404);
        }

        // Send the quota data back to the frontend
        return response()->json($quota, 200);
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
                                      ->with(['user', 'user.vehicles'])
                                      ->latest()
                                      ->get();
        } else {
            $history = FuelTransaction::where('user_id', $user->id)
                                      ->with(['station'])
                                      ->latest()
                                      ->get();
        }

        return response()->json($history, 200);
    }
}