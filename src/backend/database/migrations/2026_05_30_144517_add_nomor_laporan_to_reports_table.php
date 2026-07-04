<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// TUGAS 4: Migration untuk kolom nomor_laporan
// Format: LAP-[DDMMYYYY]-[ID 4 digit]
// Contoh: LAP-30052026-0004

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->string('nomor_laporan', 22)
                  ->nullable()
                  ->unique()
                  ->after('id')
                  ->comment('Format: LAP-DDMMYYYY-XXXXXX');
        });
    }

    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn('nomor_laporan');
        });
    }
};