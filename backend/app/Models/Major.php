<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Major extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'university_id',
        'name'
    ];

    /**
     * Get the university that owns this major.
     */
    public function university(): BelongsTo
    {
        return $this->belongsTo(University::class);
    }

    /**
     * Get all users in this major.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
