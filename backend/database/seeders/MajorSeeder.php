<?php

namespace Database\Seeders;

use App\Models\Major;
use App\Models\University;
use Illuminate\Database\Seeder;

class MajorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $majorsMap = [
            'UISI' => [
                'Manajemen',
                'Akuntansi',
                'Informatika',
                'Sistem Informasi',
                'Desain Komunikasi Visual',
                'Manajemen Rekayasa',
                'Teknik Kimia',
                'Teknik Logistik',
                'Teknologi Industri Pertanian',
                'Ekonomi Syariah',
            ],
            'UI' => [
                'Ilmu Komputer',
                'Sistem Informasi',
                'Teknik Informatika',
                'Teknik Elektro',
                'Manajemen',
                'Akuntansi',
                'Ilmu Hukum',
                'Kedokteran',
                'Ilmu Komunikasi',
                'Psikologi',
            ],
            'ITB' => [
                'Teknik Informatika',
                'Teknik Elektro',
                'Teknik Industri',
                'Teknik Kimia',
                'Sekolah Bisnis dan Manajemen',
                'Desain Komunikasi Visual',
            ],
            'UGM' => [
                'Ilmu Komputer',
                'Teknologi Informasi',
                'Teknik Elektro',
                'Manajemen',
                'Akuntansi',
                'Ilmu Komunikasi',
                'Psikologi',
                'Kedokteran',
            ],
            'ITS' => [
                'Teknik Informatika',
                'Sistem Informasi',
                'Teknologi Informasi',
                'Teknik Elektro',
                'Teknik Industri',
                'Teknik Kimia',
                'Desain Komunikasi Visual',
            ],
            'UNAIR' => [
                'Sistem Informasi',
                'Teknologi Sains Data',
                'Manajemen',
                'Akuntansi',
                'Kedokteran',
                'Ilmu Hukum',
                'Farmasi',
                'Psikologi',
            ],
            'UB' => [
                'Teknik Informatika',
                'Sistem Informasi',
                'Ilmu Komputer',
                'Manajemen',
                'Akuntansi',
                'Ilmu Hukum',
                'Desain Komunikasi Visual',
            ],
            'UNDIP' => [
                'Teknik Informatika',
                'Teknik Elektro',
                'Manajemen',
                'Akuntansi',
                'Ilmu Hukum',
                'Psikologi',
            ],
            'UNPAD' => [
                'Teknik Informatika',
                'Sistem Informasi',
                'Manajemen',
                'Akuntansi',
                'Ilmu Komunikasi',
                'Kedokteran',
            ],
            'IPB' => [
                'Ilmu Komputer',
                'Sistem Informasi',
                'Manajemen',
                'Teknologi Industri Pertanian',
                'Bisnis',
                'Ilmu Aktuaria',
            ],
            'TELKOM' => [
                'Teknik Informatika',
                'Sistem Informasi',
                'Rekayasa Perangkat Lunak',
                'Teknologi Informasi',
                'Desain Komunikasi Visual',
                'Manajemen Bisnis Telekomunikasi',
            ],
            'BINUS' => [
                'Computer Science',
                'Information Systems',
                'Cyber Security',
                'Business Analytics',
                'Game Application Technology',
                'Management',
                'Accounting',
            ],
            'UPNJATIM' => [
                'Teknik Informatika',
                'Sistem Informasi',
                'Sains Data',
                'Bisnis Digital',
                'Desain Komunikasi Visual',
                'Manajemen',
                'Akuntansi',
            ],
            'UMG' => [
                'Teknik Informatika',
                'Sistem Informasi',
                'Manajemen',
                'Akuntansi',
                'Teknik Industri',
                'Teknik Elektro',
                'Psikologi',
                'Pendidikan Bahasa Inggris',
                'Agribisnis',
                'Hukum',
            ],
        ];

        foreach ($majorsMap as $shortName => $majorNames) {
            $university = University::where('short_name', $shortName)->first();

            if ($university) {
                foreach ($majorNames as $name) {
                    Major::updateOrCreate([
                        'university_id' => $university->id,
                        'name' => $name,
                    ]);
                }
            }
        }
    }
}
