<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Report;
use App\Models\Photo;
use App\Models\Feedback;
use App\Models\ReportLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DummyDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Users
        $users = [];
        for ($i = 1; $i <= 10; $i++) {
            $users[] = User::create([
                'nama_lengkap' => "Pengguna Dummy $i",
                'email' => "user$i@example.com",
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'no_telepon' => '0812345678' . str_pad((string)$i, 2, '0', STR_PAD_LEFT),
                'kota' => 'Kota Dummy',
            ]);
        }

        // 2. Create Reports
        $kategoriList = ['infrastruktur', 'lingkungan', 'lalu_lintas', 'fasilitas_umum', 'lainnya'];
        $statusList = ['menunggu_validasi', 'divalidasi', 'diproses', 'selesai', 'ditolak'];
        
        foreach ($users as $user) {
            for ($j = 1; $j <= 3; $j++) { // 3 reports per user
                $kategori = $kategoriList[array_rand($kategoriList)];
                $status = $statusList[array_rand($statusList)];
                
                $latOffset = (rand(-50, 50) / 1000);
                $lngOffset = (rand(-50, 50) / 1000);
                
                $report = Report::create([
                    'user_id' => $user->id,
                    'nomor_laporan' => 'REP-' . strtoupper(Str::random(8)),
                    'judul' => "Laporan Masalah $kategori ke-$j dari " . $user->nama_lengkap,
                    'kategori' => $kategori,
                    'deskripsi' => "Ini adalah deskripsi dummy untuk laporan dengan kategori $kategori. Laporan ini dibuat secara otomatis untuk keperluan testing aplikasi paska reset database.",
                    'lokasi' => "Jalan Dummy No. $j, Kelurahan Dummy",
                    'latitude' => -6.200000 + $latOffset, // Sekitar Jakarta
                    'longitude' => 106.816666 + $lngOffset,
                    'status' => $status,
                    'is_anonymous' => rand(0, 1) ? 'true' : 'false',
                ]);

                // Create Dummy Photo
                Photo::create([
                    'report_id' => $report->id,
                    'file_path' => 'https://picsum.photos/seed/' . rand(1, 1000) . '/800/600',
                    'file_type' => 'image/jpeg',
                    'file_size' => rand(100000, 500000),
                ]);

                // Create Report Log
                ReportLog::create([
                    'report_id' => $report->id,
                    'status' => $status,
                    'aksi' => "Status diubah menjadi " . str_replace('_', ' ', $status),
                    'catatan' => $status === 'ditolak' ? 'Ditolak karena kurang spesifik.' : 'Laporan telah divalidasi.',
                ]);
            }

            // 3. Create Feedbacks
            Feedback::create([
                'user_id' => $user->id,
                'rating' => rand(3, 5),
                'komentar' => "Aplikasi ini sangat membantu! (Feedback otomatis ke-{$user->id})",
            ]);
        }
    }
}
