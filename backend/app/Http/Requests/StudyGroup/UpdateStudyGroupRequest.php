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

            'whatsapp_link' => [
                'sometimes',
                'nullable',
                'string',
                'url',
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

    /**
     * Custom validator to ensure max_members is not less than current members count.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $studyGroup = $this->route('study_group');
            if ($studyGroup && $this->has('max_members')) {
                $currentMembersCount = $studyGroup->members()->count();
                if ((int) $this->max_members < $currentMembersCount) {
                    $validator->errors()->add('max_members', "Kapasitas anggota tidak boleh kurang dari jumlah anggota yang sudah diterima ({$currentMembersCount} orang).");
                }
            }
        });
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.max' => 'Judul study group maksimal 100 karakter.',
            'description.max' => 'Deskripsi study group maksimal 1000 karakter.',
            'max_members.between' => 'Kapasitas anggota harus antara 2 hingga 20 mahasiswa.',
            'whatsapp_link.url' => 'Format link WhatsApp harus berupa URL yang valid (https://chat.whatsapp.com/...).',
        ];
    }
}
