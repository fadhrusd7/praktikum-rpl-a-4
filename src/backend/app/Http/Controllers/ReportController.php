<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Photo;
use App\Http\Requests\StoreReportRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ReportController extends Controller
{
    /**
     * POST /api/reports
     * User buat laporan baru (US-01, US-04)
     */
    public function store(StoreReportRequest $request)
    {
        try {
            $validated = $request->validated();

            $report = Report::create([
                'user_id'   => auth('sanctum')->id(),
                'judul'     => $validated['judul'],
                'kategori'  => $validated['kategori'],
                'deskripsi' => $validated['deskripsi'],
                'lokasi'    => $validated['lokasi'],
                'latitude'  => $validated['latitude'],
                'longitude' => $validated['longitude'],
                'status'    => 'menunggu_validasi',
            ]);

            if ($request->hasFile('foto')) {
                $file = $request->file('foto');
                $path = Storage::disk('supabase')->putFile('reports', $file, 'public');
                Photo::create([
                    'report_id' => $report->id,
                    'file_path' => $path,
                    'file_type' => $file->getMimeType(),
                    'file_size' => $file->getSize(),
                ]);
            }

            $report->load('photos');

            return response()->json([
                'success' => true,
                'message' => 'Laporan berhasil dibuat.',
                'data'    => $this->formatReport($report),
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat laporan.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/reports/{id}
     * User lihat detail laporan miliknya (US-03)
     */
    public function show($id)
    {
        try {
            $report = Report::where('id', $id)
                ->where('user_id', auth('sanctum')->id())
                ->with('user', 'photos', 'logs')
                ->first();

            if (!$report) {
                return response()->json([
                    'success' => false,
                    'message' => 'Laporan tidak ditemukan.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data'    => $this->formatReport($report, withLogs: true),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail laporan.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
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
                'data'    => collect($reports->items())->map(fn($r) => $this->formatReport($r)),
                'meta'    => [
                    'total'        => $reports->total(),
                    'per_page'     => $reports->perPage(),
                    'current_page' => $reports->currentPage(),
                    'last_page'    => $reports->lastPage(),
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil laporan.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
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
                ->select(['id', 'user_id', 'nomor_laporan', 'judul', 'kategori', 'deskripsi', 'lokasi', 'latitude', 'longitude', 'status', 'created_at'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $reports->map(fn($report) => $this->formatReport($report)),
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data peta.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Helper: format report untuk response
     */
    private function formatReport(Report $report, bool $withLogs = false): array
    {
        $data = [
            'id'            => $report->id,
            'nomor_laporan' => $report->nomor_laporan,
            'judul'         => $report->judul,
            'kategori'      => $report->kategori,
            'deskripsi'     => $report->deskripsi,
            'lokasi'        => $report->lokasi,
            'latitude'      => $report->latitude,
            'longitude'     => $report->longitude,
            'status'        => $report->status,
            'created_at'    => $report->created_at,
            'user'          => $report->user ? [
                'id'    => $report->user->id,
                'nama'  => $report->user->nama_depan . ' ' . $report->user->nama_belakang,
                'email' => $report->user->email,
            ] : null,
            'photos'        => $report->photos->map(fn($photo) => [
                'id'          => $photo->id,
                'file_path'   => $photo->file_path,
                'url'         => $photo->file_url,
                'file_type'   => $photo->file_type,
                'file_size'   => $photo->file_size,
                'uploaded_at' => $photo->uploaded_at,
            ]),
        ];

        if ($withLogs) {
            $data['logs'] = $report->logs->map(fn($log) => [
                'aksi'       => $log->aksi,
                'status'     => $log->status,
                'catatan'    => $log->catatan,
                'created_at' => $log->created_at,
            ]);
        }

        return $data;
    }
}