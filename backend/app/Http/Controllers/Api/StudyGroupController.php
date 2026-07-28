<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

use App\Http\Requests\StudyGroup\StoreStudyGroupRequest;
use App\Http\Requests\StudyGroup\UpdateStudyGroupRequest;

use App\Models\StudyGroup;

use App\Services\StudyGroupService;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudyGroupController extends Controller
{
    public function __construct(
        protected StudyGroupService $studyGroupService,
    ) {
    }

    /**
     * Menampilkan seluruh study group.
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', StudyGroup::class);

        $query = StudyGroup::query()
            ->withCount('members')
            ->with('tags');

        if ($request->has('owner_id') && !empty($request->query('owner_id'))) {
            $query->where('owner_id', $request->query('owner_id'));
        }

        if ($request->has('category_id') && !empty($request->query('category_id'))) {
            $tagId = $request->query('category_id');
            $query->whereHas('tags', function ($tagQuery) use ($tagId) {
                $tagQuery->where('tags.id', $tagId);
            });
        }

        if ($request->has('search') && !empty($request->query('search'))) {
            $search = trim($request->query('search'));
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereHas('tags', function ($tagQuery) use ($search) {
                      $tagQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $studyGroups = $query->latest()->paginate(10);

        return response()->json($studyGroups);
    }

    /**
     * Menampilkan detail study group.
     */
    public function show(
        StudyGroup $studyGroup,
    ): JsonResponse {

        $this->authorize('view', $studyGroup);
        
        $studyGroup->loadCount('members');
        $studyGroup->load('tags', 'owner');

        return response()->json($studyGroup);
    }

    /**
     * Membuat study group baru.
     */
    public function store(
        StoreStudyGroupRequest $request,
    ): JsonResponse {

        $this->authorize('create', StudyGroup::class);

        $studyGroup = $this->studyGroupService->create(
            $request->user(),
            $request->validated(),
        );

        return response()->json(
            $studyGroup,
            201,
        );
    }

    /**
     * Mengubah study group.
     */
    public function update(
        UpdateStudyGroupRequest $request,
        StudyGroup $studyGroup,
    ): JsonResponse {

        $this->authorize('update', $studyGroup);

        $studyGroup = $this->studyGroupService->update(
            $studyGroup,
            $request->validated(),
        );

        return response()->json($studyGroup);
    }

    /**
     * Memulai study group.
     */
    public function start(
        Request $request,
        StudyGroup $studyGroup,
    ): JsonResponse {

        $this->authorize('start', $studyGroup);

        $studyGroup = $this->studyGroupService->start(
            $studyGroup,
            $request->string('whatsapp_link'),
        );

        return response()->json($studyGroup);
    }

    /**
     * Menyelesaikan study group.
     */
    public function finish(
        StudyGroup $studyGroup,
    ): JsonResponse {

        $this->authorize('finish', $studyGroup);

        $studyGroup = $this->studyGroupService->finish(
            $studyGroup,
        );

        return response()->json($studyGroup);
    }

    /**
     * Membatalkan study group.
     */
    public function cancel(
        StudyGroup $studyGroup,
    ): JsonResponse {

        $this->authorize('cancel', $studyGroup);

        $studyGroup = $this->studyGroupService->cancel(
            $studyGroup,
        );

        return response()->json($studyGroup);
    }

    /**
     * Menghapus study group.
     */
    public function destroy(
        StudyGroup $studyGroup,
    ): JsonResponse {

        $this->authorize('delete', $studyGroup);

        $this->studyGroupService->delete(
            $studyGroup,
        );

        return response()->json([
            'message' => 'Study group deleted successfully.',
        ]);
    }
}
