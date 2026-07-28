import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const registerSchema = z.object({
  name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
  email: z.string().email({ message: "Format email tidak valid" }).refine(val => val.endsWith('.ac.id'), { message: "Gunakan email kampus berakhiran .ac.id" }),
  password: z.string().min(8, { message: "Password minimal 8 karakter" }),
  password_confirmation: z.string(),
}).refine((data) => data.password === data.password_confirmation, {
  message: "Konfirmasi password tidak cocok",
  path: ["password_confirmation"],
});

const RegisterPage = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await registerAuth(data.name, data.email, data.password, data.password_confirmation);
      toast.success('Registrasi berhasil!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal registrasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white neo-brutalism rounded-2xl p-8 space-y-8">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 font-serif">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Bergabunglah dengan ribuan mahasiswa lainnya.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nama Lengkap</label>
              <input
                {...register("name")}
                type="text"
                className={`appearance-none rounded-lg relative block w-full px-3 py-3 border-2 ${errors.name ? 'border-red-500' : 'border-black'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black sm:text-sm neo-brutalism`}
                placeholder="Nama Anda"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600 font-bold">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Email</label>
              <input
                {...register("email")}
                type="email"
                className={`appearance-none rounded-lg relative block w-full px-3 py-3 border-2 ${errors.email ? 'border-red-500' : 'border-black'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black sm:text-sm neo-brutalism`}
                placeholder="Alamat email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600 font-bold">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <input
                {...register("password")}
                type="password"
                className={`appearance-none rounded-lg relative block w-full px-3 py-3 border-2 ${errors.password ? 'border-red-500' : 'border-black'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black sm:text-sm neo-brutalism`}
                placeholder="Kata sandi (minimal 8 karakter)"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600 font-bold">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Konfirmasi Password</label>
              <input
                {...register("password_confirmation")}
                type="password"
                className={`appearance-none rounded-lg relative block w-full px-3 py-3 border-2 ${errors.password_confirmation ? 'border-red-500' : 'border-black'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-black focus:border-black sm:text-sm neo-brutalism`}
                placeholder="Ulangi kata sandi"
              />
              {errors.password_confirmation && <p className="mt-1 text-sm text-red-600 font-bold">{errors.password_confirmation.message}</p>}
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-black text-sm font-bold rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors neo-brutalism disabled:opacity-70"
            >
              {isSubmitting ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </div>
          
          <div className="text-center text-sm font-bold">
            Sudah punya akun? <Link to="/login" className="text-brand-blue hover:underline">Masuk di sini</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
