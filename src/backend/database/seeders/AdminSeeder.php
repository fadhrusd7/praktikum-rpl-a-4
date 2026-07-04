<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Jalankan: php artisan db:seed --class=AdminSeeder
     * 
     * Ini membuat akun admin pertama.
     * Ganti email/password sebelum deploy ke production!
     */
    public function run(): void
    {
        Admin::firstOrCreate(
            ['email' => 'admin@monitoring.com'],
            [
                'username' => 'admin',
                'email'    => 'admin@monitoring.com',
                'password' => Hash::make('admin12345'),
            ]
        );

        $this->command->info('Admin seeder selesai.');
        $this->command->info('Email    : admin@monitoring.com');
        $this->command->info('Password : admin12345');
        $this->command->warn('Ganti password ini setelah pertama kali login!');
    }
}