<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\StudyGroupStatus;

class StudyGroup extends Model
{
    use HasFactory, HasUlids, SoftDeletes;

    protected $fillable = [
        'owner_id',
        'title',
        'description',
        'location',
        'meeting_time',
        'max_members',
        'whatsapp_link',
        'visibility',
        'status',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'meeting_time' => 'datetime',
            'expires_at' => 'datetime',
            'status' => StudyGroupStatus::class,
        ];
    }

    /**
     * Owner of the study group.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Members of the study group.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'study_group_members')
                ->withPivot('role', 'joined_at')
                ->withTimestamps();
    }

    /**
     * Member records.
     */
    public function memberRecords(): HasMany
    {
        return $this->hasMany(StudyGroupMember::class);
    }

    /**
     * Join requests.
     */
    public function joinRequests(): HasMany
    {
        return $this->hasMany(JoinRequest::class);
    }

    /**
     * Tags.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }
}
