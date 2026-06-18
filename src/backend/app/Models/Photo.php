<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    use HasFactory, \App\Traits\BuildsSupabaseUrl;

    protected $fillable = [
        'report_id',
        'file_path',
        'file_type',
        'file_size',
    ];

    const CREATED_AT = 'uploaded_at';
    const UPDATED_AT = null;

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    // Relasi: Photo milik Report
    public function report()
    {
        return $this->belongsTo(Report::class, 'report_id');
    }

    // Get foto URL
    public function getFileUrlAttribute()
    {
        return $this->buildSupabasePublicUrl($this->file_path, 'bucket');
    }
}