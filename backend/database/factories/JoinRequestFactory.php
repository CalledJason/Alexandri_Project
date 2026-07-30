<?php

namespace Database\Factories;

use App\Models\JoinRequest;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JoinRequest>
 */
class JoinRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'study_group_id' => \App\Models\StudyGroup::factory(),
            'status' => 'pending',
        ];
    }
}
