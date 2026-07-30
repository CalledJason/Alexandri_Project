<?php

namespace Database\Factories;

use App\Models\Major;
use App\Models\University;
use Illuminate\Database\Eloquent\Factories\Factory;

class MajorFactory extends Factory
{
    protected $model = Major::class;

    public function definition(): array
    {
        return [
            'university_id' => University::factory(),
            'name' => $this->faker->jobTitle(),
        ];
    }
}
