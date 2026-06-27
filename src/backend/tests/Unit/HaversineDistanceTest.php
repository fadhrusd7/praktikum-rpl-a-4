<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Http\Controllers\ReportController;
use ReflectionMethod;

/**
 * Unit Test: Haversine Distance Calculation
 *
 * Menguji method haversineDistance() pada ReportController.
 * Fungsi ini kritis karena digunakan untuk deteksi duplikat laporan
 * berdasarkan jarak koordinat GPS.
 */
class HaversineDistanceTest extends TestCase
{
    private ReportController $controller;
    private ReflectionMethod $method;

    protected function setUp(): void
    {
        parent::setUp();

        // Gunakan Reflection untuk mengakses private method
        $this->controller = new ReportController();
        $this->method = new ReflectionMethod(ReportController::class, 'haversineDistance');
    }

    /**
     * Helper untuk memanggil private method haversineDistance
     */
    private function callHaversine(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        return $this->method->invoke($this->controller, $lat1, $lon1, $lat2, $lon2);
    }

    // =========================================================================
    // TEST 1: Titik yang sama menghasilkan jarak 0
    // =========================================================================

    /**
     * Test bahwa jarak antara dua titik yang identik adalah 0 meter
     */
    public function test_same_point_returns_zero_distance(): void
    {
        // Arrange
        $lat = -6.914744;  // Koordinat Jakarta
        $lon = 107.609810;

        // Act
        $distance = $this->callHaversine($lat, $lon, $lat, $lon);

        // Assert
        $this->assertEquals(0.0, $distance, 'Jarak antara titik yang sama harus 0');
    }

    // =========================================================================
    // TEST 2: Jarak pendek yang diketahui (dalam kota)
    // =========================================================================

    /**
     * Test kalkulasi jarak pendek antara dua lokasi di Bandung
     * Monas ke Masjid Istiqlal ≈ ~900 meter
     */
    public function test_short_distance_between_known_locations(): void
    {
        // Arrange — Monas dan Masjid Istiqlal, Jakarta
        $lat1 = -6.175110;
        $lon1 = 106.827153;
        $lat2 = -6.170080;
        $lon2 = 106.831825;

        // Act
        $distance = $this->callHaversine($lat1, $lon1, $lat2, $lon2);

        // Assert — Jarak sekitar 700-1000 meter
        $this->assertGreaterThan(600, $distance, 'Jarak harus lebih dari 600 meter');
        $this->assertLessThan(1200, $distance, 'Jarak harus kurang dari 1200 meter');
    }

    // =========================================================================
    // TEST 3: Jarak jauh antar kota
    // =========================================================================

    /**
     * Test kalkulasi jarak jauh: Jakarta ke Surabaya ≈ ~660 km
     */
    public function test_long_distance_jakarta_to_surabaya(): void
    {
        // Arrange
        $latJakarta = -6.200000;
        $lonJakarta = 106.816666;
        $latSurabaya = -7.250000;
        $lonSurabaya = 112.750000;

        // Act
        $distance = $this->callHaversine($latJakarta, $lonJakarta, $latSurabaya, $lonSurabaya);
        $distanceKm = $distance / 1000;

        // Assert — Jakarta-Surabaya ≈ 660 km (toleransi ±50 km)
        $this->assertGreaterThan(600, $distanceKm, 'Jarak harus lebih dari 600 km');
        $this->assertLessThan(750, $distanceKm, 'Jarak harus kurang dari 750 km');
    }

    // =========================================================================
    // TEST 4: Jarak bersifat simetris (A→B == B→A)
    // =========================================================================

    /**
     * Test bahwa jarak A ke B sama dengan jarak B ke A (sifat simetris)
     */
    public function test_distance_is_symmetric(): void
    {
        // Arrange
        $lat1 = -6.914744;
        $lon1 = 107.609810;
        $lat2 = -6.917464;
        $lon2 = 107.619123;

        // Act
        $distanceAB = $this->callHaversine($lat1, $lon1, $lat2, $lon2);
        $distanceBA = $this->callHaversine($lat2, $lon2, $lat1, $lon1);

        // Assert
        $this->assertEquals($distanceAB, $distanceBA, 'Jarak harus simetris (A→B == B→A)');
    }

    // =========================================================================
    // TEST 5: Edge case — koordinat di equator (latitude 0)
    // =========================================================================

    /**
     * Test kalkulasi jarak di equator (latitude = 0)
     */
    public function test_distance_at_equator(): void
    {
        // Arrange — Dua titik di equator, berjarak ~1 derajat longitude
        $lat1 = 0.0;
        $lon1 = 100.0;
        $lat2 = 0.0;
        $lon2 = 101.0;

        // Act
        $distance = $this->callHaversine($lat1, $lon1, $lat2, $lon2);
        $distanceKm = $distance / 1000;

        // Assert — 1 derajat di equator ≈ 111.32 km
        $this->assertGreaterThan(110, $distanceKm);
        $this->assertLessThan(113, $distanceKm);
    }

    // =========================================================================
    // TEST 6: Edge case — koordinat negatif (southern hemisphere)
    // =========================================================================

    /**
     * Test bahwa fungsi bekerja dengan benar untuk koordinat negatif
     */
    public function test_distance_with_negative_coordinates(): void
    {
        // Arrange — Titik di southern hemisphere
        $lat1 = -33.8688;  // Sydney
        $lon1 = 151.2093;
        $lat2 = -37.8136;  // Melbourne
        $lon2 = 144.9631;

        // Act
        $distance = $this->callHaversine($lat1, $lon1, $lat2, $lon2);
        $distanceKm = $distance / 1000;

        // Assert — Sydney ke Melbourne ≈ 714 km (great-circle distance)
        $this->assertGreaterThan(650, $distanceKm);
        $this->assertLessThan(800, $distanceKm);
    }

    // =========================================================================
    // TEST 7: Jarak sangat dekat (< 1 meter) — untuk deteksi duplikat
    // =========================================================================

    /**
     * Test jarak sangat dekat — relevan untuk deteksi duplikat laporan
     */
    public function test_very_short_distance_for_duplicate_detection(): void
    {
        // Arrange — Dua titik yang sangat berdekatan (beda ~0.00001 derajat ≈ ~1 meter)
        $lat1 = -6.914744;
        $lon1 = 107.609810;
        $lat2 = -6.914754;  // Beda 0.00001
        $lon2 = 107.609810;

        // Act
        $distance = $this->callHaversine($lat1, $lon1, $lat2, $lon2);

        // Assert — Harus sangat kecil, di bawah 5 meter
        $this->assertGreaterThan(0, $distance, 'Jarak harus positif meskipun sangat dekat');
        $this->assertLessThan(5, $distance, 'Jarak harus di bawah 5 meter');
    }
}
