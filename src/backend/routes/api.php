<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\ReportController;

// Auth User (US-07, US-08)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

// Auth Admin (US-09)
Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login']);
});

// Map - Laporan terverifikasi (US-02, PUBLIC)
Route::get('/reports/map', [ReportController::class, 'map']);

Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);
});

// Report User Routes (US-01, US-03, US-04)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/reports',      [ReportController::class, 'store']);  // Buat laporan
    Route::get('/reports/my',    [ReportController::class, 'myReports']); // Lihat laporan miliknya
});

Route::prefix('admin')->middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me',      [AdminAuthController::class, 'me']);
    // Report Admin Routes 
    // Route::get('/reports', [AdminReportController::class, 'index']);
    // Route::patch('/reports/{id}/validate', [AdminReportController::class, 'validate']);
    // Route::patch('/reports/{id}/status', [AdminReportController::class, 'updateStatus']);
});