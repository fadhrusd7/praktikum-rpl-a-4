<?php

namespace App\Http\Controllers;

use App\Models\Feedback;
use Illuminate\Http\Request;

class FeedbackController extends Controller
{
    /**
     * POST /api/feedbacks
     * User buat feedback/rating
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'rating'   => 'required|integer|between:1,5',
                'komentar' => 'nullable|string|max:1000',
            ]);

            $feedback = Feedback::create([
                'user_id'  => auth('sanctum')->id(),
                'rating'   => $validated['rating'],
                'komentar' => $validated['komentar'] ?? null,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Terima kasih atas feedback Anda!',
                'data'    => [
                    'id'         => $feedback->id,
                    'rating'     => $feedback->rating,
                    'komentar'   => $feedback->komentar,
                    'created_at' => $feedback->created_at,
                ],
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan feedback.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/feedbacks/stats
     * Admin lihat statistik feedback (rating, total, dll)
     */
    public function stats()
    {
        try {
            $stats = Feedback::selectRaw('rating, count(*) as count')
                ->groupBy('rating')
                ->pluck('count', 'rating');

            $totalFeedbacks = $stats->sum();
            $totalRatingScore = 0;
            foreach ($stats as $rating => $count) {
                $totalRatingScore += $rating * $count;
            }
            $avgRating = $totalFeedbacks > 0 ? $totalRatingScore / $totalFeedbacks : 0;

            $ratingDistribution = [
                '5' => $stats[5] ?? 0,
                '4' => $stats[4] ?? 0,
                '3' => $stats[3] ?? 0,
                '2' => $stats[2] ?? 0,
                '1' => $stats[1] ?? 0,
            ];

            return response()->json([
                'success' => true,
                'data'    => [
                    'total_feedbacks'      => $totalFeedbacks,
                    'average_rating'       => round($avgRating, 2),
                    'rating_distribution'  => $ratingDistribution,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik feedback.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/feedbacks
     * Admin lihat semua feedback (dengan pagination)
     */
    public function index(Request $request)
    {
        try {
            $feedbacks = Feedback::with('user')
                ->orderBy('created_at', 'desc')
                ->paginate(15);

            return response()->json([
                'success' => true,
                'data'    => $feedbacks->getCollection()->map(fn($fb) => [
                    'id'         => $fb->id,
                    'user'       => [
                        'id'    => $fb->user?->id,
                        'nama'  => $fb->user?->nama_lengkap,
                        'email' => $fb->user?->email,
                    ],
                    'rating'     => $fb->rating,
                    'komentar'   => $fb->komentar,
                    'created_at' => $fb->created_at,
                ])->values(),
                'meta'    => [
                    'total'        => $feedbacks->total(),
                    'per_page'     => $feedbacks->perPage(),
                    'current_page' => $feedbacks->currentPage(),
                    'last_page'    => $feedbacks->lastPage(),
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil daftar feedback.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * DELETE /api/feedbacks/{id}
     * Admin hapus feedback tertentu
     */
    public function destroy($id)
    {
        try {
            $feedback = Feedback::findOrFail($id);
            $feedback->delete();

            return response()->json([
                'success' => true,
                'message' => 'Feedback berhasil dihapus.',
            ], 200);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Feedback tidak ditemukan.',
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus feedback.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }
}
