<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_otps', function (Blueprint $table) {
            $table->id();
            $table->string('username', 100);
            $table->string('email', 255)->unique();
            $table->string('password');
            $table->string('otp', 6);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_otps');
    }
};
