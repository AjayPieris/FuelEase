<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Station extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'location',
        'district',
        'is_available',
        'document_url',
        'approval_status',
        'rejection_reason',
    ];

    /**
     * The user that owns this station.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}