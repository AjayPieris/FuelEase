<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registry_entries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registry_file_id')->constrained()->onDelete('cascade');
            $table->string('vehicle_number');
            $table->string('chassis_number')->nullable();
            $table->string('nic_number')->nullable();
            $table->string('full_name')->nullable();
            $table->string('fuel_type')->nullable();
            $table->timestamps();

            $table->index('vehicle_number');
            $table->index('nic_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registry_entries');
    }
};
