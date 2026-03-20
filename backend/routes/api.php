<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- THESE ARE THE IMPORTANT IMPORT LINES ---
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\FuelController; 
use App\Http\Controllers\StationController;
use App\Http\Controllers\AdminController;

// --- PUBLIC ROUTES ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- PROTECTED ROUTES (Requires VIP Token) ---
Route::middleware('auth:sanctum')->group(function () {
    
    // Vehicle Route
    Route::post('/vehicles', [VehicleController::class, 'registerVehicle']);
    
    // Fuel Quota Routes
    Route::get('/quota', [FuelController::class, 'getQuota']);
    Route::get('/history', [FuelController::class, 'getHistory']);

    Route::post('/stations', [StationController::class, 'setupStation']);
    Route::post('/stations/scan', [StationController::class, 'deductFuel']);

    Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
    Route::get('/admin/stations', [AdminController::class, 'getAllStations']);
    Route::get('/admin/transactions', [AdminController::class, 'getAllTransactions']);

    Route::get('/vehicle', [VehicleController::class, 'getVehicle']);

    Route::get('/station', [StationController::class, 'getStation']);
    
});