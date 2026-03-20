<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\VehicleController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::middleware('auth:sanctum')->group(function () { 
    Route::post('/vehicles', [VehicleController::class, 'registerVehicle']);

    Route::get('/quota', [FuelController::class, 'getQuota']);
    Route::get('/history', [FuelController::class, 'getHistory']);
});