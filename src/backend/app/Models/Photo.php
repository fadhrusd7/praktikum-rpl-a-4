<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'file_path',
        'file_type',
        'file_size',
    ];

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    // Relasi: Photo milik Report
    public function report(){
        return $this->belongsTo(Report::class, 'report_id');
    }

    // Get foto URL
    public function getFileUrlAttribute(){
        return config('app.supabase_url') . '/storage/v1/object/public/' . $this->file_path;
    }
}