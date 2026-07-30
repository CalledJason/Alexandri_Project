<?php

namespace App\Enums;

enum StudyGroupStatus: string
{
    case OPEN = 'open';
    case ONGOING = 'ongoing';
    case FINISHED = 'finished';
    case CANCELLED = 'cancelled';
}