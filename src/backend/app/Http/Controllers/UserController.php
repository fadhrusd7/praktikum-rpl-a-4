<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    /**
     * GET /api/user/stats
     */
    public function stats()
    {
        try {
            $userId = auth('sanctum')->id();

            return response()->json([
                'success' => true,
                'data'    => [
                    'total'             => Report::where('user_id', $userId)->count(),
                    'terverifikasi'     => Report::where('user_id', $userId)->where('status', 'terverifikasi')->count(),
                    'menunggu_validasi' => Report::where('user_id', $userId)->where('status', 'menunggu_validasi')->count(),
                    'ditolak'           => Report::where('user_id', $userId)->where('status', 'ditolak')->count(),
                    'selesai'           => Report::where('user_id', $userId)->where('status', 'selesai')->count(),
                ],
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
     * GET /api/user/profile
     */
    public function profile(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'data'    => [
                    'id'           => $user->id,
                    'username'     => $user->username,
                    'nama_depan'   => $user->nama_depan,
                    'nama_belakang'=> $user->nama_belakang,
                    'no_telepon'   => $user->no_telepon,
                    'kota'         => $user->kota,
                    'email'        => $user->email,
                    'created_at'   => $user->created_at,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil profil.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * PUT /api/user/profile
     */
    public function updateProfile(Request $request)
    {
        $request->validate([
            'nama_depan'    => 'nullable|string|max:100',
            'nama_belakang' => 'nullable|string|max:100',
            'no_telepon'    => 'nullable|string|max:20',
            'kota'          => 'nullable|string|max:100',
            'username'      => 'nullable|string|max:255|unique:users,username,' . $request->user()->id,
        ]);

        try {
            $user = $request->user();

            $user->update($request->only([
                'username',
                'nama_depan',
                'nama_belakang',
                'no_telepon',
                'kota',
            ]));

            return response()->json([
                'success' => true,
                'message' => 'Profil berhasil diupdate.',
                'data'    => [
                    'id'            => $user->id,
                    'username'      => $user->username,
                    'nama_depan'    => $user->nama_depan,
                    'nama_belakang' => $user->nama_belakang,
                    'no_telepon'    => $user->no_telepon,
                    'kota'          => $user->kota,
                    'email'         => $user->email,
                ],
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengupdate profil.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * PUT /api/user/change-password
     */
    public function changePassword(Request $request)
    {
        $request->validate([
            'password_lama'    => 'required|string',
            'password_baru'    => 'required|string|min:6|confirmed',
            'password_baru_confirmation' => 'required|string',
        ]);

        try {
            $user = $request->user();

            // Cek password lama
            if (!Hash::check($request->password_lama, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password lama tidak sesuai.',
                ], 422);
            }

            $user->update([
                'password' => Hash::make($request->password_baru),
            ]);

            $user->tokens()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil diubah. Silakan login kembali.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengubah password.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * DELETE /api/user/account
     */
    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        try {
            $user = $request->user();

            // Konfirmasi password sebelum hapus
            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Password tidak sesuai.',
                ], 422);
            }

            // Hapus semua token
            $user->tokens()->delete();

            // Hapus akun
            $user->delete();

            return response()->json([
                'success' => true,
                'message' => 'Akun berhasil dihapus.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus akun.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }
}