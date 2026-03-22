<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->string('status')->default('pending')->after('qr_code'); // pending, approved, rejected
            $table->string('chassis_number')->nullable()->after('fuel_type');
            $table->string('full_name')->nullable()->after('chassis_number');
            $table->string('nic_number')->nullable()->after('full_name');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn(['status', 'chassis_number', 'full_name', 'nic_number']);
        });
    }
};
