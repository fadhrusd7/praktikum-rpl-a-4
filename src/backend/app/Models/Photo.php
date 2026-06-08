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

    const CREATED_AT = 'uploaded_at';
    const UPDATED_AT = null;

    protected $casts = [
        'uploaded_at' => 'datetime',
    ];

    // Relasi: Photo milik Report
    public function report(){
        return $this->belongsTo(Report::class, 'report_id');
    }

    // Get foto URL
    public function getFileUrlAttribute()
    {
        if (!$this->file_path) {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $this->file_path)) {
            return $this->file_path;
        }

        $bucket = trim((string) env('SUPABASE_BUCKET', ''), '/');
        $path = ltrim($this->file_path, '/');

        if ($bucket && str_starts_with($path, $bucket . '/')) {
            $path = substr($path, strlen($bucket) + 1);
        }

        $baseUrl = rtrim((string) env('SUPABASE_PUBLIC_URL', ''), '/');

        if (!$baseUrl) {
            $endpoint = rtrim((string) env('SUPABASE_ENDPOINT', ''), '/');
            $baseUrl = preg_replace(
                '#\.storage\.supabase\.co/storage/v1/s3$#',
                '.supabase.co',
                $endpoint
            );
        }

        if (!$baseUrl || !$bucket) {
            return null;
        }

        return "{$baseUrl}/storage/v1/object/public/{$bucket}/{$path}";
    }
}