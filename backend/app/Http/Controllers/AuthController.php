<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    // --- REGISTER NEW USER ---
    public function register(Request $request)
    {
        $rules = [
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role'     => 'required|in:user,station,admin',
            'profile_picture_url' => 'nullable|string|url',
        ];

        // User (vehicle owner) must provide a unique NIC number and NIC photo
        if ($request->role === 'user') {
            $rules['nic_number']    = 'required|string|unique:users,nic_number';
            $rules['nic_image_url'] = 'required|string|url';
        }

        // Station must provide a document URL and a district
        if ($request->role === 'station') {
            $rules['document_url'] = 'required|string';
            $rules['district']     = 'required|string';
        }

        $request->validate($rules);

        $userData = [
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
            'profile_picture_url' => $request->profile_picture_url,
        ];

        if ($request->role === 'user') {
            $userData['nic_number']    = strtoupper($request->nic_number);
            $userData['nic_image_url'] = $request->nic_image_url;
        }

        $user = User::create($userData);

        // If a station, create the station record immediately with pending status
        if ($request->role === 'station') {
            \App\Models\Station::create([
                'user_id'         => $user->id,
                'name'            => $request->name,
                'location'        => $request->location ?? '',
                'district'        => $request->district,
                'document_url'    => $request->document_url,
                'approval_status' => 'pending',
                'is_available'    => 'empty', // Use string value matching our queue logic
            ]);
        }

        $token = $user->createToken('fuelease_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token
        ], 201);
    }

    // --- LOGIN EXISTING USER ---
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect email or password'], 401);
        }

        // Check if this account has been blocked by an admin
        if ($user->is_blocked) {
            return response()->json(['message' => 'Your account has been blocked. Please contact support.'], 403);
        }

        $token = $user->createToken('fuelease_token')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token
        ]);
    }

    // --- UPDATE ACCOUNT (name / password / profile picture) ---
    public function updateAccount(Request $request)
    {
        $request->validate([
            'name'     => 'sometimes|string',
            'password' => 'sometimes|string|min:6',
            'profile_picture_url' => 'nullable|string|url',
        ]);

        $user = $request->user();

        if ($request->filled('name')) {
            $user->name = $request->name;
        }
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        if ($request->has('profile_picture_url')) {
            $user->profile_picture_url = $request->profile_picture_url;
        }

        $user->save();

        return response()->json(['message' => 'Account updated!', 'user' => $user]);
    }
}