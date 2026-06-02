<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\AdminAuthController;
<<<<<<< HEAD


// PUBLIC ROUTES
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

=======
use App\Http\Controllers\Auth\GoogleAuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AdminReportController;
use App\Http\Controllers\AdminStatsController;

// PUBLIC

// Auth User
Route::prefix('auth')->group(function () {
    Route::post('/register',        [AuthController::class, 'register']);
    Route::post('/login',           [AuthController::class, 'login']);
    Route::get('/google',           [GoogleAuthController::class, 'redirect']);    // ← TAMBAH
    Route::get('/google/callback',  [GoogleAuthController::class, 'callback']);    // ← TAMBAH
});

// Auth Admin
>>>>>>> 22aa2134171d21cc1c42d8bdc3709927502592cb
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
});

<<<<<<< HEAD
// PROTECTED ROUTES
=======
// Peta publik (US-02)
Route::get('/reports/map', [ReportController::class, 'map']);

// USER
>>>>>>> 22aa2134171d21cc1c42d8bdc3709927502592cb
Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
});

<<<<<<< HEAD
Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me',      [AdminAuthController::class, 'me']);
=======
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/reports',      [ReportController::class, 'store']);
    Route::get('/reports/my',    [ReportController::class, 'myReports']);
    Route::get('/reports/{id}',  [ReportController::class, 'show']);
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
>>>>>>> 22aa2134171d21cc1c42d8bdc3709927502592cb
});