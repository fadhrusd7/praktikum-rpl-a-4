<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Models\Report;

/**
 * Unit Test: Report Status Helper Methods
 *
 * Menguji method isPending(), isVerified(), isRejected(), isDone()
 * pada model Report. Fungsi-fungsi ini kritis karena menentukan
 * alur logika bisnis (flow) laporan di seluruh aplikasi.
 */
class ReportStatusTest extends TestCase
{
    // =========================================================================
    // TEST 1: isPending()
    // =========================================================================

    /**
     * Test bahwa isPending() mengembalikan true ketika status = 'menunggu_validasi'
     */
    public function test_isPending_returns_true_when_status_is_menunggu_validasi(): void
    {
        // Arrange
        $report = new Report();
        $report->status = 'menunggu_validasi';

        // Act
        $result = $report->isPending();

        // Assert
        $this->assertTrue($result);
    }

    /**
     * Test bahwa isPending() mengembalikan false ketika status bukan 'menunggu_validasi'
     */
    public function test_isPending_returns_false_when_status_is_not_menunggu_validasi(): void
    {
        // Arrange
        $report = new Report();
        $report->status = 'terverifikasi';

        // Act
        $result = $report->isPending();

        // Assert
        $this->assertFalse($result);
    }

    // =========================================================================
    // TEST 2: isVerified()
    // =========================================================================

    /**
     * Test bahwa isVerified() mengembalikan true ketika status = 'terverifikasi'
     */
    public function test_isVerified_returns_true_when_status_is_terverifikasi(): void
    {
        // Arrange
        $report = new Report();
        $report->status = 'terverifikasi';

        // Act
        $result = $report->isVerified();

        // Assert
        $this->assertTrue($result);
    }

    /**
     * Test bahwa isVerified() mengembalikan true ketika status = 'divalidasi'
     */
    public function test_isVerified_returns_true_when_status_is_divalidasi(): void
    {
        // Arrange
        $report = new Report();
        $report->status = 'divalidasi';

        // Act
        $result = $report->isVerified();

        // Assert
        $this->assertTrue($result);
    }

    /**
     * Edge case: isVerified() mengembalikan false untuk status yang mirip tapi salah
     */
    public function test_isVerified_returns_false_for_similar_but_incorrect_status(): void
    {
        // Arrange
        $report = new Report();
        $report->status = 'verifikasi'; // typo / status tidak valid

        // Act
        $result = $report->isVerified();

        // Assert
        $this->assertFalse($result, 'Status "verifikasi" seharusnya tidak dianggap verified');
    }

    // =========================================================================
    // TEST 3: isRejected()
    // =========================================================================

    /**
     * Test bahwa isRejected() mengembalikan true ketika status = 'ditolak'
     */
    public function test_isRejected_returns_true_when_status_is_ditolak(): void
    {
        // Arrange
        $report = new Report();
        $report->status = 'ditolak';

        // Act
        $result = $report->isRejected();

        // Assert
        $this->assertTrue($result);
    }

    /**
     * Unhappy path: isRejected() mengembalikan false untuk status selain 'ditolak'
     */
    public function test_isRejected_returns_false_when_status_is_selesai(): void
    {
        // Arrange
        $report = new Report();
        $report->status = 'selesai';

        // Act
        $result = $report->isRejected();

        // Assert
        $this->assertFalse($result);
    }

    // =========================================================================
    // TEST 4: isDone()
    // =========================================================================

    /**
     * Test bahwa isDone() mengembalikan true ketika status = 'selesai'
     */
    public function test_isDone_returns_true_when_status_is_selesai(): void
    {
        // Arrange
        $report = new Report();
        $report->status = 'selesai';

        // Act
        $result = $report->isDone();

        // Assert
        $this->assertTrue($result);
    }

    /**
     * Edge case: isDone() mengembalikan false ketika status kosong/null
     */
    public function test_isDone_returns_false_when_status_is_null(): void
    {
        // Arrange
        $report = new Report();
        $report->status = null;

        // Act
        $result = $report->isDone();

        // Assert
        $this->assertFalse($result, 'Status null seharusnya tidak dianggap selesai');
    }

    // =========================================================================
    // TEST 5: Konsistensi — hanya satu status helper yang true pada satu waktu
    // =========================================================================

    /**
     * Test bahwa untuk setiap status valid, hanya satu helper yang mengembalikan true
     */
    public function test_only_one_status_helper_returns_true_at_a_time(): void
    {
        // Arrange
        $statusMap = [
            'menunggu_validasi' => 'isPending',
            'terverifikasi'     => 'isVerified',
            'divalidasi'        => 'isVerified',
            'ditolak'           => 'isRejected',
            'selesai'           => 'isDone',
        ];

        foreach ($statusMap as $status => $expectedMethod) {
            $report = new Report();
            $report->status = $status;

            $helpers = ['isPending', 'isVerified', 'isRejected', 'isDone'];

            foreach ($helpers as $helper) {
                // Act
                $result = $report->$helper();

                // Assert
                if ($helper === $expectedMethod) {
                    $this->assertTrue($result, "Status '{$status}': {$helper}() seharusnya true");
                } else {
                    $this->assertFalse($result, "Status '{$status}': {$helper}() seharusnya false");
                }
            }
        }
    }
}
