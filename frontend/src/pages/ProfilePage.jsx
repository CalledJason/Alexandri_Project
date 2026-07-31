import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserCircle, Building2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

const profileSchema = z.object({
  major_id: z.string().min(1, { message: "Jurusan / Program studi wajib dipilih!" }),
  student_id: z.string().min(3, { message: "NIM / NPM wajib diisi (minimal 3 karakter)!" }).max(30, { message: "NIM terlalu panjang (maksimal 30 karakter)" }),
  semester: z.number({ invalid_type_error: "Semester wajib diisi dengan angka!" }).min(1, { message: "Semester antara 1-14" }).max(14, { message: "Semester antara 1-14" }),
});

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [majors, setMajors] = useState([]);
  const [loadingMajors, setLoadingMajors] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      major_id: '',
      student_id: '',
      semester: 1,
    }
  });

  // Fetch Majors with robust fallback so dropdown options are never empty
  useEffect(() => {
    const fetchMajors = async () => {
      try {
        setLoadingMajors(true);
        let res;
        
        if (user?.email && user.email.includes('@')) {
          const domain = user.email.split('@')[1];
          res = await api.get(`/majors?domain=${domain}`);
        }

        if (!res?.data || res.data.length === 0) {
          res = await api.get('/majors');
        }

        setMajors(res.data || []);
      } catch (err) {
        console.error("Gagal memuat daftar jurusan", err);
      } finally {
        setLoadingMajors(false);
      }
    };

    if (user) {
      fetchMajors();
    }
  }, [user]);

  // Set form default values whenever user or majors change
  useEffect(() => {
    if (user) {
      const currentMajorId = user.major_id || user.major?.id || '';
      reset({
        major_id: currentMajorId,
        student_id: user.student_id || '',
        semester: user.semester || 1,
      });
      if (currentMajorId) {
        setValue('major_id', currentMajorId);
      }
    }
  }, [user, reset, setValue, majors]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await updateProfile(data.major_id, data.student_id, data.semester);
      toast.success('Profil & Program Studi berhasil diperbarui!');
      
      const newMajorId = updatedUser.major_id || updatedUser.major?.id || data.major_id;
      reset({
        major_id: newMajorId,
        student_id: updatedUser.student_id || data.student_id,
        semester: updatedUser.semester || data.semester,
      });
      setValue('major_id', newMajorId);
    } catch (error) {
      console.error(error);
      const serverMsg = error.response?.data?.errors?.student_id?.[0] || error.response?.data?.message || 'Gagal memperbarui profil.';
      toast.error(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="py-10 px-4 md:px-8 max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-3xl neo-brutalism p-8 md:p-12 mb-10 border-4 border-black relative space-y-8">
        
        {/* Header Profile Box */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b-4 border-black pb-8">
          <div className="w-24 h-24 rounded-full bg-brand-purple text-black font-extrabold text-3xl border-4 border-black flex items-center justify-center neo-brutalism flex-shrink-0">
            {getInitials(user?.name)}
          </div>
          
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-3xl font-serif font-bold text-black">{user?.name}</h2>
              <span className="px-3 py-1 bg-brand-green text-white text-xs font-bold rounded-full border border-black neo-brutalism flex items-center gap-1">
                <CheckCircle2 size={14} /> Terverifikasi
              </span>
            </div>

            <p className="text-gray-600 font-bold text-sm">{user?.email}</p>
            
            {(user?.university || user?.major?.university) && (
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-black bg-brand-yellow/30 px-3 py-1.5 rounded-lg border-2 border-black">
                <Building2 size={16} /> Kampus: {user.university?.name || user.major?.university?.name} ({user.university?.short_name || user.major?.university?.short_name})
              </div>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5">
            
            {/* Kampus Readonly Info */}
            <div className="p-4 rounded-xl border-2 border-black bg-blue-50">
              <label className="block text-xs font-extrabold text-gray-500 uppercase tracking-widest mb-1">Universitas Terdeteksi (Domain Email)</label>
              <div className="font-bold text-black text-base flex items-center gap-2">
                <Building2 size={18} className="text-brand-blue" />
                <span>{user?.university?.name || user?.major?.university?.name || 'Universitas Terdaftar (.ac.id)'}</span>
              </div>
            </div>

            {/* Jurusan Dropdown filtered by Email Domain / University */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Jurusan / Program Studi <span className="text-red-600">*</span>
              </label>
              <select
                {...register("major_id")}
                className={`appearance-none rounded-xl relative block w-full px-4 py-3.5 border-2 ${errors.major_id ? 'border-red-500 bg-red-50' : 'border-black bg-white'} text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue neo-brutalism font-medium`}
              >
                <option value="">-- Pilih Jurusan Sesuaian Kampus --</option>
                {!loadingMajors && majors.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} {m.university ? `(${m.university.short_name})` : ''}
                  </option>
                ))}
              </select>
              {errors.major_id && (
                <p className="mt-1 text-sm text-red-600 font-extrabold flex items-center gap-1">
                  <AlertCircle size={15} /> {errors.major_id.message}
                </p>
              )}
              <p className="text-xs text-gray-500 font-semibold mt-1">
                * Disesuaikan otomatis dengan domain email kampus ({user?.email?.split('@')[1] || '.ac.id'})
              </p>
            </div>

            {/* NIM Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                NIM / NPM (Nomor Induk Mahasiswa) <span className="text-red-600">*</span>
              </label>
              <input
                {...register("student_id")}
                type="text"
                className={`appearance-none rounded-xl relative block w-full px-4 py-3.5 border-2 ${errors.student_id ? 'border-red-500 bg-red-50' : 'border-black bg-white'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue neo-brutalism font-medium`}
                placeholder="Contoh: 12345678"
              />
              {errors.student_id && (
                <p className="mt-1 text-sm text-red-600 font-extrabold flex items-center gap-1">
                  <AlertCircle size={15} /> {errors.student_id.message}
                </p>
              )}
            </div>

            {/* Semester Input */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                Semester Aktif (1-14) <span className="text-red-600">*</span>
              </label>
              <input
                {...register("semester", { valueAsNumber: true })}
                type="number"
                min="1"
                max="14"
                className={`appearance-none rounded-xl relative block w-full px-4 py-3.5 border-2 ${errors.semester ? 'border-red-500 bg-red-50' : 'border-black bg-white'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-blue neo-brutalism font-medium`}
              />
              {errors.semester && (
                <p className="mt-1 text-sm text-red-600 font-extrabold flex items-center gap-1">
                  <AlertCircle size={15} /> {errors.semester.message}
                </p>
              )}
            </div>

          </div>

          <div className="pt-6 mt-6 border-t-4 border-black border-dashed flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-brand-yellow text-black font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-[#e5b217] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan Profil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
