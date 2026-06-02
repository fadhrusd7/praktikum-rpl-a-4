<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ForgotPasswordController extends Controller
{
    /**
     * POST /api/auth/forgot-password
     * Kirim OTP ke email
     */
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        try {
            // Generate OTP 6 digit
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

            // Hapus OTP lama untuk email ini
            DB::table('password_reset_otps')
                ->where('email', $request->email)
                ->delete();

            // Simpan OTP baru (expired 10 menit)
            DB::table('password_reset_otps')->insert([
                'email'      => $request->email,
                'otp'        => $otp,
                'used'       => false,
                'expires_at' => now()->addMinutes(10),
                'created_at' => now(),
            ]);

            // Kirim email
            Mail::send([], [], function ($message) use ($request, $otp) {
                $message->to($request->email)
                    ->subject('Kode OTP Reset Password - Lestari')
                    ->html("
                        <h2>Reset Password Lestari</h2>
                        <p>Kode OTP kamu adalah:</p>
                        <h1 style='letter-spacing: 8px; color: #2d6a4f;'>{$otp}</h1>
                        <p>Kode ini berlaku selama <strong>10 menit</strong>.</p>
                        <p>Jika kamu tidak meminta reset password, abaikan email ini.</p>
                    ");
            });

            return response()->json([
                'success' => true,
                'message' => 'Kode OTP telah dikirim ke email kamu.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim OTP.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/auth/verify-otp
     * Verifikasi OTP
     */
    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp'   => 'required|string|size:6',
        ]);

        try {
            $record = DB::table('password_reset_otps')
                ->where('email', $request->email)
                ->where('otp', $request->otp)
                ->where('used', false)
                ->where('expires_at', '>', now())
                ->first();

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'OTP tidak valid atau sudah kadaluarsa.',
                ], 422);
            }

            // Generate reset token sementara
            $resetToken = Str::random(64);

            // Tandai OTP sebagai used + simpan reset token
            DB::table('password_reset_otps')
                ->where('email', $request->email)
                ->update([
                    'used' => true,
                    'otp'  => $resetToken, // reuse kolom untuk simpan token
                ]);

            return response()->json([
                'success'     => true,
                'message'     => 'OTP valid.',
                'reset_token' => $resetToken,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal verifikasi OTP.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * POST /api/auth/reset-password
     * Reset password dengan token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'                 => 'required|email',
            'reset_token'           => 'required|string',
            'password'              => 'required|string|min:6|confirmed',
            'password_confirmation' => 'required|string',
        ]);

        try {
            $record = DB::table('password_reset_otps')
                ->where('email', $request->email)
                ->where('otp', $request->reset_token)
                ->where('used', true)
                ->first();

            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'Token tidak valid.',
                ], 422);
            }

            // Update password user
            $user = User::where('email', $request->email)->first();
            $user->update([
                'password' => Hash::make($request->password),
            ]);

            // Hapus semua token lama → paksa login ulang
            $user->tokens()->delete();

            // Hapus record OTP
            DB::table('password_reset_otps')
                ->where('email', $request->email)
                ->delete();

            return response()->json([
                'success' => true,
                'message' => 'Password berhasil direset. Silakan login kembali.',
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal reset password.',
                'error'   => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }
}