<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReportRequest extends FormRequest{
    public function authorize(): bool{
        return auth('sanctum')->check();
    }

    public function rules(): array{
    return [
        'judul'      => 'required|string|max:255',
        'kategori'   => 'required|string|in:Sampah,Polusi,Banjir,Isu Air,Penebangan,Lainnya',
        'deskripsi'  => 'required|string',
        'lokasi'     => 'required|string',
        'latitude'   => 'required|numeric',
        'longitude'  => 'required|numeric',
        'photos'     => 'nullable|array|max:5',
        'photos.*'   => 'file|mimes:jpg,jpeg,png|max:512',
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