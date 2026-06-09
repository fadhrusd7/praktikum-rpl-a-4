<?php
use App\Models\User;
use App\Models\Report;
use App\Models\Photo;
use App\Models\Feedback;
use App\Models\ReportLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

echo "Cleaning up old dummy reports and feedbacks...\n";
ReportLog::truncate();
Photo::truncate();
Report::query()->delete();
Feedback::query()->delete();

echo "Fetching users...\n";
$users = User::all();
if ($users->isEmpty()) {
    echo "No users found, generating dummy users...\n";
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
}

echo "Seeding reports with correct categories...\n";
$kategoriList = ['Sampah', 'Polusi', 'Banjir', 'Isu Air', 'Penebangan', 'Lainnya'];
$statusList = ['menunggu_validasi', 'divalidasi', 'diproses', 'selesai', 'ditolak'];

foreach ($users as $user) {
    for ($j = 1; $j <= 3; $j++) {
        $kategori = $kategoriList[array_rand($kategoriList)];
        $status = $statusList[array_rand($statusList)];
        
        $latOffset = (rand(-50, 50) / 1000);
        $lngOffset = (rand(-50, 50) / 1000);
        
        $report = Report::create([
            'user_id' => $user->id,
            'nomor_laporan' => 'REP-' . strtoupper(Str::random(8)),
            'judul' => "Laporan Masalah $kategori ke-$j dari " . $user->nama_lengkap,
            'kategori' => $kategori,
            'deskripsi' => "Ini adalah deskripsi dummy untuk laporan dengan kategori $kategori. Laporan ini dibuat secara otomatis untuk keperluan testing aplikasi.",
            'lokasi' => "Jalan Dummy No. $j, Kelurahan Dummy",
            'latitude' => -6.200000 + $latOffset,
            'longitude' => 106.816666 + $lngOffset,
            'status' => $status,
            'is_anonymous' => rand(0, 1) ? 'true' : 'false',
        ]);

        Photo::create([
            'report_id' => $report->id,
            'file_path' => 'https://picsum.photos/seed/' . rand(1, 1000) . '/800/600',
            'file_type' => 'image/jpeg',
            'file_size' => rand(100000, 500000),
        ]);

        ReportLog::create([
            'report_id' => $report->id,
            'status' => $status,
            'aksi' => "Status diubah menjadi " . str_replace('_', ' ', $status),
            'catatan' => $status === 'ditolak' ? 'Ditolak karena kurang spesifik.' : 'Laporan telah divalidasi.',
        ]);
    }

    Feedback::create([
        'user_id' => $user->id,
        'rating' => rand(3, 5),
        'komentar' => "Aplikasi ini sangat membantu! (Feedback otomatis ke-{$user->id})",
    ]);
}

echo "Done seeding.\n";
