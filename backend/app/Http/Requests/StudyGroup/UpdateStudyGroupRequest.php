<?php

namespace App\Http\Requests\StudyGroup;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\Visibility;
use Illuminate\Validation\Rules\Enum;

class UpdateStudyGroupRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => [
                'sometimes',
                'string',
                'max:100',
            ],

            'description' => [
                'sometimes',
                'string',
                'max:1000',
            ],

            'location' => [
                'sometimes',
                'string',
                'max:255',
            ],

            'meeting_time' => [
                'sometimes',
                'date',
                'after:now',
            ],

            'max_members' => [
                'sometimes',
                'integer',
                'between:2,20',
            ],

            'visibility' => [
                'sometimes',
                new Enum(Visibility::class),
            ],

            'duration' => [
                'sometimes',
                'integer',
                'between:1,5',
            ],

            'tags' => [
                'sometimes',
                'array',
                'max:5',
            ],

            'expires_at' => [
                'sometimes',
                'date',
                'after:now',
            ],

            'tags.*' => [
                'exists:tags,id',
            ],
        ];
    }
}
