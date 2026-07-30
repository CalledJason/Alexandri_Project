<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    /**
     * Create notification.
     */
    public function send(
        User $user,
        string $type,
        string $title,
        string $message,
        ?string $actionUrl = null
    ): Notification {

        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'action_url' => $actionUrl,
        ]);
    }
}