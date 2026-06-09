<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\ReportLog;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminReportController extends Controller
{
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
                            $userQuery->where('username', 'like', "%$search%")
                                ->orWhere('email', 'like', "%$search%");
                        });
                });
            }

            $reports = $query->paginate(10);

            return response()->json([
                'success' => true,
                'data' => collect($reports->items())->map(fn($r) => $this->formatReport($r)),
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
                'data' => $this->formatReport($report, withLogs: true),
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

            $report->update([
                'status' => $request->status,
                'admin_id' => $adminId,
                'alasan_penolakan' => $isVerified ? null : $request->alasan_penolakan,
                'validated_at' => now(),
            ]);

            ReportLog::create([
                'report_id' => $report->id,
                'admin_id' => $adminId,
                'status' => $request->status,
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

            return response()->json([
                'success' => true,
                'message' => $isVerified ? 'Laporan berhasil diverifikasi.' : 'Laporan berhasil ditolak.',
                'data' => $this->formatReport($report->fresh(['photos', 'user', 'admin', 'logs.admin']), withLogs: true),
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

            $report->update(['status' => $request->status]);

            ReportLog::create([
                'report_id' => $report->id,
                'admin_id' => $adminId,
                'status' => $request->status,
                'aksi' => $aksiMap[$request->status],
                'created_at' => now(),
            ]);

            $pesanNotif = "Status laporan '{$report->judul}' berubah menjadi " . ucfirst(str_replace('_', ' ', $request->status));
            if ($request->status === 'selesai') {
                $pesanNotif = "Laporan '{$report->judul}' telah diselesaikan, terima kasih atas laporannya";
            }

            Notification::create([
                'user_id' => $report->user_id,
                'report_id' => $report->id,
                'pesan' => $pesanNotif,
                'status_baru' => $request->status,
                'is_read' => 'false',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Status laporan berhasil diupdate.',
                'data' => $this->formatReport($report->fresh(['photos', 'user', 'admin', 'logs.admin']), withLogs: true),
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
            'alasan_penolakan' => $report->alasan_penolakan,
            'validated_at' => $report->validated_at,
            'created_at' => $report->created_at,
            'user' => $report->user ? [
                'id' => $report->user->id,
                'username' => $report->user->username,
                'email' => $report->user->email,
            ] : null,
            'admin' => $report->admin ? [
                'id' => $report->admin->id,
                'username' => $report->admin->username,
            ] : null,
            'photos' => $report->photos->map(fn($p) => [
                'id' => $p->id,
                'file_path' => $p->file_path,
                'url' => $p->file_url,
                'file_type' => $p->file_type,
                'file_size' => $p->file_size,
                'uploaded_at' => $p->uploaded_at,
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

    private function statusAliases(string $status): array
    {
        return match ($status) {
            'menunggu_validasi', 'tertunda', 'pending' => ['menunggu_validasi'],
            'terverifikasi', 'divalidasi', 'diproses', 'verified' => ['terverifikasi', 'divalidasi', 'diproses'],
            'selesai', 'done' => ['selesai'],
            'ditolak', 'rejected' => ['ditolak'],
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