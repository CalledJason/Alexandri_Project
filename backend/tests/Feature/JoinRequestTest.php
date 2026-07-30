<?php

use App\Models\User;
use App\Models\StudyGroup;
use App\Models\JoinRequest;
use App\Models\University;

beforeEach(function () {
    University::factory()->create([
        'domain' => 'example.ac.id'
    ]);
});

it('can fetch user join requests', function () {
    $user = User::factory()->create();
    JoinRequest::factory()->count(2)->create([
        'user_id' => $user->id,
    ]);

    $response = $this->actingAs($user)->getJson('/api/my-requests');

    $response->assertStatus(200);
    expect(count($response->json()))->toBe(2);
});

it('can fetch join requests for a specific study group as owner', function () {
    $owner = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create([
        'owner_id' => $owner->id,
    ]);
    JoinRequest::factory()->count(3)->create([
        'study_group_id' => $studyGroup->id,
    ]);

    $response = $this->actingAs($owner)->getJson("/api/study-groups/{$studyGroup->id}/requests");

    $response->assertStatus(200);
    expect(count($response->json()))->toBe(3);
});

it('cannot fetch join requests for a specific study group if not owner', function () {
    $user = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create();
    
    $response = $this->actingAs($user)->getJson("/api/study-groups/{$studyGroup->id}/requests");

    $response->assertStatus(403);
});

it('user can request to join a study group', function () {
    $user = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create();

    $response = $this->actingAs($user)->postJson("/api/study-groups/{$studyGroup->id}/join");

    $response->assertStatus(201);

    $this->assertDatabaseHas('join_requests', [
        'user_id' => $user->id,
        'study_group_id' => $studyGroup->id,
        'status' => 'pending',
    ]);
});

it('user without complete profile cannot request to join a study group', function () {
    $user = User::factory()->create([
        'student_id' => null,
        'major_id' => null,
    ]);
    $studyGroup = StudyGroup::factory()->create();

    $response = $this->actingAs($user)->postJson("/api/study-groups/{$studyGroup->id}/join");

    $response->assertStatus(500);
});

it('owner can approve a join request', function () {
    $owner = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create([
        'owner_id' => $owner->id,
    ]);
    $joinRequest = JoinRequest::factory()->create([
        'study_group_id' => $studyGroup->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($owner)->patchJson("/api/join-requests/{$joinRequest->id}/approve");

    $response->assertStatus(200);

    $this->assertDatabaseHas('join_requests', [
        'id' => $joinRequest->id,
        'status' => 'approved',
    ]);
});

it('owner can reject a join request', function () {
    $owner = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create([
        'owner_id' => $owner->id,
    ]);
    $joinRequest = JoinRequest::factory()->create([
        'study_group_id' => $studyGroup->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($owner)->patchJson("/api/join-requests/{$joinRequest->id}/reject");

    $response->assertStatus(200);

    $this->assertDatabaseHas('join_requests', [
        'id' => $joinRequest->id,
        'status' => 'rejected',
    ]);
});

it('user can cancel their join request', function () {
    $user = User::factory()->create();
    $joinRequest = JoinRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'pending',
    ]);

    $response = $this->actingAs($user)->deleteJson("/api/join-requests/{$joinRequest->id}");

    $response->assertStatus(200);

    $this->assertDatabaseMissing('join_requests', [
        'id' => $joinRequest->id,
    ]);
});
