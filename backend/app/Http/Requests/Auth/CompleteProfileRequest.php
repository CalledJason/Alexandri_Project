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
}
