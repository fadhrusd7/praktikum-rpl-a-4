<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class NotificationController extends Controller
{
    /**
     * GET /api/notifications
     * Ambil semua notifikasi milik user yang sedang login
     */
    public function index()
    {
        try {
            $notifications = Notification::where('user_id', auth('sanctum')->id())
                ->orderBy('created_at', 'desc')
                ->limit(20)
                ->get();

            return response()->json([
                'success' => true,
                'data'    => $notifications->map(fn($n) => [
                    'id'         => $n->id,
                    'pesan'      => $n->pesan,
                    'status_baru'=> $n->status_baru,
                    'is_read'    => $n->is_read,
                    'report_id'  => $n->report_id,
                    'created_at' => $n->created_at,
                ]),
            ]);
        } catch (\Exception $e) {
            Log::error("Notification API Error (index): " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal mengambil notifikasi.'], 500);
        }
    }

    /**
     * GET /api/notifications/unread-count
     * Hitung notifikasi belum dibaca (is_read = 'false' untuk PostgreSQL fallback)
     */
    public function unreadCount()
    {
        try {
            $count = Notification::where('user_id', auth('sanctum')->id())
                ->where('is_read', false)
                ->count();

            return response()->json([
                'success' => true,
                'count'   => $count,
            ]);
        } catch (\Exception $e) {
            Log::error("Notification API Error (unreadCount): " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal menghitung notifikasi.'], 500);
        }
    }

    /**
     * POST /api/notifications/mark-read
     */
    public function markAllRead()
    {
        try {
            Notification::where('user_id', auth('sanctum')->id())
                ->where('is_read', false)
                ->update(['is_read' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Semua notifikasi sudah ditandai dibaca.',
            ]);
        } catch (\Exception $e) {
            Log::error("Notification API Error (markAllRead): " . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Gagal menandai notifikasi.'], 500);
        }
    }
}
