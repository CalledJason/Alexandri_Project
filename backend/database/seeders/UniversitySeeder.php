<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\University;

class UniversitySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $universities = [
                [
                    'name' => 'Universitas Internasional Semen Indonesia',
                    'short_name' => 'UISI',
                    'domain' => 'uisi.ac.id',
                    'city' => 'Gresik',
                ],
                [
                    'name' => 'Institut Teknologi Bandung',
                    'short_name' => 'ITB',
                    'domain' => 'itb.ac.id',
                    'city' => 'Bandung',
                ],
                [
                    'name' => 'Universitas Gadjah Mada',
                    'short_name' => 'UGM',
                    'domain' => 'ugm.ac.id',
                    'city' => 'Yogyakarta',
                ],
                [
                    'name' => 'Institut Teknologi Sepuluh Nopember',
                    'short_name' => 'ITS',
                    'domain' => 'its.ac.id',
                    'city' => 'Surabaya',
                ],
                [
                    'name' => 'Universitas Airlangga',
                    'short_name' => 'UNAIR',
                    'domain' => 'unair.ac.id',
                    'city' => 'Surabaya',
                ],
            ];

            foreach ($universities as $university) {
                University::updateOrCreate(
                ['short_name' => $university['short_name']], $university
            );
            }
    }
}
