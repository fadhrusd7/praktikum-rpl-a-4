<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth('sanctum')->check();
    }

    public function rules(): array
    {
        return [
            'judul'       => 'required|string|max:255',
            'deskripsi'   => 'required|string|min:10|max:2000',
            'lokasi'      => 'required|string|max:255',
            'latitude'    => 'required|numeric|between:-90,90',
            'longitude'   => 'required|numeric|between:-180,180',
            'foto'        => 'nullable|image|mimes:jpeg,png,webp|max:512', // 512 KB
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required'      => 'Judul laporan wajib diisi.',
            'judul.max'           => 'Judul maksimal 255 karakter.',
            'deskripsi.required'  => 'Deskripsi laporan wajib diisi.',
            'deskripsi.min'       => 'Deskripsi minimal 10 karakter.',
            'deskripsi.max'       => 'Deskripsi maksimal 2000 karakter.',
            'lokasi.required'     => 'Lokasi laporan wajib diisi.',
            'latitude.required'   => 'Latitude (koordinat) wajib diisi.',
            'latitude.numeric'    => 'Latitude harus berupa angka.',
            'latitude.between'    => 'Latitude harus antara -90 hingga 90.',
            'longitude.required'  => 'Longitude (koordinat) wajib diisi.',
            'longitude.numeric'   => 'Longitude harus berupa angka.',
            'longitude.between'   => 'Longitude harus antara -180 hingga 180.',
            'foto.image'          => 'File harus berupa gambar.',
            'foto.mimes'          => 'Format gambar harus JPEG, PNG, atau WebP.',
            'foto.max'            => 'Ukuran gambar maksimal 512 KB.',
        ];
    }
}