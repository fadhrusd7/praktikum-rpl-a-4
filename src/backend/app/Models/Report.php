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
        'nomor_laporan',
        'judul',
        'kategori',
        'deskripsi',
        'lokasi',
        'latitude',
        'longitude',
        'status',
        'alasan_penolakan',
        'validated_at',
    ];

    protected $casts = [
        'latitude'     => 'float',
        'longitude'    => 'float',
        'validated_at' => 'datetime',
        'created_at'   => 'datetime',
        'updated_at'   => 'datetime',
    ];

    protected static function booted(): void
    {
        static::created(function (Report $report) {
            $tanggal   = now()->format('dmY');

            // Hitung laporan di tahun yang sama → reset per tahun
            $count     = Report::whereYear('created_at', now()->year)->count();
            $nomorUrut = str_pad($count, 6, '0', STR_PAD_LEFT);

            $nomorLaporan = "LAP-{$tanggal}-{$nomorUrut}";
            $report->update(['nomor_laporan' => $nomorLaporan]);
        });
    }

    // Report milik User
    public function user(){
        return $this->belongsTo(User::class, 'user_id');
    }

    // Report ditangani Admin
    public function admin(){
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    // Report punya banyak Photo
    public function photos(){
        return $this->hasMany(Photo::class, 'report_id');
    }


    // Hanya laporan terverifikasi (untuk peta publik)
    public function scopeVerified($query){
        return $query->where('status', 'terverifikasi');
    }

    // Hanya laporan menunggu validasi
    public function scopePending($query){
        return $query->where('status', 'menunggu_validasi');
    }

    public function isPending(): bool{
        return $this->status === 'menunggu_validasi';
    }

    public function isVerified(): bool{
        return $this->status === 'terverifikasi';
    }

    public function isRejected(): bool{
        return $this->status === 'ditolak';
    }

    public function isDone(): bool{
        return $this->status === 'selesai';
    }
}