<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Exception;

class AdminAuthController extends Controller
{
    /**
     * POST /api/admin/login
     * Login khusus admin (US-09)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'email'    => 'required|email|max:255',
                'password' => 'required|string|min:6|max:255',
            ]);

            $admin = Admin::where('email', $validated['email'])->first();

            // Verifikasi 
            if (!$admin || !Hash::check($validated['password'], $admin->password)) {
                Log::warning('Failed admin login attempt', [
                    'email' => $validated['email'],
                    'ip'    => $request->ip(),
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password admin salah.',
                ], 401);
            }

            // Hapus token lama 
            $admin->tokens()->delete();

            // Buat token baru
            $token = $admin->createToken('admin_token')->plainTextToken;

            Log::info('Admin login successful', [
                'admin_id' => $admin->id,
                'email'    => $admin->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Login admin berhasil.',
                'data'    => [
                    'id'       => $admin->id,
                    'username' => $admin->username,
                    'email'    => $admin->email,
                    'role'     => 'admin',
                ],
                'token' => $token,
            ], 200);

        } catch (ValidationException $e) {
            Log::warning('Login validation failed', [
                'errors' => $e->errors(),
                'ip'     => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal.',
                'errors'  => $e->errors(),
            ], 422);

        } catch (Exception $e) {
            Log::error('Login error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    /**
     * POST /api/admin/logout
     * Logout admin (protected)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        try {
            $admin = $request->user();
            
            $admin->currentAccessToken()->delete();

            Log::info('Admin logout successful', [
                'admin_id' => $admin->id,
                'email'    => $admin->email,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logout admin berhasil.',
            ], 200);

        } catch (Exception $e) {
            Log::error('Logout error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }

    /**
     * GET /api/admin/me
     * Ambil data admin yang sedang login (protected)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function me(Request $request)
    {
        try {
            $admin = $request->user();

            if (!$admin) {
                return response()->json([
                    'success' => false,
                    'message' => 'Admin tidak ditemukan.',
                ], 404);
            }

            Log::info('Admin profile retrieved', [
                'admin_id' => $admin->id,
            ]);

            return response()->json([
                'success' => true,
                'data'    => [
                    'id'         => $admin->id,
                    'username'   => $admin->username,
                    'email'      => $admin->email,
                    'role'       => 'admin',
                    'created_at' => $admin->created_at,
                ],
            ], 200);

        } catch (Exception $e) {
            Log::error('Profile retrieval error', [
                'message' => $e->getMessage(),
                'trace'   => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server.',
            ], 500);
        }
    }
}