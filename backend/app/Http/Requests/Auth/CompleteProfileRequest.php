<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CompleteProfileRequest extends FormRequest
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
            'major_id' => [
                'required',
                'exists:majors,id',
            ],

            'student_id' => [
                'required',
                'string',
                'min:3',
                'max:30',
                'unique:users,student_id,' . $this->user()->id,
            ],

            'semester' => [
                'required',
                'integer',
                'between:1,14',
            ],

            'avatar' => [
                'nullable',
                'image',
                'max:2048',
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'major_id.required' => 'Jurusan / Program studi wajib dipilih.',
            'major_id.exists' => 'Jurusan yang dipilih tidak ditemukan.',
            'student_id.required' => 'NIM / NPM wajib diisi.',
            'student_id.min' => 'NIM / NPM minimal 3 karakter.',
            'student_id.max' => 'NIM / NPM maksimal 30 karakter.',
            'student_id.unique' => 'NIM / NPM ini sudah digunakan oleh akun mahasiswa lain.',
            'semester.required' => 'Semester wajib diisi.',
            'semester.integer' => 'Semester harus berupa angka.',
            'semester.between' => 'Semester harus di antara 1 dan 14.',
        ];
    }
}
