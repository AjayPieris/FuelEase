<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistryFile extends Model
{
    use HasFactory;

    protected $fillable = ['file_name', 'total_records'];

    public function entries()
    {
        return $this->hasMany(RegistryEntry::class);
    }
}
