<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('password_reset_otps')) {
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE password_reset_otps ALTER COLUMN otp TYPE VARCHAR(64)');
        } elseif (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE password_reset_otps MODIFY otp VARCHAR(64)');
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('password_reset_otps')) {
            return;
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE password_reset_otps ALTER COLUMN otp TYPE VARCHAR(6)');
        } elseif (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE password_reset_otps MODIFY otp VARCHAR(6)');
        }
    }
};
