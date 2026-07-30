import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

// Define Zod schema for login
const loginSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Login berhasil!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal login. Periksa email/password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white neo-brutalism rounded-2xl p-8 space-y-8">
        <div>
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="Alexandri Logo" className="h-14 w-auto object-contain" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 font-serif">
            Masuk ke Alexandri
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Silakan masuk menggunakan akun Anda.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            
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
                placeholder="Kata sandi"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600 font-bold">{errors.password.message}</p>}
            </div>

          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-black text-sm font-bold rounded-lg text-white bg-black hover:bg-gray-800 focus:outline-none transition-colors neo-brutalism disabled:opacity-70"
            >
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
          </div>

          <div className="text-center text-sm font-bold">
            Belum punya akun? <Link to="/register" className="text-brand-blue hover:underline">Daftar sekarang</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
