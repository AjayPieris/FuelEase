<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stations', function (Blueprint $table) {
            $table->string('is_available')->default('available')->change();
        });
    }

    public function down(): void
    {
        Schema::table('stations', function (Blueprint $table) {
            $table->boolean('is_available')->default(true)->change();
        });
    }
};
