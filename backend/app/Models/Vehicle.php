<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['user_id', 'vehicle_number', 'fuel_type', 'qr_code'])]
class Vehicle extends Model
{
    use HasFactory;
}