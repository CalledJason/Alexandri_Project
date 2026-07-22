<?php

namespace App\Policies;

use App\Models\StudyGroup;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class StudyGroupPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, StudyGroup $studyGroup): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, StudyGroup $studyGroup): bool
    {
        return true;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, StudyGroup $studyGroup): bool
    {
        return true;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, StudyGroup $studyGroup): bool
    {
        return false;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, StudyGroup $studyGroup): bool
    {
        return false;
    }

    public function start(
        User $user,
        StudyGroup $studyGroup,
    ): bool {
        return $user->id === $studyGroup->owner_id;
    }
}