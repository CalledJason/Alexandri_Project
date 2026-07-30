<?php

use App\Models\User;
use App\Models\StudyGroup;
use App\Models\University;

beforeEach(function () {
    University::factory()->create([
        'domain' => 'example.ac.id'
    ]);
});

it('can fetch all study groups', function () {
    $user = User::factory()->create();
    StudyGroup::factory()->count(3)->create([
        'owner_id' => $user->id,
        'visibility' => 'public',
    ]);

    $response = $this->actingAs($user)->getJson('/api/study-groups');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'description',
                    'location',
                    'meeting_time',
                    'max_members',
                    'visibility',
                    'owner_id'
                ]
            ]
        ]);

    expect(count($response->json('data')))->toBe(3);
});

it('can fetch a single study group', function () {
    $user = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create([
        'owner_id' => $user->id,
        'visibility' => 'public',
    ]);

    $response = $this->actingAs($user)->getJson('/api/study-groups/' . $studyGroup->id);

    $response->assertStatus(200)
        ->assertJson([
            'id' => $studyGroup->id,
            'title' => $studyGroup->title,
        ]);
});

it('can create a study group', function () {
    $user = User::factory()->create();

    $payload = [
        'title' => 'Test Study Group',
        'description' => 'Test Description',
        'location' => 'Library',
        'meeting_time' => now()->addDays(2)->toDateTimeString(),
        'expires_at' => now()->addDays(3)->toDateTimeString(),
        'max_members' => 5,
        'visibility' => 'public',
        'duration' => 2,
    ];

    $response = $this->actingAs($user)->postJson('/api/study-groups', $payload);

    $response->assertStatus(201)
        ->assertJsonFragment([
            'title' => 'Test Study Group',
            'location' => 'Library',
            'max_members' => 5,
        ]);

    $this->assertDatabaseHas('study_groups', [
        'title' => 'Test Study Group',
        'owner_id' => $user->id,
    ]);
});

it('can update a study group', function () {
    $user = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create([
        'owner_id' => $user->id,
    ]);

    $payload = [
        'title' => 'Updated Title',
        'description' => 'Updated Description',
        'location' => 'Cafe',
        'meeting_time' => now()->addDays(2)->toDateTimeString(),
        'expires_at' => now()->addDays(3)->toDateTimeString(),
        'max_members' => 10,
        'visibility' => 'public',
        'duration' => 3,
    ];

    $response = $this->actingAs($user)->putJson('/api/study-groups/' . $studyGroup->id, $payload);

    $response->assertStatus(200)
        ->assertJsonFragment([
            'title' => 'Updated Title',
            'location' => 'Cafe',
        ]);

    $this->assertDatabaseHas('study_groups', [
        'id' => $studyGroup->id,
        'title' => 'Updated Title',
    ]);
});

it('cannot update a study group owned by someone else', function () {
    $owner = User::factory()->create();
    $otherUser = User::factory()->create();
    
    $studyGroup = StudyGroup::factory()->create([
        'owner_id' => $owner->id,
    ]);

    $payload = [
        'title' => 'Updated Title',
        'description' => 'Updated Description',
        'location' => 'Cafe',
        'meeting_time' => now()->addDays(2)->toDateTimeString(),
        'expires_at' => now()->addDays(3)->toDateTimeString(),
        'max_members' => 10,
        'visibility' => 'public',
        'duration' => 3,
    ];

    $response = $this->actingAs($otherUser)->putJson('/api/study-groups/' . $studyGroup->id, $payload);

    $response->assertStatus(403);
});

it('can delete a study group', function () {
    $user = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create([
        'owner_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->deleteJson('/api/study-groups/' . $studyGroup->id);

    $response->assertStatus(200);

    $this->assertSoftDeleted('study_groups', [
        'id' => $studyGroup->id,
    ]);
});
