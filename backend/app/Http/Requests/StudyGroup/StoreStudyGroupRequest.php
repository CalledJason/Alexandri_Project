<?php

namespace App\Http\Requests\StudyGroup;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use App\Enums\Visibility;
use Illuminate\Validation\Rules\Enum;

class StoreStudyGroupRequest extends FormRequest
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
                'required',
                'string',
                'max:100',
            ],

            'description' => [
                'required',
                'string',
                'max:1000',
            ],

            'location' => [
                'required',
                'string',
                'max:255',
            ],

            'meeting_time' => [
                'required',
                'date',
                'after:now',
            ],

            'max_members' => [
                'required',
                'integer',
                'between:2,20',
            ],

            'visibility' => [
                'required',
                new Enum(Visibility::class),
            ],

            'expires_at' => [
                'required',
                'date',
                'after:meeting_time',
            ],

            'duration' => [
                'required',
                'integer',
                'between:1,5',
            ],

            'tags' => [
                'nullable',
                'array',
                'max:5',
            ],

            'tags.*' => [
                'exists:tags,id',
            ],
        ];
    }
}
