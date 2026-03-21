<?php

namespace App\Http\Controllers;

use App\Models\Station;
use App\Models\Vehicle;
use App\Models\FuelQuota;
use App\Models\FuelTransaction;
use Illuminate\Http\Request;

class StationController extends Controller
{
    // --- 0. PUBLIC: GET ALL APPROVED STATIONS ---
    public function getPublicStations()
    {
        $stations = Station::where('approval_status', 'approved')
            ->select('id', 'name', 'district', 'location', 'is_available')
            ->get();
        return response()->json($stations, 200);
    }

    // --- 1. GET STATION PROFILE ---
    public function getStation(Request $request)
    {
        $station = Station::where('user_id', $request->user()->id)->first();
        return response()->json($station, 200);
    }


    // --- 2. SET UP A STATION PROFILE (now done at registration, this is legacy) ---
    public function setupStation(Request $request)
    {
        $request->validate([
            'name'         => 'required|string',
            'location'     => 'required|string',
            'document_url' => 'required|string',
        ]);

        $existing = Station::where('user_id', $request->user()->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Station already exists.'], 409);
        }

        $station = Station::create([
            'user_id'         => $request->user()->id,
            'name'            => $request->name,
            'location'        => $request->location,
            'document_url'    => $request->document_url,
            'approval_status' => 'pending',
            'is_available'    => false,
        ]);

        return response()->json(['message' => 'Station submitted for approval!', 'station' => $station], 201);
    }

    // --- 3. RESUBMIT DOCUMENT AFTER REJECTION ---
    public function resubmitDocument(Request $request)
    {
        $request->validate([
            'document_url' => 'required|string',
        ]);

        $station = Station::where('user_id', $request->user()->id)->first();

        if (!$station) {
            return response()->json(['message' => 'Station not found.'], 404);
        }

        if ($station->approval_status !== 'rejected') {
            return response()->json(['message' => 'Can only resubmit if station was rejected.'], 400);
        }

        $station->update([
            'document_url'    => $request->document_url,
            'approval_status' => 'pending',
            'rejection_reason' => null,
        ]);

        return response()->json(['message' => 'Document resubmitted for review!', 'station' => $station], 200);
    }

    // --- 4. SCAN QR AND DEDUCT FUEL ---
    public function deductFuel(Request $request)
    {
        $request->validate([
            'qr_code' => 'required|string',
            'liters'  => 'required|numeric|min:0.5'
        ]);

        $station = Station::where('user_id', $request->user()->id)->first();
        if (!$station) {
            return response()->json(['message' => 'Station profile not found!'], 404);
        }

        // Only approved stations can scan
        if ($station->approval_status !== 'approved') {
            return response()->json(['message' => 'Your station has not been approved yet. Please wait for admin approval.'], 403);
        }

        $vehicle = Vehicle::where('qr_code', $request->qr_code)->first();
        if (!$vehicle) {
            return response()->json(['message' => 'Invalid QR Code! Vehicle not found.'], 404);
        }

        $quota = FuelQuota::where('user_id', $vehicle->user_id)->first();

        if ($quota->remaining_quota < $request->liters) {
            return response()->json(['message' => 'Not enough fuel quota remaining!'], 400);
        }

        $quota->remaining_quota -= $request->liters;
        $quota->save();

        FuelTransaction::create([
            'user_id'         => $vehicle->user_id,
            'station_id'      => $station->id,
            'liters_deducted' => $request->liters,
        ]);

        return response()->json([
            'message'          => 'Fuel deducted successfully!',
            'remaining_quota'  => $quota->remaining_quota,
        ], 200);
    }
}