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
     * Get user's join requests.
     */
    public function myRequests(Request $request): JsonResponse
    {
        $requests = JoinRequest::with('studyGroup')->where('user_id', $request->user()->id)->get();
        return response()->json($requests);
    }

    /**
     * Get join requests for a specific group.
     */
    public function groupRequests(Request $request, StudyGroup $studyGroup): JsonResponse
    {
        if ($request->user()->id !== $studyGroup->owner_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $requests = $studyGroup->joinRequests()->with('user')->get();
        return response()->json($requests);
    }

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
            $request->input('message'),
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

    /**
     * User keluar dari study group.
     */
    public function leaveGroup(Request $request, StudyGroup $studyGroup): JsonResponse
    {
        $this->joinRequestService->leaveGroup($studyGroup, $request->user());

        return response()->json([
            'message' => 'Berhasil keluar dari study group.',
        ]);
    }

    /**
     * Owner mengeluarkan/menghapus anggota dari study group.
     */
    public function removeMember(Request $request, StudyGroup $studyGroup, \App\Models\User $user): JsonResponse
    {
        $this->joinRequestService->removeMember($studyGroup, $request->user(), $user);

        return response()->json([
            'message' => 'Anggota berhasil dikeluarkan dari study group.',
        ]);
    }
}
