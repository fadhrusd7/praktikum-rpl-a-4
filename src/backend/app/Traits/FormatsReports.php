<?php

namespace App\Traits;

use App\Models\Report;

trait FormatsReports
{
    /**
     * Format report for API response.
     *
     * @param Report $report
     * @param bool $withLogs
     * @param bool $isUserView
     * @return array
     */
    protected function formatReportData(Report $report, bool $withLogs = false, bool $isUserView = false): array
    {
        $data = [
            'id' => $report->id,
            'nomor_laporan' => $report->nomor_laporan,
            'judul' => $report->judul,
            'kategori' => $report->kategori,
            'deskripsi' => $report->deskripsi,
            'lokasi' => $report->lokasi,
            'latitude' => $report->latitude,
            'longitude' => $report->longitude,
            'status' => $report->status,
            'created_at' => $report->created_at,
            'validated_at' => $report->validated_at,
            'alasan_penolakan' => $report->alasan_penolakan,
            'user' => $report->user ? [
                'id' => ($isUserView && $report->is_anonymous) ? null : $report->user->id,
                'nama' => ($isUserView && $report->is_anonymous) ? 'Anonim' : $report->user->nama_lengkap,
                'nama_lengkap' => ($isUserView && $report->is_anonymous) ? 'Anonim' : $report->user->nama_lengkap,
                'email' => ($isUserView && $report->is_anonymous) ? 'anonim@lestari.com' : $report->user->email,
            ] : null,
            'admin' => $report->admin ? [
                'id' => $report->admin->id,
                'username' => $report->admin->username,
            ] : null,
            'photos' => $report->photos->map(fn($photo) => [
                'id' => $photo->id,
                'file_path' => $photo->file_path,
                'url' => $photo->file_url,
                'file_type' => $photo->file_type,
                'file_size' => $photo->file_size,
                'uploaded_at' => $photo->uploaded_at,
            ]),
        ];

        if ($withLogs) {
            $data['logs'] = $report->logs->map(fn($log) => [
                'aksi' => $log->aksi,
                'status' => $log->status,
                'catatan' => $log->catatan,
                'created_at' => $log->created_at,
                'admin' => $log->admin ? [
                    'id' => $log->admin->id,
                    'username' => $log->admin->username,
                ] : null,
            ]);
        }

        return $data;
    }
}
