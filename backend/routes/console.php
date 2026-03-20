<?php

use Illuminate\Support\Facades\Schedule;
use App\Models\FuelQuota;
use Illuminate\Support\Facades\DB;

// This tells Laravel to run this function automatically every week
Schedule::call(function () {
    
    // Update the remaining_quota to match the weekly_quota for EVERY user
    FuelQuota::query()->update([
        'remaining_quota' => DB::raw('weekly_quota')
    ]);

})->weekly();