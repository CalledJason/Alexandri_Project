<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Relations\HasMany;

class University extends Model
{
    use HasFactory, HasUlids;

    protected $fillable = [
        'name',
        'short_name',
        'domain',
        'city',
    ];

    /**
     * Get all majors in this university.
     */
    public function majors(): HasMany
    {
        return $this->hasMany(Major::class);
    }

    /**
     * Get all users in this university.
     */
    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}