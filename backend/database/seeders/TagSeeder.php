<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class TagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags= [
            'Algorithms',
            'Database',
            'Web Development',
            'Mobile Development',
            'Machine Learning',
            'Artificial Intelligence',
            'UI/UX',
            'Cyber Security',
            'Networking',
            'Competitive Programming',
        ];

        foreach ($tags as $tag) {
            Tag::updateOrCreate([
                'name' => $tag,
            ]);
        }
    }
}
