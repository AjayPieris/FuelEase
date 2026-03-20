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
        // 1. Check if the user gave us the right information
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:user,station,admin' // Must be one of these three
        ]);

        // 2. Save the new user into the database
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password), // Encrypt the password!
            'role' => $request->role,
        ]);

        // 3. Create their VIP Token
        $token = $user->createToken('fuelease_token')->plainTextToken;

        // 4. Send the user data and token back to the frontend
        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // --- LOGIN EXISTING USER ---
    public function login(Request $request)
    {
        // 1. Check if they provided email and password
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        // 2. Find the user in the database
        $user = User::where('email', $request->email)->first();

        // 3. If user doesn't exist OR password is wrong, reject them
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Incorrect email or password'], 401);
        }

        // 4. If correct, create a new VIP Token
        $token = $user->createToken('fuelease_token')->plainTextToken;

        // 5. Send data back to frontend
        return response()->json([
            'user' => $user,
            'token' => $token
        ]);
    }
}