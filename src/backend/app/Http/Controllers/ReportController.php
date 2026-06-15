<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Photo;
use App\Http\Requests\StoreReportRequest;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * POST /api/reports
     * User buat laporan baru (US-01, US-04)
     */
    public function store(StoreReportRequest $request)
    {
        // Beri waktu lebih untuk kompresi + upload foto ke Supabase
        set_time_limit(120);

        try {
            $validated = $request->validated();

            // ── 1. Cek duplikat berdasarkan radius & kategori ──────────────
            $duplicate = $this->findNearestDuplicate(
                (float) $validated['latitude'],
                (float) $validated['longitude'],
                $validated['kategori']
            );

            if ($duplicate) {
                return response()->json([
                    'success' => false,
                    'message' => 'Sudah ada laporan serupa di sekitar lokasi ini. Silakan cek laporan yang sudah ada.',
                    // Debug info — hanya tampil di mode local
                    'debug' => app()->isLocal() ? [
                        'laporan_id' => $duplicate['id'],
                        'nomor_laporan' => $duplicate['nomor_laporan'],
                        'kategori' => $duplicate['kategori'],
                        'jarak_meter' => round($duplicate['jarak'], 2),
                        'radius_meter' => (float) env('REPORT_DUPLICATE_RADIUS_METER', 20),
                        'status' => $duplicate['status'],
                        'created_at' => $duplicate['created_at'],
                    ] : null,
                ], 409);
            }

            // ── 2. Kompres foto terlebih dahulu (sebelum DB) ───────────────
            $compressed = null;
            if ($request->hasFile('foto')) {
                $compressed = $this->compressImage($request->file('foto'));
            }

            // ── 3. Simpan laporan + upload foto dalam satu transaksi ───────
            // Jika upload foto gagal, laporan ikut di-rollback (tidak orphan)
            $report = \DB::transaction(function () use ($validated, $compressed) {
                $report = Report::create([
                    'user_id' => auth('sanctum')->id(),
                    'judul' => $validated['judul'],
                    'kategori' => $validated['kategori'],
                    'deskripsi' => $validated['deskripsi'],
                    'lokasi' => $validated['lokasi'],
                    'latitude' => $validated['latitude'],
                    'longitude' => $validated['longitude'],
                    'status' => 'menunggu_validasi',
                    'is_anonymous' => filter_var($validated['is_anonymous'] ?? false, FILTER_VALIDATE_BOOLEAN),
                ]);

                if ($compressed) {
                    try {
                        $fileName = 'foto_' . uniqid() . '.' . $compressed['ext'];
                        $storagePath = 'reports/' . $fileName;

                        Storage::disk('supabase')->put(
                            $storagePath,
                            file_get_contents($compressed['path']),
                            'public'
                        );

                        Photo::create([
                            'report_id' => $report->id,
                            'file_path' => $storagePath,
                            'file_type' => $compressed['mime'],
                            'file_size' => $compressed['size'],
                        ]);
                    } finally {
                        // Hapus temp file meski terjadi error
                        if ($compressed['is_temp'] && file_exists($compressed['path'])) {
                            @unlink($compressed['path']);
                        }
                    }
                }

                return $report;
            });

            $report->load('photos');

            return response()->json([
                'success' => true,
                'message' => 'Laporan berhasil dibuat.',
                'data' => $this->formatReport($report),
            ], 201);

        } catch (\Exception $e) {
            \Log::error('Report Store Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat laporan.',
                'error' => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/reports/{id}
     * User lihat detail laporan miliknya ATAU laporan public yang terverifikasi (US-03 & US-02)
     */
    public function show($id)
    {
        try {
            $userId = auth('sanctum')->id();

            $report = Report::where('id', $id)
                ->where(function ($query) use ($userId) {
                    // Syarat 1: Milik user itu sendiri
                    $query->where('user_id', $userId)
                        // Syarat 2: ATAU statusnya terverifikasi/selesai (bisa dilihat publik/user lain)
                        ->orWhereIn('status', ['terverifikasi', 'divalidasi', 'selesai']);
                })
                ->with(['user', 'photos', 'admin', 'logs.admin']) // Load relasi admin dari logs
                ->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan tidak ditemukan atau Anda tidak memiliki akses untuk melihatnya.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $this->formatReport($report, withLogs: true),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail laporan.',
                'error' => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/reports/my
     * User lihat semua laporan miliknya (US-03)
     */
    public function myReports(Request $request)
    {
        try {
            $reports = Report::where('user_id', auth('sanctum')->id())
                ->with('user', 'photos')
                ->orderBy('created_at', 'desc')
                ->paginate(10);

            return response()->json([
                'success' => true,
                'data' => collect($reports->items())->map(fn($r) => $this->formatReport($r)),
                'meta' => [
                    'total' => $reports->total(),
                    'per_page' => $reports->perPage(),
                    'current_page' => $reports->currentPage(),
                    'last_page' => $reports->lastPage(),
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil laporan.',
                'error' => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/reports/map
     * Tampilkan laporan terverifikasi di peta (US-02, PUBLIC)
     */
    public function map()
    {
        try {
            $reports = Report::verified()
                ->with('user', 'photos')
                ->select(['id', 'user_id', 'nomor_laporan', 'judul', 'kategori', 'deskripsi', 'lokasi', 'latitude', 'longitude', 'status', 'is_anonymous', 'created_at'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reports->map(fn($report) => $this->formatReport($report)),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peta.',
                'error' => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Cek apakah ada laporan duplikat aktif dalam radius & kurun waktu tertentu.
     * Mengembalikan array info laporan terdekat, atau null jika tidak ada.
     *
     * Konfigurasi via .env:
     *   REPORT_DUPLICATE_RADIUS_METER  (default: 10)
     *   REPORT_DUPLICATE_DAYS          (default: 14)
     */
    private function findNearestDuplicate(float $latitude, float $longitude, string $kategori): ?array
    {
        $radiusMeters = (float) env('REPORT_DUPLICATE_RADIUS_METER', 20);
        $dayWindow = (int) env('REPORT_DUPLICATE_DAYS', 14);

        // Bounding box kasar untuk efisiensi SQL (1° ≈ 111.000 m)
        $degreeOffset = $radiusMeters / 111000;

        $candidates = Report::where('kategori', $kategori)
            ->whereNotIn('status', ['selesai', 'ditolak'])
            ->where('created_at', '>=', now()->subDays($dayWindow))
            ->whereBetween('latitude', [$latitude - $degreeOffset, $latitude + $degreeOffset])
            ->whereBetween('longitude', [$longitude - $degreeOffset, $longitude + $degreeOffset])
            ->select(['id', 'nomor_laporan', 'kategori', 'status', 'latitude', 'longitude', 'created_at'])
            ->get();

        $nearest = null;
        $nearestDist = PHP_FLOAT_MAX;

        foreach ($candidates as $candidate) {
            $distance = $this->haversineDistance(
                $latitude,
                $longitude,
                (float) $candidate->latitude,
                (float) $candidate->longitude
            );
            if ($distance <= $radiusMeters && $distance < $nearestDist) {
                $nearestDist = $distance;
                $nearest = [
                    'id' => $candidate->id,
                    'nomor_laporan' => $candidate->nomor_laporan,
                    'kategori' => $candidate->kategori,
                    'status' => $candidate->status,
                    'created_at' => $candidate->created_at,
                    'jarak' => $distance,
                ];
            }
        }

        return $nearest;
    }

    /**
     * Hitung jarak dua titik koordinat menggunakan formula Haversine.
     *
     * @return float Jarak dalam meter
     */
    private function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371000; // meter
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) ** 2
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2;

        return $earthRadius * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }

    /**
     * Kompres gambar ke ≤ REPORT_MAX_PHOTO_SIZE_KB KB menggunakan PHP GD (built-in).
     * Mendukung: image/jpeg, image/png, image/webp.
     *
     * - JPEG / WebP : kurangi kualitas secara iteratif (85 → 10)
     * - PNG          : lossless, kurangi dimensi secara iteratif (90% → 10%)
     *
     * @return array{path: string, ext: string, mime: string, size: int, is_temp: bool}
     */
    private function compressImage(UploadedFile $file): array
    {
        $maxKB = (int) env('REPORT_MAX_PHOTO_SIZE_KB', 512);
        $maxBytes = $maxKB * 1024;
        $mimeType = $file->getMimeType();
        $origPath = $file->getRealPath();
        $origSize = $file->getSize();

        $extMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];
        $ext = $extMap[$mimeType] ?? 'jpg';

        // Sudah di bawah batas — tidak perlu kompres
        if ($origSize <= $maxBytes) {
            return [
                'path' => $origPath,
                'ext' => $ext,
                'mime' => $mimeType,
                'size' => $origSize,
                'is_temp' => false,
            ];
        }

        // Load ke GD resource
        $image = match ($mimeType) {
            'image/jpeg' => @imagecreatefromjpeg($origPath),
            'image/png' => @imagecreatefrompng($origPath),
            'image/webp' => @imagecreatefromwebp($origPath),
            default => null,
        };

        // GD gagal load (format tidak didukung server) — upload apa adanya
        if (!$image) {
            return [
                'path' => $origPath,
                'ext' => $ext,
                'mime' => $mimeType,
                'size' => $origSize,
                'is_temp' => false,
            ];
        }

        $tempPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'rpt_' . uniqid() . '.' . $ext;

        try {
            if ($mimeType === 'image/jpeg' || $mimeType === 'image/webp') {
                // ── JPEG / WebP: kurangi kualitas ──────────────────────────
                $quality = 85;
                do {
                    if ($mimeType === 'image/jpeg') {
                        imagejpeg($image, $tempPath, $quality);
                    } else {
                        imagewebp($image, $tempPath, $quality);
                    }
                    $quality -= 10;
                } while (filesize($tempPath) > $maxBytes && $quality > 10);

            } elseif ($mimeType === 'image/png') {
                // ── PNG: lossless → kurangi dimensi ────────────────────────
                $origW = imagesx($image);
                $origH = imagesy($image);
                $scale = 0.9;

                do {
                    $newW = max(1, (int) ($origW * $scale));
                    $newH = max(1, (int) ($origH * $scale));
                    $canvas = imagecreatetruecolor($newW, $newH);
                    imagealphablending($canvas, false);
                    imagesavealpha($canvas, true);
                    imagecopyresampled($canvas, $image, 0, 0, 0, 0, $newW, $newH, $origW, $origH);
                    imagepng($canvas, $tempPath, 9); // level 9 = max zlib compression
                    imagedestroy($canvas);
                    $scale -= 0.1;
                } while (filesize($tempPath) > $maxBytes && $scale > 0.1);
            }
        } finally {
            imagedestroy($image);
        }

        return [
            'path' => $tempPath,
            'ext' => $ext,
            'mime' => $mimeType,
            'size' => filesize($tempPath),
            'is_temp' => true,
        ];
    }

    /**
     * Helper: format report untuk response
     */
    private function formatReport(Report $report, bool $withLogs = false): array
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
                'id' => $report->is_anonymous ? null : $report->user->id,
                'nama' => $report->is_anonymous ? 'Anonim' : $report->user->nama_lengkap,
                'nama_lengkap' => $report->is_anonymous ? 'Anonim' : $report->user->nama_lengkap,
                'email' => $report->is_anonymous ? 'anonim@lestari.com' : $report->user->email,
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
