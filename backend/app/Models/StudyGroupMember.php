<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;


class StudyGroupMember extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'study_group_id',
        'user_id',
        'role',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    /**
     * Study group.
     */
    public function studyGroup(): BelongsTo
    {
        return $this->belongsTo(StudyGroup::class);
    }

    /**
     * Member.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
