<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stations', function (Blueprint $table) {
            $table->string('document_url')->nullable()->after('is_available');
            $table->enum('approval_status', ['pending', 'approved', 'rejected'])->default('pending')->after('document_url');
            $table->string('rejection_reason')->nullable()->after('approval_status');
        });
    }

    public function down(): void
    {
        Schema::table('stations', function (Blueprint $table) {
            $table->dropColumn(['document_url', 'approval_status', 'rejection_reason']);
        });
    }
};
