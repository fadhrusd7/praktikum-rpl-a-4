<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            
            // Foreign Keys
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('admin_id')->nullable()->constrained('admins')->onDelete('set null');
            
            // Report Data
            $table->string('judul', 255);
            $table->text('deskripsi');
            $table->string('lokasi', 255);
            $table->decimal('latitude', 11, 8);
            $table->decimal('longitude', 11, 8);
            
            // Status Management
            $table->enum('status', [
                'menunggu_validasi',
                'divalidasi',
                'ditolak',
                'diproses',
                'selesai'
            ])->default('menunggu_validasi');
            
            // Rejection Reason 
            $table->text('alasan_penolakan')->nullable();
            
            // Timestamps
            $table->timestamp('validated_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->nullable();
            
            // Indexes untuk query optimization
            $table->index('user_id');
            $table->index('admin_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};