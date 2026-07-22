<?php

namespace App\Enums;

enum NotificationType: string
{
    case STUDY_STARTED = 'study_started';
    case STUDY_FINISHED = 'study_finished';
    case STUDY_CANCELLED = 'study_cancelled';
    case JOIN_REQUEST = 'join_request';
    case JOIN_APPROVED = 'join_approved';
    case JOIN_REJECTED = 'join_rejected';
}
