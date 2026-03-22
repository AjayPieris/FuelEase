<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistryEntry extends Model
{
    use HasFactory;

    protected $fillable = [
        'registry_file_id',
        'vehicle_number',
        'chassis_number',
        'nic_number',
        'full_name',
        'fuel_type',
    ];

    public function registryFile()
    {
        return $this->belongsTo(RegistryFile::class);
    }
}
