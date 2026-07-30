<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory, HasUlids;

    protected $fillable= [
        'name',
    ];

    /**
     * Get all study groups that have this tag.
     */
    public function studyGroups(): BelongsToMany
    {
        return $this->belongsToMany(StudyGroup::class);
    }

    /**
     * Get all majors associated with this tag.
     */
    public function majors(): BelongsToMany
    {
        return $this->belongsToMany(Major::class);
    }
}
