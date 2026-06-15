<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class AuthController extends Controller
{
    /**
     * POST /api/auth/register
     * Registrasi user baru (US-07)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'nama_lengkap' => 'required|string|max:255',
            'email'    => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ], [
            'nama_lengkap.required'  => 'Nama Lengkap wajib diisi.',
            'email.required'     => 'Email wajib diisi.',
            'email.email'        => 'Format email tidak valid.',
            'email.unique'       => 'Email sudah digunakan.',
            'password.required'  => 'Password wajib diisi.',
            'password.min'       => 'Password minimal 8 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
        ]);

        try {
            $otp = $this->generateOtp();

            DB::table('registration_otps')
                ->where('email', $validated['email'])
                ->delete();

            DB::table('registration_otps')->insert([
                'nama_lengkap' => $validated['nama_lengkap'],
                'email'      => $validated['email'],
                'password'   => Hash::make($validated['password']),
                'otp'        => $otp,
                'attempts'   => 0,
                'expires_at' => now()->addMinutes(10),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->sendRegistrationOtpEmail($validated['email'], $otp);

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP registrasi telah dikirim ke email kamu.',
                'requires_otp' => true,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Registrasi gagal. Silakan coba lagi.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/auth/register/verify-otp
     * Buat akun setelah OTP email registrasi valid.
     */
    public function verifyRegisterOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        try {
            $pending = DB::table('registration_otps')
                ->where('email', $validated['email'])
                ->where('expires_at', '>', now())
                ->first();

            if (! $pending || ! hash_equals($pending->otp, $validated['otp'])) {
                if ($pending) {
                    DB::table('registration_otps')
                        ->where('id', $pending->id)
                        ->increment('attempts');
                }

                return response()->json([
                    'success' => false,
                    'message' => 'OTP tidak valid atau sudah kadaluarsa.',
                ], 422);
            }

            if (User::where('email', $pending->email)->exists()) {
                DB::table('registration_otps')->where('id', $pending->id)->delete();

                return response()->json([
                    'success' => false,
                    'message' => 'Email sudah digunakan.',
                ], 422);
            }

            $user = User::create([
                'nama_lengkap'      => $pending->nama_lengkap,
                'email'             => $pending->email,
                'password'          => $pending->password,
                'email_verified_at' => now(),
            ]);

            DB::table('registration_otps')->where('id', $pending->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Email berhasil diverifikasi. Akun berhasil dibuat.',
                'data'    => [
                    'id'         => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email'      => $user->email,
                    'created_at' => $user->created_at,
                ],
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal verifikasi OTP registrasi.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/auth/register/resend-otp
     */
    public function resendRegisterOtp(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email|exists:registration_otps,email',
        ]);

        try {
            $otp = $this->generateOtp();

            DB::table('registration_otps')
                ->where('email', $validated['email'])
                ->update([
                    'otp'        => $otp,
                    'attempts'   => 0,
                    'expires_at' => now()->addMinutes(10),
                    'updated_at' => now(),
                ]);

            $this->sendRegistrationOtpEmail($validated['email'], $otp);

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP baru telah dikirim ke email kamu.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim ulang OTP registrasi.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/auth/login
     * Login user (US-08)
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required'    => 'Email wajib diisi.',
            'email.email'       => 'Format email tidak valid.',
            'password.required' => 'Password wajib diisi.',
        ]);

        try {
            $user = User::where('email', $validated['email'])->first();

            if (! $user || ! Hash::check($validated['password'], $user->password)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Email atau password salah.',
                ], 401);
            }

            // Hapus token lama agar tidak menumpuk
            $user->tokens()->delete();

            $token = $user->createToken('user_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil.',
                'data'    => [
                    'id'       => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email'    => $user->email,
                    'role'     => 'user',
                ],
                'token' => $token,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Login gagal. Silakan coba lagi.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/auth/logout
     * Logout user — hapus token aktif (protected)
     */
    public function logout(Request $request)
    {
        try {
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Logout berhasil.',
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Logout gagal. Silakan coba lagi.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * GET /api/auth/me
     * Ambil data user yang sedang login (protected)
     */
    public function me(Request $request)
    {
        try {
            $user = $request->user();

            return response()->json([
                'success' => true,
                'data'    => [
                    'id'         => $user->id,
                    'nama_lengkap' => $user->nama_lengkap,
                    'email'      => $user->email,
                    'role'       => 'user',
                    'created_at' => $user->created_at,
                ],
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data user.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    private function generateOtp(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    private function sendRegistrationOtpEmail(string $email, string $otp): void
    {
        Mail::send([], [], function ($message) use ($email, $otp) {
            $message->to($email)
                ->subject('Kode OTP Registrasi - Lestari')
                ->html("
                    <h2>Verifikasi Email Lestari</h2>
                    <p>Kode OTP registrasi kamu adalah:</p>
                    <h1 style='letter-spacing: 8px; color: #2d6a4f;'>{$otp}</h1>
                    <p>Kode ini berlaku selama <strong>10 menit</strong>.</p>
                    <p>Jika kamu tidak mendaftar akun Lestari, abaikan email ini.</p>
                ");
        });
    }
}
