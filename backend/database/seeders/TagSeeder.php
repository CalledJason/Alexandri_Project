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
            'Accounting & Finance',
            'Business & Management',
            'Psychology & Mental Health',
            'Medical & Health Sciences',
            'Engineering & Construction',
            'Law & Politics',
            'Communication & Media',
            'Agriculture & Agribusiness',
            'Education & Teaching',
        ];

        foreach ($tags as $tag) {
            Tag::updateOrCreate([
                'name' => $tag,
            ]);
        }
    }
}
