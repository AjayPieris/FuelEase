<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\FuelController;
use App\Http\Controllers\StationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\UploadController;
use App\Http\Controllers\RegistryController;

// --- PUBLIC ROUTES ---
Route::post('/register',  [AuthController::class, 'register']);
Route::post('/login',     [AuthController::class, 'login']);
Route::post('/upload',    [UploadController::class, 'uploadImage']);
Route::get('/stations',   [StationController::class, 'getPublicStations']);

// --- PROTECTED ROUTES (Requires Token) ---
Route::middleware('auth:sanctum')->group(function () {

    // Vehicle
    Route::post('/vehicles', [VehicleController::class, 'registerVehicle']);
    Route::get('/vehicle',   [VehicleController::class, 'getVehicle']);

    // Fuel Quota & History
    Route::get('/quota',   [FuelController::class, 'getQuota']);
    Route::get('/history', [FuelController::class, 'getHistory']);

    // Station
    Route::get('/station',           [StationController::class, 'getStation']);
    Route::post('/stations',         [StationController::class, 'setupStation']);
    Route::post('/stations/scan',    [StationController::class, 'deductFuel']);
    Route::post('/station/resubmit', [StationController::class, 'resubmitDocument']);
    Route::patch('/station/availability', [StationController::class, 'updateAvailability']);

    // Admin
    Route::get('/admin/users',                      [AdminController::class, 'getAllUsers']);
    Route::get('/admin/stations',                   [AdminController::class, 'getAllStations']);
    Route::get('/admin/transactions',               [AdminController::class, 'getAllTransactions']);
    Route::get('/admin/vehicles',                   [AdminController::class, 'getAllVehicles']);
    Route::post('/admin/stations/{id}/approve',     [AdminController::class, 'approveStation']);
    Route::post('/admin/stations/{id}/reject',      [AdminController::class, 'rejectStation']);
    Route::post('/admin/users/{id}/block',          [AdminController::class, 'blockUser']);
    Route::post('/admin/users/{id}/unblock',        [AdminController::class, 'unblockUser']);
    Route::post('/admin/vehicles/{id}/approve',     [AdminController::class, 'approveVehicle']);
    Route::post('/admin/vehicles/{id}/reject',      [AdminController::class, 'rejectVehicle']);

    // Registry (Admin)
    Route::post('/admin/registry/upload',                [RegistryController::class, 'uploadRegistry']);
    Route::get('/admin/registry/files',                  [RegistryController::class, 'getRegistryFiles']);
    Route::delete('/admin/registry/files/{id}',          [RegistryController::class, 'deleteRegistryFile']);
    Route::get('/admin/registry/files/{id}/entries',     [RegistryController::class, 'getRegistryEntries']);

    // Account Management
    Route::put('/account', [AuthController::class, 'updateAccount']);
});