<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Station;
use App\Models\FuelTransaction;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // --- 1. VIEW ALL USERS ---
    public function getAllUsers(Request $request)
    {
        // Security check: Is this user an admin?
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admins only.'], 403);
        }

        $users = User::all(); // Grabs every user in the database
        return response()->json($users, 200);
    }

    // --- 2. VIEW ALL STATIONS ---
    public function getAllStations(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admins only.'], 403);
        }

        $stations = Station::all();
        return response()->json($stations, 200);
    }

    // --- 3. VIEW ALL TRANSACTIONS ---
    public function getAllTransactions(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized. Admins only.'], 403);
        }

        $transactions = FuelTransaction::latest()->get();
        return response()->json($transactions, 200);
    }
}