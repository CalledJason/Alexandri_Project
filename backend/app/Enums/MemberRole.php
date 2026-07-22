<?php

namespace App\Enums;

enum MemberRole: string
{
    case OWNER = 'owner';
    case MEMBER = 'member';
}