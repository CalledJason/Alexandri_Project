<?php

namespace App\Events;

use App\Models\JoinRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class JoinRequestApproved implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public JoinRequest $joinRequest;

    /**
     * Create a new event instance.
     */
    public function __construct(JoinRequest $joinRequest)
    {
        $this->joinRequest = $joinRequest->load('user', 'studyGroup');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('App.Models.User.' . $this->joinRequest->user_id),
        ];
    }
}
