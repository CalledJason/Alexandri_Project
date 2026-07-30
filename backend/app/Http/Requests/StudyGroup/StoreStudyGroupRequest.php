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
                'sometimes',
                'nullable',
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

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'Judul study group wajib diisi.',
            'title.max' => 'Judul study group maksimal 100 karakter.',
            'description.required' => 'Deskripsi study group wajib diisi.',
            'description.max' => 'Deskripsi study group maksimal 1000 karakter.',
            'location.required' => 'Lokasi atau link tempat belajar wajib diisi.',
            'meeting_time.required' => 'Waktu pertemuan wajib ditentukan.',
            'meeting_time.after' => 'Waktu pertemuan harus di masa depan.',
            'max_members.required' => 'Jumlah anggota maksimal wajib diisi.',
            'max_members.between' => 'Kapasitas anggota harus antara 2 hingga 20 mahasiswa.',
            'expires_at.required' => 'Batas akhir pendaftaran wajib ditentukan.',
            'expires_at.after' => 'Batas akhir pendaftaran harus setelah waktu pertemuan.',
        ];
    }
}
