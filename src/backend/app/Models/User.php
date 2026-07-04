<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, \App\Traits\BuildsSupabaseUrl;

    protected $table = 'users';

    protected $fillable = [
        'nama_lengkap',
        'email',
        'password',
        'email_verified_at',
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
        return $this->buildSupabasePublicUrl($this->foto_profil, 'profile_bucket');
    }
}
