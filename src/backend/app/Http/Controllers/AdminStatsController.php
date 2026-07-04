<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Support\Facades\DB;

class AdminStatsController extends Controller
{
    /**
     * GET /api/admin/stats
     */
    public function index()
    {
        try {
            $statusCounts = Report::selectRaw('status, count(*) as total')
                ->groupBy('status')
                ->pluck('total', 'status');

            $stats = [
                // Ringkasan status (untuk 4 card di dashboard)
                'total'             => $statusCounts->sum(),
                'menunggu_validasi' => $statusCounts['menunggu_validasi'] ?? 0,
                'terverifikasi'     => ($statusCounts['terverifikasi'] ?? 0) + ($statusCounts['divalidasi'] ?? 0),
                'ditolak'           => $statusCounts['ditolak'] ?? 0,
                'selesai'           => $statusCounts['selesai'] ?? 0,

                // Volume laporan 7 hari terakhir (untuk chart bar)
                'harian' => Report::select(
                        DB::raw('DATE(created_at) as tanggal'),
                        DB::raw('count(*) as total')
                    )
                    ->where('created_at', '>=', now()->subDays(6))
                    ->groupBy('tanggal')
                    ->orderBy('tanggal')
                    ->get()
                    ->toArray(),

                // Breakdown per kategori (untuk bar chart "Laporan per kategori")
                'per_kategori' => Report::select(
                        'kategori',
                        DB::raw('count(*) as total')
                    )
                    ->groupBy('kategori')
                    ->orderByDesc('total')
                    ->get(),
            ];

            return response()->json([
                'success' => true,
                'data'    => $stats,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/admin/profile-stats
     * Untuk halaman Profil Admin
     */
    public function profileStats()
    {
        try {
            $adminId = auth('sanctum')->id();

            return response()->json([
                'success' => true,
                'data'    => [
                    'laporan_diverifikasi' => Report::where('admin_id', $adminId)
                        ->whereIn('status', ['terverifikasi', 'divalidasi', 'selesai'])
                        ->count(),
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data profil.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }
}