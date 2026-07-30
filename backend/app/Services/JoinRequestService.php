<?php

namespace App\Services;

use App\Models\JoinRequest;
use App\Models\StudyGroup;
use App\Models\StudyGroupMember;
use App\Models\User;

use App\Enums\JoinRequestStatus;
use App\Enums\MemberRole;
use App\Enums\NotificationType;
use App\Enums\StudyGroupStatus;

use Illuminate\Support\Facades\DB;
use App\Events\NewJoinRequest;
use App\Events\JoinRequestApproved;

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
        StudyGroup $studyGroup,
        ?string $message = null,
    ): JoinRequest {
        // Room harus available atau open 
        if ($studyGroup->status !== StudyGroupStatus::OPEN) {
            throw new \Exception('Study group sedang tidak dibuka.');
        }

        // Strict Profile Check: User must complete NIM (student_id) and Major (major_id) before joining
        if (empty($user->student_id) || empty($user->major_id)) {
            throw new \Exception('Profil belum lengkap. Anda wajib melengkapi Jurusan dan NIM di profil terlebih dahulu sebelum bergabung ke study group.');
        }

        // User sudah menjadi member termasuk owner otomatis masuk ke dalam member
        $isMember = $studyGroup->members()
            ->whereKey($user->id)
            ->exists();

        if ($isMember) {
            throw new \Exception('Anda sudah menjadi anggota study group ini.');
        }

        // Checking apa ada request yang pending
        $hasPendingRequest = JoinRequest::query()
            ->where('study_group_id', $studyGroup->id)
            ->where('user_id', $user->id)
            ->where('status', JoinRequestStatus::PENDING)
            ->exists();

        if ($hasPendingRequest) {
            throw new \Exception('Anda sudah memiliki permintaan bergabung yang sedang diproses.');
        }

        // Check kuota available
        if ($studyGroup->members()->count() >= $studyGroup->max_members) {
            throw new \Exception('Kapasitas study group sudah penuh.');
        }

        // Simpan join request
        $joinRequest = JoinRequest::create([
            'study_group_id' => $studyGroup->id,
            'user_id' => $user->id,
            'message' => $message,
            'status' => JoinRequestStatus::PENDING,
        ]);

        // Notifikasi ke owner
        $this->notificationService->send(
            $studyGroup->owner,
            NotificationType::JOIN_REQUEST->value,
            'Permintaan Bergabung',
            "{$user->name} ingin bergabung ke study group \"{$studyGroup->title}\".",
            "/study-groups/{$studyGroup->id}/join-requests"
        );
        
        NewJoinRequest::dispatch($joinRequest);

        return $joinRequest;
    }

    public function approve(JoinRequest $joinRequest): JoinRequest
    {
        return DB::transaction(function () use ($joinRequest) {
            if ($joinRequest->status !== JoinRequestStatus::PENDING) {
                throw new \Exception('Permintaan bergabung ini sudah pernah diproses.');
            }

            $studyGroup = $joinRequest->studyGroup;

            // Checking kuota if max
            if ($studyGroup->members()->count() >= $studyGroup->max_members) {
                throw new \Exception('Kapasitas study group sudah penuh.');
            }

            // Approve request
            $joinRequest->update([
                'status' => JoinRequestStatus::APPROVED,
            ]);

            // Pastikan user belum menjadi member
            if ($studyGroup->members()->whereKey($joinRequest->user_id)->exists()) {
                throw new \Exception('Pengguna sudah menjadi anggota study group ini.');
            }

            // Tambahkan sebagai member
            StudyGroupMember::create([
                'study_group_id' => $studyGroup->id,
                'user_id' => $joinRequest->user_id,
                'role' => MemberRole::MEMBER,
                'joined_at' => now(),
            ]);

            // Notifikasi user if approve
            $this->notificationService->send(
                $joinRequest->user,
                NotificationType::JOIN_APPROVED->value,
                'Permintaan Bergabung Disetujui',
                "Permintaan bergabung ke \"{$studyGroup->title}\" telah disetujui.",
                "/study-groups/{$studyGroup->id}"
            );

            JoinRequestApproved::dispatch($joinRequest);

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
                throw new \Exception('Permintaan bergabung ini sudah pernah diproses.');
            }

            $joinRequest->update([
                'status' => JoinRequestStatus::REJECTED,
            ]);

            $this->notificationService->send(
                $joinRequest->user,
                NotificationType::JOIN_REJECTED->value,
                'Permintaan Bergabung Ditolak',
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
            throw new \Exception('Hanya permintaan yang belum diproses yang dapat dibatalkan.');
        }

        $joinRequest->delete();
    }

    /**
     * User keluar dari study group.
     */
    public function leaveGroup(StudyGroup $studyGroup, User $user): void
    {
        if ($studyGroup->owner_id === $user->id) {
            throw new \Exception('Inisiator grup tidak dapat keluar dari grup sendiri.');
        }

        DB::transaction(function () use ($studyGroup, $user) {
            // Hapus keanggotaan
            StudyGroupMember::where('study_group_id', $studyGroup->id)
                ->where('user_id', $user->id)
                ->delete();

            // Hapus permintaan bergabung
            JoinRequest::where('study_group_id', $studyGroup->id)
                ->where('user_id', $user->id)
                ->delete();

            // Notifikasi ke owner
            $this->notificationService->send(
                $studyGroup->owner,
                NotificationType::JOIN_REJECTED->value,
                'Anggota Keluar',
                "{$user->name} telah keluar dari study group \"{$studyGroup->title}\".",
                "/study-groups/{$studyGroup->id}"
            );
        });
    }

    /**
     * Owner mengeluarkan/menghapus anggota dari study group.
     */
    public function removeMember(StudyGroup $studyGroup, User $owner, User $member): void
    {
        if ($studyGroup->owner_id !== $owner->id) {
            throw new \Exception('Hanya owner yang berhak mengeluarkan anggota.');
        }

        if ($member->id === $owner->id) {
            throw new \Exception('Tidak dapat mengeluarkan owner dari grup.');
        }

        DB::transaction(function () use ($studyGroup, $member) {
            // Hapus keanggotaan
            StudyGroupMember::where('study_group_id', $studyGroup->id)
                ->where('user_id', $member->id)
                ->delete();

            // Hapus permintaan bergabung
            JoinRequest::where('study_group_id', $studyGroup->id)
                ->where('user_id', $member->id)
                ->delete();

            // Notifikasi ke member yang dikeluarkan
            $this->notificationService->send(
                $member,
                NotificationType::JOIN_REJECTED->value,
                'Dikeluarkan dari Grup',
                "Anda telah dikeluarkan dari study group \"{$studyGroup->title}\" oleh owner.",
                null
            );
        });
    }
}