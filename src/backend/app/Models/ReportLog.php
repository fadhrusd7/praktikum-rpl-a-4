<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'report_id',
        'admin_id',
        'status',
        'aksi',
        'catatan',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function admin()
    {
        return $this->belongsTo(Admin::class);
    }

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}