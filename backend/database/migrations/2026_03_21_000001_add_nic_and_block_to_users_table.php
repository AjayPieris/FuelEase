<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nic_number')->nullable()->unique()->after('role');
            $table->string('nic_image_url')->nullable()->after('nic_number');
            $table->boolean('is_blocked')->default(false)->after('nic_image_url');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nic_number', 'nic_image_url', 'is_blocked']);
        });
    }
};
