<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JoinRequest;
use App\Models\StudyGroup;
use App\Services\JoinRequestService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JoinRequestController extends Controller
{
    public function __construct(protected JoinRequestService $joinRequestService,) {}

    /**
     * User mengirim permintaan bergabung.
     */
    public function requestJoin(
        Request $request,
        StudyGroup $studyGroup,
    ): JsonResponse{
        $joinRequest = $this->joinRequestService->requestJoin(
            $request->user(),
            $studyGroup,
        );

        return response()->json(
            $joinRequest,
            201
        );
    }

    /**
     * Owner menyetujui permintaan bergabung.
     */
    public function approve(
        JoinRequest $joinRequest,
    ): JsonResponse {
        $joinRequest = $this->joinRequestService->approve($joinRequest);

        return response()->json($joinRequest);
    }

    /**
     * Owner menolak permintaan bergabung.
     */
    public function reject(
        JoinRequest $joinRequest,
    ): JsonResponse{
        $joinRequest = $this->joinRequestService->reject($joinRequest);

        return response()->json($joinRequest);
    }

    /**
     * User membatalkan permintaan bergabung.
     */
    public function cancel(
        JoinRequest $joinRequest,
    ): JsonResponse {

        $this->joinRequestService->cancel(
            $joinRequest,
        );

        return response()->json([
            'message' => 'Join request cancelled successfully.',
        ]);
    }
}
