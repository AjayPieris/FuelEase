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
        // Get all transactions for this user, ordered by the newest first
        $history = FuelTransaction::where('user_id', $request->user()->id)
                                  ->latest()
                                  ->get();
                                  
        // Send the list of transactions back
        return response()->json($history, 200);
    }
}