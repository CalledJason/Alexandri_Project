<?php

namespace App\Services;

use App\Models\User;

use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\University;

class AuthService
{
    /**
     * Register user baru.
     */
    public function register(
        array $data,
    ): User {

        // Ambil domain email
        $domain = substr(
            strrchr($data['email'], '@'),
            1
        );

        // Cari universitas berdasarkan domain
        $university = University::where(
            'domain',
            $domain
        )->first();

        if (! $university) {
            throw ValidationException::withMessages([
                'email' => [
                    'Email domain is not registered.',
                ],
            ]);
        }

        return User::create([
            'university_id' => $university->id,
            'name'          => $data['name'],
            'email'         => $data['email'],
            'password'      => Hash::make($data['password']),
        ]);
    }

    /**
     * Login user.
     */
    public function login(
        array $credentials,
    ): string {

        $user = User::where(
            'email',
            $credentials['email']
        )->first();

        if (
            ! $user ||
            ! Hash::check(
                $credentials['password'],
                $user->password
            )
        ) {
            throw ValidationException::withMessages([
                'email' => [
                    'Invalid credentials.',
                ],
            ]);
        }

        return $user
            ->createToken('auth-token')
            ->plainTextToken;
    }

    /**
     * Logout user.
     */
    public function logout(
        User $user,
    ): void {

        $user->currentAccessToken()->delete();
    }

    /**
 * Complete user profile.
 */
    public function completeProfile(
        User $user,
        array $data,
    ): User {

    $user->update([
        'major_id'   => $data['major_id'],
        'student_id' => $data['student_id'],
        'semester'   => $data['semester'],
    ]);

    return $user->fresh();
    }
}