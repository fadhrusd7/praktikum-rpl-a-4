<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Lestari Application Configuration
    |--------------------------------------------------------------------------
    |
    | This file is for storing configuration values specific to the Lestari
    | application, extracting them from direct env() calls scattered across
    | the application to ensure compatibility with `config:cache`.
    |
    */

    'report' => [
        'duplicate_radius_meter' => env('REPORT_DUPLICATE_RADIUS_METER', 10),
        'duplicate_days' => env('REPORT_DUPLICATE_DAYS', 1),
        'max_photo_size_kb' => env('REPORT_MAX_PHOTO_SIZE_KB', 2048),
    ],

    'supabase' => [
        'bucket' => env('SUPABASE_BUCKET', 'reports'),
        'profile_bucket' => env('SUPABASE_PROFILE_BUCKET', 'profiles'),
        'public_url' => env('SUPABASE_PUBLIC_URL'),
        'endpoint' => env('SUPABASE_ENDPOINT'),
    ],

    'frontend' => [
        'url' => env('FRONTEND_URL', 'http://localhost:5173'),
    ],

];
