<?php

namespace Database\Factories;

use App\Models\StudyGroup;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StudyGroup>
 */
class StudyGroupFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence(3),
            'description' => $this->faker->paragraph(),
            'location' => $this->faker->city(),
            'meeting_time' => now()->addDays(2),
            'expires_at' => now()->addDays(3),
            'max_members' => 5,
            'visibility' => 'public',
            'status' => 'open',
            'owner_id' => \App\Models\User::factory(),
        ];
    }
}
