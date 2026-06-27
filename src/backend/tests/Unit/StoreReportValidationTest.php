<?php

namespace Tests\Unit;

use Tests\TestCase;
use Illuminate\Support\Facades\Validator;
use App\Http\Requests\StoreReportRequest;

/**
 * Unit Test: StoreReportRequest Validation Rules
 *
 * Menguji validation rules pada StoreReportRequest.
 * Fungsi ini kritis karena menjadi gerbang utama validasi input
 * saat user membuat laporan baru (endpoint POST /api/reports).
 */
class StoreReportValidationTest extends TestCase
{
    /**
     * Helper: ambil rules dari StoreReportRequest
     */
    private function getRules(): array
    {
        $request = new StoreReportRequest();
        return $request->rules();
    }

    /**
     * Helper: buat data laporan yang valid (sebagai baseline)
     */
    private function validReportData(): array
    {
        return [
            'judul'       => 'Sampah Menumpuk di Sungai Cikapundung',
            'kategori'    => 'Sampah',
            'deskripsi'   => 'Terdapat tumpukan sampah plastik yang menyumbat aliran sungai.',
            'lokasi'      => 'Jl. Siliwangi No. 10, Bandung',
            'latitude'    => -6.914744,
            'longitude'   => 107.609810,
            'is_anonymous' => false,
        ];
    }

    // =========================================================================
    // TEST 1: Data valid lolos validasi
    // =========================================================================

    /**
     * Test bahwa data yang lengkap dan valid lolos semua validation rules
     */
    public function test_valid_report_data_passes_validation(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->passes(), 'Data valid seharusnya lolos validasi');
    }

    // =========================================================================
    // TEST 2: Judul wajib diisi (required)
    // =========================================================================

    /**
     * Test bahwa validasi gagal ketika judul kosong
     */
    public function test_validation_fails_when_judul_is_empty(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        $data['judul'] = '';  // Kosongkan judul

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal ketika judul kosong');
        $this->assertArrayHasKey('judul', $validator->errors()->toArray());
    }

    /**
     * Edge case: Judul melebihi batas maksimal 255 karakter
     */
    public function test_validation_fails_when_judul_exceeds_max_length(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        $data['judul'] = str_repeat('A', 256);  // 256 karakter, melebihi max:255

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal ketika judul > 255 karakter');
        $this->assertArrayHasKey('judul', $validator->errors()->toArray());
    }

    // =========================================================================
    // TEST 3: Kategori harus sesuai enum yang ditentukan
    // =========================================================================

    /**
     * Test bahwa validasi gagal ketika kategori tidak ada dalam daftar yang diizinkan
     */
    public function test_validation_fails_when_kategori_is_invalid(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        $data['kategori'] = 'Kebakaran';  // Tidak ada dalam daftar in:...

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal untuk kategori yang tidak valid');
        $this->assertArrayHasKey('kategori', $validator->errors()->toArray());
    }

    /**
     * Test bahwa semua kategori valid diterima
     */
    public function test_all_valid_categories_pass_validation(): void
    {
        // Arrange
        $validCategories = ['Sampah', 'Polusi', 'Banjir', 'Isu Air', 'Penebangan', 'Lainnya'];
        $rules = $this->getRules();

        foreach ($validCategories as $category) {
            $data = $this->validReportData();
            $data['kategori'] = $category;

            // Act
            $validator = Validator::make($data, $rules);

            // Assert
            $this->assertFalse(
                $validator->errors()->has('kategori'),
                "Kategori '{$category}' seharusnya valid"
            );
        }
    }

    // =========================================================================
    // TEST 4: Latitude harus antara -90 dan 90
    // =========================================================================

    /**
     * Test bahwa validasi gagal ketika latitude di luar range (-90, 90)
     */
    public function test_validation_fails_when_latitude_is_out_of_range(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        $data['latitude'] = 91.0;  // Melebihi batas +90

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal ketika latitude > 90');
        $this->assertArrayHasKey('latitude', $validator->errors()->toArray());
    }

    /**
     * Edge case: Latitude negatif di luar range
     */
    public function test_validation_fails_when_latitude_is_below_negative_90(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        $data['latitude'] = -91.0;  // Melebihi batas -90

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal ketika latitude < -90');
    }

    // =========================================================================
    // TEST 5: Longitude harus antara -180 dan 180
    // =========================================================================

    /**
     * Test bahwa validasi gagal ketika longitude di luar range
     */
    public function test_validation_fails_when_longitude_exceeds_180(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        $data['longitude'] = 181.0;  // Melebihi batas +180

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal ketika longitude > 180');
        $this->assertArrayHasKey('longitude', $validator->errors()->toArray());
    }

    /**
     * Edge case: Longitude bukan angka (string)
     */
    public function test_validation_fails_when_longitude_is_not_numeric(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        $data['longitude'] = 'bukan_angka';

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal ketika longitude bukan angka');
        $this->assertArrayHasKey('longitude', $validator->errors()->toArray());
    }

    // =========================================================================
    // TEST 6: Field required — deskripsi dan lokasi wajib diisi
    // =========================================================================

    /**
     * Test bahwa validasi gagal ketika deskripsi tidak diisi
     */
    public function test_validation_fails_when_deskripsi_is_missing(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        unset($data['deskripsi']);  // Hapus field deskripsi

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal ketika deskripsi tidak ada');
        $this->assertArrayHasKey('deskripsi', $validator->errors()->toArray());
    }

    /**
     * Test bahwa validasi gagal ketika lokasi tidak diisi
     */
    public function test_validation_fails_when_lokasi_is_missing(): void
    {
        // Arrange
        $rules = $this->getRules();
        $data = $this->validReportData();
        unset($data['lokasi']);  // Hapus field lokasi

        // Act
        $validator = Validator::make($data, $rules);

        // Assert
        $this->assertTrue($validator->fails(), 'Validasi harus gagal ketika lokasi tidak ada');
        $this->assertArrayHasKey('lokasi', $validator->errors()->toArray());
    }

    // =========================================================================
    // TEST 7: Edge case — boundary values untuk latitude & longitude
    // =========================================================================

    /**
     * Test bahwa nilai boundary (tepat di batas) untuk latitude dan longitude diterima
     */
    public function test_boundary_values_for_coordinates_pass_validation(): void
    {
        // Arrange
        $rules = $this->getRules();

        $boundaryTests = [
            ['latitude' => -90, 'longitude' => -180],  // Minimum boundary
            ['latitude' =>  90, 'longitude' =>  180],  // Maximum boundary
            ['latitude' =>   0, 'longitude' =>    0],  // Zero (equator, prime meridian)
        ];

        foreach ($boundaryTests as $coords) {
            $data = $this->validReportData();
            $data['latitude'] = $coords['latitude'];
            $data['longitude'] = $coords['longitude'];

            // Act
            $validator = Validator::make($data, $rules);

            // Assert
            $this->assertTrue(
                $validator->passes(),
                "Koordinat ({$coords['latitude']}, {$coords['longitude']}) seharusnya valid"
            );
        }
    }
}
