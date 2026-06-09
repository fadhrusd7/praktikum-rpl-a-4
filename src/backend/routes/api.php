<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AdminStatsController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\NotificationController;

// PUBLIC

// Auth User
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/register/verify-otp', [AuthController::class, 'verifyRegisterOtp']);
    Route::post('/register/resend-otp', [AuthController::class, 'resendRegisterOtp']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::get('/google',           [GoogleAuthController::class, 'redirect']);    
    Route::get('/google/callback',  [GoogleAuthController::class, 'callback']);    
    Route::post('/forgot-password',  [ForgotPasswordController::class, 'sendOtp']);     
    Route::post('/verify-otp',       [ForgotPasswordController::class, 'verifyOtp']);   
    Route::post('/reset-password',   [ForgotPasswordController::class, 'resetPassword']); 
});

// Auth Admin
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
});

// Peta publik (US-02)
Route::get('/reports/map', [ReportController::class, 'map']);

// USER
Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/reports',      [ReportController::class, 'store']);
    Route::get('/reports/my',    [ReportController::class, 'myReports']);
    Route::get('/reports/{id}',  [ReportController::class, 'show']);
    Route::get('/user/stats',   [UserController::class, 'stats']);
    Route::get('/user/profile',     [UserController::class, 'profile']);      
    Route::put('/user/profile',     [UserController::class, 'updateProfile']);
    Route::post('/user/profile',    [UserController::class, 'updateProfile']);
    Route::put('/user/change-password',  [UserController::class, 'changePassword']);
    Route::delete('/user/account',       [UserController::class, 'deleteAccount']);
    
    // Feedback (User buat feedback)
    Route::post('/feedbacks', [FeedbackController::class, 'store']);

    // Notifikasi
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/mark-read', [NotificationController::class, 'markAllRead']);
});

// ADMIN
Route::prefix('admin')->middleware(['auth:sanctum', 'is.admin'])->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me',      [AdminAuthController::class, 'me']);

    Route::get('/stats',         [AdminStatsController::class, 'index']);
    Route::get('/profile-stats', [AdminStatsController::class, 'profileStats']);

    Route::get('/reports',                 [AdminReportController::class, 'index']);
    Route::get('/reports/{id}',            [AdminReportController::class, 'show']);
    Route::patch('/reports/{id}/validate', [AdminReportController::class, 'validate']);
    Route::patch('/reports/{id}/status',   [AdminReportController::class, 'updateStatus']);
    Route::delete('/reports/{id}',         [AdminReportController::class, 'destroy']);
    
    // Feedback Management
    Route::get('/feedbacks/stats',   [FeedbackController::class, 'stats']);
    Route::get('/feedbacks',         [FeedbackController::class, 'index']);
    Route::delete('/feedbacks/{id}', [FeedbackController::class, 'destroy']);
});
