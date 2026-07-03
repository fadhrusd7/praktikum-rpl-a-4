# Testing - Lestari

Dokumentasi testing untuk proyek Lestari.

## Struktur Testing

```
src/backend/tests/
├── Unit/
│   ├── HaversineDistanceTest.php       # Test fungsi jarak Haversine
│   ├── ReportStatusTest.php           # Test status laporan
│   └── StoreReportValidationTest.php  # Test validasi input
│
└── Feature/
    └── ExampleTest.php                  # Contoh test Laravel
```

## Cara Menjalankan Tests

### Backend (Laravel)

```bash
cd src/backend

# Jalankan semua tests
php artisan test

# Jalankan specific test
php artisan test --filter=HaversineDistanceTest

# Jalankan unit tests saja
php artisan test --testsuite=Unit

# Jalankan feature tests saja
php artisan test --testsuite=Feature
```

## Test Cases Dokumentasi

Test cases manual terdokumentasi di: [docs/test-cases.md](../docs/test-cases.md)

### Ringkasan Test Cases

| Platform | Total | Passed | Failed |
|----------|-------|--------|--------|
| Web | 11 | 11 | 0 |
| Mobile | 10 | 10 | 0 |
| **Total** | **21** | **21** | **0** |

## Unit Tests

Unit tests ditulis menggunakan PHPUnit dan Laravel Testing.

### HaversineDistanceTest
Menguji fungsi perhitungan jarak Haversine untuk menghitung jarak antara dua titik koordinat.

### ReportStatusTest
Menguji logika status laporan (Menunggu Validasi, Terverifikasi, Ditolak, Selesai).

### StoreReportValidationTest
Menguji validasi input saat pembuatan laporan baru.

## Coverage

Unit tests fokus pada:
- Business logic (Haversine formula)
- Status transitions
- Input validation
- Edge cases

## Best Practices

- Setiap test harus independen (tidak bergantung pada test lain)
- Gunakan fixtures untuk data test
- Test nama harus deskriptif
- Follow pattern: Arrange -> Act -> Assert
