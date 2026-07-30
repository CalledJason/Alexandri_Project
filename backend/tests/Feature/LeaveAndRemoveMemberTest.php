<?php

use App\Models\User;
use App\Models\StudyGroup;
use App\Models\StudyGroupMember;
use App\Models\JoinRequest;
use App\Enums\MemberRole;
use App\Enums\JoinRequestStatus;

it('member can leave a study group', function () {
    $owner = User::factory()->create();
    $memberUser = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create(['owner_id' => $owner->id]);

    StudyGroupMember::create([
        'study_group_id' => $studyGroup->id,
        'user_id' => $memberUser->id,
        'role' => MemberRole::MEMBER,
        'joined_at' => now(),
    ]);

    JoinRequest::create([
        'study_group_id' => $studyGroup->id,
        'user_id' => $memberUser->id,
        'status' => JoinRequestStatus::APPROVED,
    ]);

    $response = $this->actingAs($memberUser)->postJson("/api/study-groups/{$studyGroup->id}/leave");

    $response->assertStatus(200);

    $this->assertDatabaseMissing('study_group_members', [
        'study_group_id' => $studyGroup->id,
        'user_id' => $memberUser->id,
    ]);
});

it('owner cannot leave their own study group', function () {
    $owner = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create(['owner_id' => $owner->id]);

    $response = $this->actingAs($owner)->postJson("/api/study-groups/{$studyGroup->id}/leave");

    $response->assertStatus(500);
});

it('owner can remove a member from study group', function () {
    $owner = User::factory()->create();
    $memberUser = User::factory()->create();
    $studyGroup = StudyGroup::factory()->create(['owner_id' => $owner->id]);

    StudyGroupMember::create([
        'study_group_id' => $studyGroup->id,
        'user_id' => $memberUser->id,
        'role' => MemberRole::MEMBER,
        'joined_at' => now(),
    ]);

    $response = $this->actingAs($owner)->deleteJson("/api/study-groups/{$studyGroup->id}/members/{$memberUser->id}");

    $response->assertStatus(200);

    $this->assertDatabaseMissing('study_group_members', [
        'study_group_id' => $studyGroup->id,
        'user_id' => $memberUser->id,
    ]);
});
