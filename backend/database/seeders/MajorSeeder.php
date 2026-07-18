<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
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
        $majors = [
            'UISI' => [
                'Informatika',
                'Sistem Informasi',
            ],

            'ITB' => [
                'Teknik Informatika',
                'Teknik Elektro',
            ],

            'UGM' => [
                'Ilmu Komputer',
                'Teknologi Informasi',
            ],

            'ITS' => [
                'Teknik Informatika',
                'Sistem Informasi',
            ],

            'UNAIR' => [
                'Sistem Informasi',
                'Data Science',
            ],
        ];
        foreach ($majors as $shortName => $majorNames) {

            $university = University::where(
                'short_name',
                $shortName
            )->firstOrFail();

            foreach ($majorNames as $majorName) {

                Major::updateOrCreate([
                        'university_id' => $university->id,
                        'name' => $majorName,
                    ]);
            }
        }
    }
};
