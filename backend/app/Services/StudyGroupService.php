<?php

namespace App\Services;

use App\Enums\MemberRole;
use App\Enums\NotificationType;
use App\Enums\StudyGroupStatus;
use App\Models\StudyGroup;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use App\Models\StudyGroupMember;
use App\Policies\StudyGroupPolicy;

class StudyGroupService
{
    public function __construct(
        protected NotificationService $notificationService,
        protected WhatsAppService $whatsAppService,
    ) {
    }

    /**
     * Membuat study group baru.
     */
    public function create(
        User $owner,
        array $data,
    ): StudyGroup {
        return DB::transaction(function () use ($owner, $data) {

            $studyGroup = StudyGroup::create([
                'owner_id'     => $owner->id,
                'title'        => $data['title'],
                'description'  => $data['description'],
                'location'     => $data['location'],
                'meeting_time' => $data['meeting_time'],
                'max_members'   => $data['max_members'],
                'visibility'   => $data['visibility'] ?? 'public',
                'expires_at'   => $data['expires_at'],
            'status' => StudyGroupStatus::OPEN->value,
        ]);

        // Owner otomatis menjadi member
        StudyGroupMember::create([
            'study_group_id' => $studyGroup->id,
            'user_id'        => $owner->id,
            'role'           => MemberRole::OWNER,
            'joined_at'      => now(),
        ]);

        return $studyGroup->fresh([
            'owner',
            'members',
        ]);
    });
}

    /**
     * Memperbarui study group.
     */
    public function update(
        StudyGroup $studyGroup,
        array $data,
    ): StudyGroup{

        if ($studyGroup->status !== StudyGroupStatus::OPEN){
            throw new \Exception('Hanya study group yang dibuka yang dapat diperbarui.');
        }
        
        $updateData = array_filter([
            'title' => $data['title'] ?? null,
            'description' => $data['description'] ?? null,
            'location' => $data['location'] ?? null,
            'meeting_time' => $data['meeting_time'] ?? null,
            'max_members' => $data['max_members'] ?? null,
            'visibility' => $data['visibility'] ?? null,
            'whatsapp_link' => $data['whatsapp_link'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
        ], fn($value) => !is_null($value));

        $studyGroup->update($updateData);

        if (isset($data['tags'])) {
            $studyGroup->tags()->sync($data['tags']);
        }

        return $studyGroup->fresh([
            'owner',
            'members',
            'tags',
        ]);
    }

    /**
     * Memulai study group.
     */
    public function start(
        StudyGroup $studyGroup,
        string $whatsappLink,
    ): StudyGroup {
        return DB::transaction(function () use ($studyGroup, $whatsappLink) {

            if ($studyGroup->status !== StudyGroupStatus::OPEN) {
                throw new \Exception('Study group tidak dapat dimulai.');
            }

            if (now()->greaterThan($studyGroup->expires_at)) {
                throw new \Exception('Study group sudah melewati batas waktu.');
            }
            if (! $this->whatsAppService->isValidInviteLink($whatsappLink)) {
                throw new \Exception('Tautan undangan WhatsApp tidak valid.');
            }

            $studyGroup->update([
                'status' => StudyGroupStatus::ONGOING->value,
                'whatsapp_link' => $whatsappLink,
            ]);

            foreach ($studyGroup->members as $member) {
                $this->notificationService->send(
                    $member,
                    NotificationType::STUDY_STARTED->value,
                    'Sesi Belajar Dimulai',
                    "Study group \"{$studyGroup->title}\" telah dimulai.",
                    "/study-groups/{$studyGroup->id}"
                );
            }

            return $studyGroup->fresh([
                'owner',
                'members',
            ]);
        });
    }

    /**
     * Menyelesaikan study group.
     */
    public function finish(
        StudyGroup $studyGroup,
    ): StudyGroup {
        return DB::transaction(function () use ($studyGroup) {

            if ($studyGroup->status !== StudyGroupStatus::ONGOING) {
                throw new \Exception('Study group tidak sedang berlangsung.');
            }

            $studyGroup->update([
                'status' => StudyGroupStatus::FINISHED->value,
            ]);

            foreach ($studyGroup->members as $member) {
                $this->notificationService->send(
                    $member,
                    NotificationType::STUDY_FINISHED->value,
                    'Sesi Belajar Selesai',
                    "Study group \"{$studyGroup->title}\" telah selesai.",
                );
            }

            return $studyGroup->fresh([
                'owner',
                'members',
            ]);
        });
    }
    /**
     * Membatalkan study group.
     */
    public function cancel(
        StudyGroup $studyGroup,
    ): StudyGroup {
        return DB::transaction(function () use ($studyGroup) {

            if ($studyGroup->status === StudyGroupStatus::FINISHED) {
                throw new \Exception('Study group yang sudah selesai tidak dapat dibatalkan.');
            }

            if ($studyGroup->status === StudyGroupStatus::CANCELLED) {
                throw new \Exception('Study group ini sudah dibatalkan sebelumnya.');
            }

            $studyGroup->update([
                'status' => StudyGroupStatus::CANCELLED->value,
            ]);

            foreach ($studyGroup->members as $member) {
                $this->notificationService->send(
                    $member,
                    NotificationType::STUDY_CANCELLED->value,
                    'Study Group Dibatalkan',
                    "Study group \"{$studyGroup->title}\" telah dibatalkan.",
                );
            }

            return $studyGroup->fresh([
                'owner',
                'members',
            ]);
        });
    }

    /**
     * Menghapus study group.
     */
    public function delete(
        StudyGroup $studyGroup,
    ): void {
        DB::transaction(function () use ($studyGroup) {
            $studyGroup->joinRequests()->delete();
            $studyGroup->memberRecords()->delete();
            $studyGroup->tags()->detach();
            $studyGroup->delete();
        });
    }
}