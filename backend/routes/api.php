<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\StudyGroupController;
use App\Http\Controllers\Api\JoinRequestController;
use App\Http\Controllers\Api\NotificationController;


/*
|--------------------------------------------------------------------------
| Authentication
|--------------------------------------------------------------------------
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication
    |--------------------------------------------------------------------------
    */

    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::patch(
        '/profile',
        [AuthController::class, 'completeProfile']
    );

    /*
    |--------------------------------------------------------------------------
    | Study Groups
    |--------------------------------------------------------------------------
    */

    Route::apiResource('study-groups', StudyGroupController::class);

    Route::patch(
        'study-groups/{studyGroup}/start',
        [StudyGroupController::class, 'start']
    );

    Route::patch(
        'study-groups/{studyGroup}/finish',
        [StudyGroupController::class, 'finish']
    );

    Route::patch(
        'study-groups/{studyGroup}/cancel',
        [StudyGroupController::class, 'cancel']
    );

    /*
    |--------------------------------------------------------------------------
    | Join Requests
    |--------------------------------------------------------------------------
    */

    Route::post(
        'study-groups/{studyGroup}/join',
        [JoinRequestController::class, 'requestJoin']
    );

    Route::patch(
        'join-requests/{joinRequest}/approve',
        [JoinRequestController::class, 'approve']
    );

    Route::patch(
        'join-requests/{joinRequest}/reject',
        [JoinRequestController::class, 'reject']
    );

    Route::delete(
        'join-requests/{joinRequest}',
        [JoinRequestController::class, 'cancel']
    );

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */

    Route::get(
        'notifications',
        [NotificationController::class, 'index']
    );

    Route::patch(
        'notifications/{notification}/read',
        [NotificationController::class, 'read']
    );

    Route::patch(
        'notifications/read-all',
        [NotificationController::class, 'readAll']
    );
});