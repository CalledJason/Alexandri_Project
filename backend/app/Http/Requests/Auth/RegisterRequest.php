<?php

namespace App\Http\Requests\Auth;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
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
            'name' => [
            'required',
            'string',
            'max:100',
            ],
            
            'email' => [
            'required',
            'email',
            'ends_with:.ac.id',
            'unique:users,email',
            ],

            'password' => [
                'required',
                'confirmed',
                'min:8',
            ],
        ];
    }

    /**
     * Custom validation messages.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email kampus wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.ends_with' => 'Email harus menggunakan domain resmi perguruan tinggi di Indonesia (.ac.id).',
            'email.unique' => 'Email ini sudah terdaftar. Silakan login atau gunakan email lain.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
        ];
    }
}
