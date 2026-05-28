<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'admin_id',
        'judul',
        'deskripsi',
        'lokasi',
        'latitude',
        'longitude',
        'status',
        'alasan_penolakan',
        'validated_at',
    ];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
        'validated_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relasi: Report milik User
    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }

    // Relasi: Report ditangani Admin
    public function admin(){
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    // Relasi: Report punya banyak Photo
    public function photos(){
        return $this->hasMany(Photo::class, 'report_id');
    }

    // Scope: Report yang sudah terverifikasi
    public function scopeVerified($query){
        return $query->where('status', 'divalidasi')
                     ->orWhere('status', 'diproses')
                     ->orWhere('status', 'selesai');
    }

    // Scope: Report yang menunggu validasi
    public function scopePending($query){
        return $query->where('status', 'menunggu_validasi');
    }

    // Check status
    public function isVerified(){
        return in_array($this->status, ['divalidasi', 'diproses', 'selesai']);
    }

    public function isPending(){
        return $this->status === 'menunggu_validasi';
    }

    public function isRejected(){
        return $this->status === 'ditolak';
    }
}