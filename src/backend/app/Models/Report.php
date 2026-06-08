<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\ReportLog;

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
            // Auto-generate nomor_laporan
            $tanggal      = now()->format('dmY');
            $count        = Report::whereYear('created_at', now()->year)->count();
            $nomorUrut    = str_pad($count, 6, '0', STR_PAD_LEFT);
            $nomorLaporan = "LAP-{$tanggal}-{$nomorUrut}";

            $report->update(['nomor_laporan' => $nomorLaporan]);

            // Auto-log: laporan diterima sistem
            ReportLog::create([
                'report_id'  => $report->id,
                'admin_id'   => null,
                'status'     => 'menunggu_validasi',
                'aksi'       => 'Laporan diterima sistem',
                'catatan'    => null,
                'created_at' => now(),
            ]);
        });
    }

    // RELASI
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function admin()
    {
        return $this->belongsTo(Admin::class, 'admin_id');
    }

    public function photos()
    {
        return $this->hasMany(Photo::class, 'report_id');
    }

    public function logs()
    {
        return $this->hasMany(ReportLog::class, 'report_id')->orderBy('created_at', 'asc');
    }

    // SCOPES
    public function scopeVerified($query)
    {
        return $query->where('status', 'terverifikasi');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'menunggu_validasi');
    }

    // HELPERS
    public function isPending(): bool
    {
        return $this->status === 'menunggu_validasi';
    }

    public function isVerified(): bool
    {
        return $this->status === 'terverifikasi';
    }

    public function isRejected(): bool
    {
        return $this->status === 'ditolak';
    }

    public function isDone(): bool
    {
        return $this->status === 'selesai';
    }
}