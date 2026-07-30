<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\JoinRequestStatus;

class JoinRequest extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'study_group_id',
        'user_id',
        'message',
        'status',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
            'status' => JoinRequestStatus::class,
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
     * Request sender.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
