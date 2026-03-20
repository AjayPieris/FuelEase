<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\FuelQuota;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VehicleController extends Controller
{
    public function registerVehicle(Request $request)
    {
        // 1. Check if the user provided the required details
        $request->validate([
            'vehicle_number' => 'required|string|unique:vehicles',
            'fuel_type' => 'required|string', // e.g., Petrol or Diesel
        ]);

        // 2. Generate a random, unique string for the QR code
        $qrString = 'QR-' . strtoupper(Str::random(10));

        // 3. Save the vehicle to the database
        // $request->user()->id automatically gets the ID of the logged-in user!
        $vehicle = Vehicle::create([
            'user_id' => $request->user()->id, 
            'vehicle_number' => $request->vehicle_number,
            'fuel_type' => $request->fuel_type,
            'qr_code' => $qrString
        ]);

        // 4. Automatically give this user their first weekly fuel quota (e.g., 20 liters)
        FuelQuota::create([
            'user_id' => $request->user()->id,
            'weekly_quota' => 20.00,
            'remaining_quota' => 20.00,
        ]);

        // 5. Send success message back
        return response()->json([
            'message' => 'Vehicle registered successfully!',
            'vehicle' => $vehicle
        ], 201);
    }

    public function getVehicle(Request $request)
    {
        // Find the vehicle that belongs to the logged-in user
        $vehicle = Vehicle::where('user_id', $request->user()->id)->first();
        
        return response()->json($vehicle, 200);
    }
}