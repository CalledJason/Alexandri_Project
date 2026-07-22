<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;

use App\Services\AuthService;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Requests\Auth\CompleteProfileRequest;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService,
    ) {
    }

    /**
     * Register.
     */
    public function register(
        RegisterRequest $request,
    ): JsonResponse {


        $user = $this->authService->register(
            $request->validated()
        );

        return response()->json([
            'message' => 'Register successful.',
            'user' => $user,
        ], 201);
    }

    /**
     * Login.
     */
    public function login(
    LoginRequest $request,
    ): JsonResponse {

        $token = $this->authService->login(
            $request->validated()
        );

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
        ]);
    }

    /**
     * Logout.
     */
    public function logout(
        Request $request,
    ): JsonResponse {

        $this->authService->logout(
            $request->user()
        );

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    /**
     * Current user.
     */
    public function me(
        Request $request,
    ): JsonResponse {

        return response()->json(
            $request->user()
        );
    }

    /**
 * Complete user profile.
 */
    public function completeProfile(
        CompleteProfileRequest $request,
    ): JsonResponse {

    $user = $this->authService->completeProfile(
        $request->user(),
        $request->validated(),
    );

    return response()->json([
        'message' => 'Profile completed successfully.',
        'data' => $user->load([
            'university',
            'major',
        ]),
    ]);
    }
}
