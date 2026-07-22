<?php

namespace App\Services;

use App\Models\JoinRequest;
use App\Models\StudyGroup;
use App\Models\User;

use App\Enums\JoinRequestStatus;
use App\Enums\MemberRole;
use App\Enums\NotificationType;
use App\Enums\StudyGroupStatus;

use Illuminate\Support\Facades\DB;

class JoinRequestService
{
    public function __construct(
        protected NotificationService $notificationService,
    ) {}

    /**
     * User mengirim permintaan bergabung ke study group.
     */
    public function requestJoin(
        User $user,
        StudyGroup $studyGroup
    ): JoinRequest {
        // Room harus available atau open 
        if ($studyGroup->status !== StudyGroupStatus::OPEN) {
            throw new \Exception('Study group is not open.');
        }

        // User sudah menjadi member termasuk owner otomatis masuk ke dalam member
        $isMember = $studyGroup->members()
            ->whereKey($user->id)
            ->exists();

        if ($isMember) {
            throw new \Exception('Youre already a member of this study group.');
        }

        // Checking apa ada request yang pending
        $hasPendingRequest = JoinRequest::query()
            ->where('study_group_id', $studyGroup->id)
            ->where('user_id', $user->id)
            ->where('status', JoinRequestStatus::PENDING)
            ->exists();

        if ($hasPendingRequest) {
            throw new \Exception('You already have a pending join request for this study group.');
        }

        // Check kuota available
        if ($studyGroup->members()->count() >= $studyGroup->max_members) {
            throw new \Exception('Study Group is already full');
        }

        // Simpan join request
        $joinRequest = JoinRequest::create([
            'study_group_id' => $studyGroup->id,
            'user_id' => $user->id,
            'status' => JoinRequestStatus::PENDING,
        ]);

        // Notifikasi ke owner
        $this->notificationService->send(
            $studyGroup->owner,
            NotificationType::JOIN_REQUEST->value,
            'Join Request',
            "{$user->name} ingin bergabung ke study group \"{$studyGroup->title}\".",
            "/study-groups/{$studyGroup->id}/join-requests"
        );
        
        return $joinRequest;
    }

    public function approve(JoinRequest $joinRequest): JoinRequest
    {
        return DB::transaction(function () use ($joinRequest) {
            if ($joinRequest->status !== JoinRequestStatus::PENDING) {
                throw new \Exception('Join request has already been processed.');
            }

            $studyGroup = $joinRequest->studyGroup;

            // Checking kuota if max
            if ($studyGroup->members()->count() >= $studyGroup->max_members) {
                throw new \Exception('Study Group is already full');
            }

            // Approve request
            $joinRequest->update([
                'status' => JoinRequestStatus::APPROVED,
            ]);

            // Pastikan user belum menjadi member
            if ($studyGroup->members()->whereKey($joinRequest->user_id)->exists()) {
                throw new \Exception('User is already a member of this study group.');
            }

            // Tambahkan sebagai member
            $studyGroup->members()->attach(
                $joinRequest->user_id, [
                    'role' => MemberRole::MEMBER,
                    'joined_at' => now(),
                ]
            );

            // Notifikasi user if approve
            $this->notificationService->send(
                $joinRequest->user,
                NotificationType::JOIN_APPROVED->value,
                'Join Request Approved',
                "Permintaan bergabung ke \"{$studyGroup->title}\" telah disetujui.",
                "/study-groups/{$studyGroup->id}"
            );

            return $joinRequest->fresh([
                'user',
                'studyGroup',
            ]);
        });
    }

    /**
     * Owner menolak permintaan bergabung.
     */
    public function reject(JoinRequest $joinRequest): JoinRequest
    {
        return DB::transaction(function () use ($joinRequest) {
            if ($joinRequest->status !== JoinRequestStatus::PENDING) {
                throw new \Exception('Join request has already been processed.');
            }

            $joinRequest->update([
                'status' => JoinRequestStatus::REJECTED,
            ]);

            $this->notificationService->send(
                $joinRequest->user,
                NotificationType::JOIN_REJECTED->value,
                'Join Request Rejected',
                "Permintaan bergabung ke \"{$joinRequest->studyGroup->title}\" ditolak.",
                null
            );

            return $joinRequest->fresh([
                'user',
                'studyGroup',
            ]);
        });
        
    }

    /**
     * User membatalkan permintaan bergabung.
     */
    public function cancel(JoinRequest $joinRequest): void
    {
        if ($joinRequest->status !== JoinRequestStatus::PENDING) {
            throw new \Exception('Only pending requests can be cancelled.');
        }

        $joinRequest->delete();
    }
}