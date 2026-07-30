<?php

namespace Database\Seeders;

use App\Models\Major;
use App\Models\Tag;
use Illuminate\Database\Seeder;

class MajorTagSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tags = Tag::all();
        if ($tags->isEmpty()) {
            return;
        }

        $tagByName = $tags->keyBy('name');

        $majors = Major::all();

        foreach ($majors as $major) {
            $name = strtolower($major->name);
            $tagIdsToAttach = [];

            if (str_contains($name, 'informatika') || str_contains($name, 'komputer') || str_contains($name, 'computer') || str_contains($name, 'perangkat lunak')) {
                $tagNames = ['Algorithms', 'Web Development', 'Mobile Development', 'Machine Learning', 'Artificial Intelligence', 'Cyber Security', 'Competitive Programming', 'Database', 'UI/UX'];
            } elseif (str_contains($name, 'sistem informasi') || str_contains($name, 'information systems') || str_contains($name, 'sains data') || str_contains($name, 'data') || str_contains($name, 'bisnis digital') || str_contains($name, 'business analytics')) {
                $tagNames = ['Database', 'Web Development', 'UI/UX', 'Machine Learning', 'Mobile Development', 'Business & Management'];
            } elseif (str_contains($name, 'elektro') || str_contains($name, 'industri') || str_contains($name, 'kimia') || str_contains($name, 'sipil') || str_contains($name, 'logistik') || str_contains($name, 'rekayasa')) {
                $tagNames = ['Networking', 'Cyber Security', 'Algorithms', 'Engineering & Construction'];
            } elseif (str_contains($name, 'desain') || str_contains($name, 'dkv') || str_contains($name, 'game')) {
                $tagNames = ['UI/UX', 'Web Development', 'Mobile Development'];
            } elseif (str_contains($name, 'manajemen') || str_contains($name, 'akuntansi') || str_contains($name, 'bisnis') || str_contains($name, 'ekonomi')) {
                $tagNames = ['Database', 'Web Development', 'Accounting & Finance', 'Business & Management'];
            } elseif (str_contains($name, 'psikologi')) {
                $tagNames = ['Psychology & Mental Health'];
            } elseif (str_contains($name, 'kedokteran') || str_contains($name, 'farmasi')) {
                $tagNames = ['Medical & Health Sciences'];
            } elseif (str_contains($name, 'hukum')) {
                $tagNames = ['Law & Politics'];
            } elseif (str_contains($name, 'komunikasi')) {
                $tagNames = ['Communication & Media'];
            } elseif (str_contains($name, 'pertanian') || str_contains($name, 'agribisnis')) {
                $tagNames = ['Agriculture & Agribusiness'];
            } elseif (str_contains($name, 'pendidikan') || str_contains($name, 'guru')) {
                $tagNames = ['Education & Teaching'];
            } else {
                $tagNames = ['Database', 'Web Development', 'UI/UX'];
            }

            foreach ($tagNames as $tagName) {
                if (isset($tagByName[$tagName])) {
                    $tagIdsToAttach[] = $tagByName[$tagName]->id;
                }
            }

            if (!empty($tagIdsToAttach)) {
                $major->tags()->syncWithoutDetaching($tagIdsToAttach);
            }
        }
    }
}
