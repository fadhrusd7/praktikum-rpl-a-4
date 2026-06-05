<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'username',
        'email',
        'password',
        'nama_depan',    
        'nama_belakang',
        'no_telepon',    
        'kota',
        'foto_profil',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'created_at'        => 'datetime',
    ];

    public function reports()
    {
        return $this->hasMany(Report::class, 'user_id');
    }

    public function getFotoProfilUrlAttribute()
    {
        if (!$this->foto_profil) {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $this->foto_profil)) {
            return $this->foto_profil;
        }

        $bucket = trim((string) env('SUPABASE_PROFILE_BUCKET', 'profile-photos'), '/');
        $path = ltrim($this->foto_profil, '/');

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
