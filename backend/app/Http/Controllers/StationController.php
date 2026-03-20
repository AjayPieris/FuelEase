<?php

namespace App\Http\Controllers;

use App\Models\Station;
use App\Models\Vehicle;
use App\Models\FuelQuota;
use App\Models\FuelTransaction;
use Illuminate\Http\Request;

class StationController extends Controller
{
    // --- 1. SET UP A STATION PROFILE ---
    public function setupStation(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'location' => 'required|string',
        ]);

        $station = Station::create([
            'user_id' => $request->user()->id, // Links to logged-in station user
            'name' => $request->name,
            'location' => $request->location,
            'is_available' => true
        ]);

        return response()->json(['message' => 'Station created!', 'station' => $station], 201);
    }

    // --- 2. SCAN QR AND DEDUCT FUEL ---
    public function deductFuel(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
            'liters' => 'required|numeric|min:1' // Must deduct at least 1 liter
        ]);

        // 1. Find the station profile of the logged-in user making this request
        $station = Station::where('user_id', $request->user()->id)->first();
        if (!$station) {
            return response()->json(['message' => 'Station profile not found!'], 404);
        }

        // 2. Find the vehicle using the scanned QR Code text
        $vehicle = Vehicle::where('qr_code', $request->qr_code)->first();
        if (!$vehicle) {
            return response()->json(['message' => 'Invalid QR Code! Vehicle not found.'], 404);
        }

        // 3. Find the vehicle owner's fuel quota
        $quota = FuelQuota::where('user_id', $vehicle->user_id)->first();

        // 4. Check if they have enough fuel left
        if ($quota->remaining_quota < $request->liters) {
            return response()->json(['message' => 'Not enough fuel quota remaining!'], 400);
        }

        // 5. Deduct the fuel and save the new balance
        $quota->remaining_quota -= $request->liters;
        $quota->save();

        // 6. Record the transaction in the history table
        $transaction = FuelTransaction::create([
            'user_id' => $vehicle->user_id,
            'station_id' => $station->id,
            'liters_deducted' => $request->liters
        ]);

        // 7. Send success message!
        return response()->json([
            'message' => 'Fuel deducted successfully!',
            'remaining_quota' => $quota->remaining_quota,
        ], 200);
    }
}