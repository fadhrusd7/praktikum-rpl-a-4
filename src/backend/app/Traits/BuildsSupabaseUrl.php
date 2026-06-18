<?php

namespace App\Traits;

trait BuildsSupabaseUrl
{
    /**
     * Build public URL for Supabase storage object.
     *
     * @param string|null $path
     * @param string $bucketConfigKey
     * @return string|null
     */
    protected function buildSupabasePublicUrl(?string $path, string $bucketConfigKey): ?string
    {
        if (empty($path)) {
            return null;
        }

        if (preg_match('/^https?:\/\//i', $path)) {
            return $path;
        }

        $bucket = trim((string) config("lestari.supabase.{$bucketConfigKey}", ''), '/');
        $cleanPath = ltrim($path, '/');

        if ($bucket && str_starts_with($cleanPath, $bucket . '/')) {
            $cleanPath = substr($cleanPath, strlen($bucket) + 1);
        }

        $baseUrl = rtrim((string) config('lestari.supabase.public_url', ''), '/');

        if (!$baseUrl) {
            $endpoint = rtrim((string) config('lestari.supabase.endpoint', ''), '/');
            $baseUrl = preg_replace(
                '#\.storage\.supabase\.co/storage/v1/s3$#',
                '.supabase.co',
                $endpoint
            );
        }

        if (!$baseUrl || !$bucket) {
            return null;
        }

        $baseUrl = str_replace('.supabase.co', '.supabase.co/storage/v1/object/public', $baseUrl);

        return $baseUrl . '/' . $bucket . '/' . $cleanPath;
    }
}
