<?php

namespace App\Services;

class WhatsAppService
{
    /**
     * Generate WhatsApp invite link.
     */
    public function generate(): string
    {
        return fake()->url();
    }

    /**
     * Validate WhatsApp invite link format.
     */
    public function isValidInviteLink(string $link): bool
    {
        return str_starts_with($link, 'https://chat.whatsapp.com/');
    }
}