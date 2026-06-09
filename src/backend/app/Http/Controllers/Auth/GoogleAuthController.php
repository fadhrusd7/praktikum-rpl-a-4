<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleAuthController extends Controller
{
    /**
     * GET /api/auth/google
     * Redirect ke halaman login Google
     */
    public function redirect()
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->redirect()
            ->getTargetUrl();

        return response()->json([
            'success' => true,
            'url'     => $url,
        ]);
    }

    /**
     * GET /api/auth/google/callback
     * Handle callback dari Google
     */
    public function callback()
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();

            // Cari atau buat user baru
            $user = User::firstOrCreate(
                ['email' => $googleUser->getEmail()],
                [
                    'nama_lengkap' => $googleUser->getName(),
                    'email'    => $googleUser->getEmail(),
                    'password' => Hash::make(Str::random(32)),
                ]
            );

            // Hapus token lama, buat token baru
            $user->tokens()->delete();
            $token = $user->createToken('google_token')->plainTextToken;

            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away($frontendUrl . '/users/auth/google-callback.html?token=' . $token . '&role=user');

        } catch (\Exception $e) {
            $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
            return redirect()->away($frontendUrl . '/users/auth/google-callback.html?error=1');
        }
    }
}