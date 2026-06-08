<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nama_depan', 100)->nullable()->after('username');
            $table->string('nama_belakang', 100)->nullable()->after('nama_depan');
            $table->string('no_telepon', 20)->nullable()->after('nama_belakang');
            $table->string('kota', 100)->nullable()->after('no_telepon');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nama_depan', 'nama_belakang', 'no_telepon', 'kota']);
        });
    }
};