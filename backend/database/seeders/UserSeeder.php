<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\University;
use App\Models\Major;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $dummyUsers = [
            [
                'name' => 'Budi Pratama',
                'email' => 'budi@ui.ac.id',
                'password' => 'password123',
                'student_id' => '2106789012',
                'semester' => 4,
                'univ_short' => 'UI',
                'major_name' => 'Teknik Informatika',
            ],
            [
                'name' => 'Siti Nurhaliza',
                'email' => 'siti@its.ac.id',
                'password' => 'password123',
                'student_id' => '5025211045',
                'semester' => 6,
                'univ_short' => 'ITS',
                'major_name' => 'Sistem Informasi',
            ],
            [
                'name' => 'Rian Ardianto',
                'email' => 'rian@ugm.ac.id',
                'password' => 'password123',
                'student_id' => '22/498210/TK/54321',
                'semester' => 2,
                'univ_short' => 'UGM',
                'major_name' => 'Teknologi Informasi',
            ],
            [
                'name' => 'Ayu Lestari',
                'email' => 'ayu@itb.ac.id',
                'password' => 'password123',
                'student_id' => '13521098',
                'semester' => 5,
                'univ_short' => 'ITB',
                'major_name' => 'Teknik Informatika',
            ],
            [
                'name' => 'Fikri Ramadhan',
                'email' => 'fikri@unair.ac.id',
                'password' => 'password123',
                'student_id' => '162112345001',
                'semester' => 3,
                'univ_short' => 'UNAIR',
                'major_name' => 'Teknologi Sains Data',
            ],
            [
                'name' => 'Dewi Anggraini',
                'email' => 'dewi@ub.ac.id',
                'password' => 'password123',
                'student_id' => '215150200111012',
                'semester' => 4,
                'univ_short' => 'UB',
                'major_name' => 'Desain Komunikasi Visual',
            ],
            [
                'name' => 'Eko Prasetyo',
                'email' => 'eko@telkomuniversity.ac.id',
                'password' => 'password123',
                'student_id' => '1301213045',
                'semester' => 5,
                'univ_short' => 'TELKOM',
                'major_name' => 'Rekayasa Perangkat Lunak',
            ],
            [
                'name' => 'Nabila Putri',
                'email' => 'nabila@binus.ac.id',
                'password' => 'password123',
                'student_id' => '2501987654',
                'semester' => 3,
                'univ_short' => 'BINUS',
                'major_name' => 'Cyber Security',
            ],
        ];

        foreach ($dummyUsers as $data) {
            $univ = University::where('short_name', $data['univ_short'])->first();
            $major = null;

            if ($univ) {
                $major = Major::where('university_id', $univ->id)
                    ->where('name', $data['major_name'])
                    ->first();
            }

            User::updateOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => $data['password'],
                    'student_id' => $data['student_id'],
                    'semester' => $data['semester'],
                    'university_id' => $univ?->id,
                    'major_id' => $major?->id,
                ]
            );
        }
    }
}
