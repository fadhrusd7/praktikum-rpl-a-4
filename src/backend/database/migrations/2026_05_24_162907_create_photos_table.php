<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('photos', function (Blueprint $table) {
            $table->id();
            
            // Foreign Key
            $table->foreignId('report_id')->constrained('reports')->onDelete('cascade');
            
            // File Information
            $table->string('file_path', 500);
            $table->string('file_type', 50);
            $table->integer('file_size');
            
            // Timestamps
            $table->timestamp('uploaded_at')->useCurrent();
            
            // Indexes
            $table->index('report_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('photos');
    }
};