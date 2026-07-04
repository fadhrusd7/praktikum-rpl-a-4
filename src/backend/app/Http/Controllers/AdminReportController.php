<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
    use \App\Traits\FormatsReports;
    /**
     * GET /api/admin/reports
     */
    public function index(Request $request)
    {
        try {
            $query = Report::with('photos', 'user', 'admin')
                ->orderBy('created_at', 'desc');

            if ($request->filled('status')) {
                $query->whereIn('status', $this->statusAliases($request->status));
            }

            if ($request->filled('kategori')) {
                $query->where('kategori', $request->kategori);
            }

            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('judul', 'like', "%$search%")
                        ->orWhere('nomor_laporan', 'like', "%$search%")
                        ->orWhere('kategori', 'like', "%$search%")
                        ->orWhereHas('user', function ($userQuery) use ($search) {
                            $userQuery->where('nama_lengkap', 'like', "%$search%")
                                ->orWhere('email', 'like', "%$search%");
                        });
                });
            }

            $reports = $query->paginate(10);

            return response()->json([
                'success' => true,
                'data' => collect($reports->items())->map(fn($r) => $this->formatReportData($r)),
                'meta' => [
                    'total' => $reports->total(),
                    'per_page' => $reports->perPage(),
                    'current_page' => $reports->currentPage(),
                    'last_page' => $reports->lastPage(),
                ],
            ]);

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil data laporan.', $e);
        }
    }

    /**
     * GET /api/admin/reports/{id}
     */
    public function show($id)
    {
        try {
            $report = Report::with('photos', 'user', 'admin', 'logs.admin')
                ->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $this->formatReportData($report, true),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Laporan tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengambil detail laporan.', $e);
        }
    }

    /**
     * PATCH /api/admin/reports/{id}/validate
     * Verifikasi atau tolak laporan (hanya dari menunggu_validasi)
     */
    public function validate($id, Request $request)
    {
        $request->validate([
            'status' => 'required|in:terverifikasi,ditolak',
            'alasan_penolakan' => 'required_if:status,ditolak|nullable|string',
        ]);

        try {
            $report = Report::findOrFail($id);

            if ($report->status !== 'menunggu_validasi') {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan ini sudah diproses sebelumnya.',
                ], 422);
            }

            $adminId = auth('sanctum')->id();
            $isVerified = $request->status === 'terverifikasi';

            $dbStatus = $isVerified ? 'divalidasi' : $request->status;

            DB::transaction(function () use ($report, $adminId, $isVerified, $request, $dbStatus) {
                $report->update([
                    'status' => $dbStatus,
                    'admin_id' => $adminId,
                    'alasan_penolakan' => $isVerified ? null : $request->alasan_penolakan,
                    'validated_at' => now(),
                ]);

                ReportLog::create([
                    'report_id' => $report->id,
                    'admin_id' => $adminId,
                    'status' => $dbStatus,
                    'aksi' => $isVerified ? 'Laporan terverifikasi' : 'Laporan ditolak',
                    'catatan' => $isVerified ? null : $request->alasan_penolakan,
                    'created_at' => now(),
                ]);

                $pesanNotif = $isVerified
                    ? "Laporan '{$report->judul}' berhasil diverifikasi"
                    : "Laporan '{$report->judul}' ditolak. Alasan: {$request->alasan_penolakan}";

                Notification::create([
                    'user_id' => $report->user_id,
                    'report_id' => $report->id,
                    'pesan' => $pesanNotif,
                    'status_baru' => $request->status,
                    'is_read' => 'false',
                ]);
            });

            return response()->json([
                'success' => true,
                'message' => $isVerified ? 'Laporan berhasil diverifikasi.' : 'Laporan berhasil ditolak.',
                'data' => $this->formatReportData($report->fresh(['photos', 'user', 'admin', 'logs.admin']), true),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Laporan tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memvalidasi laporan.', $e);
        }
    }

    /**
     * PATCH /api/admin/reports/{id}/status
     * Update status bebas (misal: terverifikasi → selesai, atau → menunggu_validasi)
     */
    public function updateStatus($id, Request $request)
    {
        $request->validate([
            'status' => 'required|in:menunggu_validasi,terverifikasi,ditolak,selesai',
        ]);

        try {
            $report = Report::findOrFail($id);
            $adminId = auth('sanctum')->id();

            $aksiMap = [
                'menunggu_validasi' => 'Diubah ke Tertunda',
                'terverifikasi' => 'Laporan terverifikasi',
                'ditolak' => 'Laporan ditolak',
                'selesai' => 'Laporan diselesaikan',
            ];

            $dbStatus = $request->status === 'terverifikasi' ? 'divalidasi' : $request->status;
            DB::transaction(function () use ($report, $adminId, $dbStatus, $request, $aksiMap) {
                $report->update(['status' => $dbStatus]);

                ReportLog::create([
                    'report_id' => $report->id,
                    'admin_id' => $adminId,
                    'status' => $dbStatus,
                    'aksi' => $aksiMap[$request->status],
                    'created_at' => now(),
                ]);

                if ($request->status === 'selesai') {
                    Notification::create([
                        'user_id' => $report->user_id,
                        'report_id' => $report->id,
                        'pesan' => "Laporan '{$report->judul}' telah selesai ditindaklanjuti.",
                        'status_baru' => 'selesai',
                        'is_read' => 'false',
                    ]);
                } else {
                    $pesanNotif = "Status laporan '{$report->judul}' berubah menjadi " . ucfirst(str_replace('_', ' ', $request->status));
                    Notification::create([
                        'user_id' => $report->user_id,
                        'report_id' => $report->id,
                        'pesan' => $pesanNotif,
                        'status_baru' => $request->status,
                        'is_read' => 'false',
                    ]);
                }
            });

            return response()->json([
                'success' => true,
                'message' => 'Status laporan berhasil diupdate.',
                'data' => $this->formatReportData($report->fresh(['photos', 'user', 'admin', 'logs.admin']), true),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Laporan tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengupdate status.', $e);
        }
    }

    /**
     * DELETE /api/admin/reports/{id}
     */
    public function destroy($id)
    {
        try {
            $report = Report::findOrFail($id);
            $report->delete();

            return response()->json([
                'success' => true,
                'message' => 'Laporan berhasil dihapus.',
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['success' => false, 'message' => 'Laporan tidak ditemukan.'], 404);
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal menghapus laporan.', $e);
        }
    }

    // HELPER

    private function statusAliases(string $status): array
    {
        return match ($status) {
            'menunggu_validasi', 'tertunda', 'pending' => ['menunggu_validasi'],
            'terverifikasi', 'divalidasi', 'diproses', 'verified' => ['terverifikasi', 'divalidasi', 'diproses'],
            'selesai', 'done' => ['selesai'],
            'ditolak', 'rejected' => ['ditolak'],
            'riwayat', 'history' => ['terverifikasi', 'divalidasi', 'diproses', 'selesai', 'ditolak'],
            default => [$status],
        };
    }

    private function errorResponse(string $message, \Exception $e)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'error' => app()->isLocal() ? $e->getMessage() : null,
        ], 500);
    }
}