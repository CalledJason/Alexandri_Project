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

Route::get('/universities', function (\Illuminate\Http\Request $request) {
    $query = \App\Models\University::query()->with('majors');
    if ($request->has('domain') && !empty($request->query('domain'))) {
        $domain = trim($request->query('domain'));
        $query->where('domain', 'like', "%{$domain}%");
    }
    return response()->json($query->get());
});
Route::get('/majors', function (\Illuminate\Http\Request $request) {
    $query = \App\Models\Major::query()->with('university');
    if ($request->has('university_id') && !empty($request->query('university_id'))) {
        $query->where('university_id', $request->query('university_id'));
    }
    if ($request->has('domain') && !empty($request->query('domain'))) {
        $domain = trim($request->query('domain'));
        $query->whereHas('university', function ($q) use ($domain) {
            $q->where('domain', 'like', "%{$domain}%");
        });
    }
    return response()->json($query->get());
});
Route::get('/tags', function () {
    return response()->json(\App\Models\Tag::all());
});
Route::get('/stats', function () {
    return response()->json([
        'active_groups_count' => \App\Models\StudyGroup::count(),
        'universities_count' => \App\Models\University::count(),
        'total_members_count' => \App\Models\StudyGroupMember::count() ?: \App\Models\User::count(),
        'tags_count' => \App\Models\Tag::count(),
    ]);
});
Route::get('/study-groups', [StudyGroupController::class, 'index']);
Route::get('/study-groups/{studyGroup}', [StudyGroupController::class, 'show']);

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

    Route::post('/study-groups', [StudyGroupController::class, 'store']);
    Route::put('/study-groups/{studyGroup}', [StudyGroupController::class, 'update']);
    Route::delete('/study-groups/{studyGroup}', [StudyGroupController::class, 'destroy']);

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

    Route::get(
        'my-requests',
        [JoinRequestController::class, 'myRequests']
    );

    Route::get(
        'study-groups/{studyGroup}/requests',
        [JoinRequestController::class, 'groupRequests']
    );

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