<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Notification\ReadNotificationRequest;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Menampilkan semua notifikasi milik user.
     */
    public function index(
        Request $request,
    ): JsonResponse {

        $notifications = $request->user()
            ->notifications()
            ->latest()
            ->paginate(15);

        return response()->json($notifications);
    }

    /**
     * Menandai satu notifikasi sebagai telah dibaca.
     */
    public function read(
        ReadNotificationRequest $request,
        Notification $notification,
    ): JsonResponse {

        $notification->update([
            'is_read' => true,
        ]);

        return response()->json($notification);
    }

    /**
     * Menandai semua notifikasi sebagai telah dibaca.
     */
    public function readAll(
        Request $request,
    ): JsonResponse {

        $request->user()
            ->notifications()
            ->where('is_read', false)
            ->update([
                'is_read' => true,
            ]);

        return response()->json([
            'message' => 'Semua notifikasi telah ditandai dibaca.',
        ]);
    }

    /**
     * Menghapus semua notifikasi milik user.
     */
    public function deleteAll(
        Request $request,
    ): JsonResponse {

        $request->user()
            ->notifications()
            ->delete();

        return response()->json([
            'message' => 'Semua notifikasi berhasil dibersihkan.',
        ]);
    }
}
