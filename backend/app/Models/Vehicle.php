<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_number',
        'fuel_type',
        'qr_code',
        'status',
        'chassis_number',
        'full_name',
        'nic_number',
        'weekly_quota',
        'remaining_quota',
        'approval_method',
        'failure_reason',
    ];

    /**
     * The user that owns this vehicle.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}