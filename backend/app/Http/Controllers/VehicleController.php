<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\FuelQuota;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    /**
     * Register a new vehicle — sets status to 'pending', no QR generated yet.
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
            'qr_code'        => null,   // No QR until admin approves
            'status'         => 'pending',
        ]);

        // Do NOT create FuelQuota here — only on admin approval

        return response()->json([
            'message' => 'Vehicle submitted for admin verification!',
            'vehicle' => $vehicle
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