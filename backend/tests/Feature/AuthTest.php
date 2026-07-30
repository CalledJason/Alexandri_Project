<?php

use App\Models\User;
use App\Models\University;
use App\Models\Major;

it('registers a user successfully', function () {
    University::factory()->create([
        'domain' => 'example.ac.id'
    ]);

    $response = $this->postJson('/api/register', [
        'name' => 'Test User',
        'email' => 'test@example.ac.id',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'message',
            'user' => [
                'id',
                'name',
                'email',
            ]
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.ac.id'
    ]);
});

it('logs in a user successfully', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'message',
            'token'
        ]);
});

it('fails to login with invalid credentials', function () {
    $user = User::factory()->create([
        'password' => bcrypt('password123'),
    ]);

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

it('can fetch authenticated user profile (me)', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->getJson('/api/me');

    $response->assertStatus(200)
        ->assertJsonPath('email', $user->email);
});

it('can complete user profile', function () {
    $user = User::factory()->create();
    $university = University::factory()->create();
    $major = Major::factory()->create(['university_id' => $university->id]);

    $response = $this->actingAs($user)->patchJson('/api/profile', [
        'university_id' => $university->id,
        'major_id' => $major->id,
        'semester' => 5,
        'student_id' => '123456789'
    ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'university_id' => $university->id,
        'major_id' => $major->id,
        'semester' => 5,
        'student_id' => '123456789'
    ]);
});

it('logs out a user successfully', function () {
    $user = User::factory()->create();
    $token = $user->createToken('auth_token')->plainTextToken;

    $response = $this->withHeaders([
        'Authorization' => 'Bearer ' . $token,
    ])->postJson('/api/logout');

    $response->assertStatus(200)
        ->assertJson([
            'message' => 'Logout successful.'
        ]);

    $this->assertCount(0, $user->tokens);
});
