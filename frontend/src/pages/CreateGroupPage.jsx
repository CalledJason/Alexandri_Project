import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const createGroupSchema = z.object({
  title: z.string().min(3, { message: "Judul minimal 3 karakter" }).max(100),
  description: z.string().min(10, { message: "Deskripsi minimal 10 karakter" }).max(1000),
  location: z.string().min(3, { message: "Lokasi wajib diisi" }).max(255),
  meeting_time: z.string().min(1, { message: "Jadwal wajib diisi" }),
  max_members: z.coerce.number().min(2, { message: "Minimal 2 anggota" }).max(20, { message: "Maksimal 20 anggota" }),
  visibility: z.enum(['public', 'private']),
  expires_at: z.string().min(1, { message: "Batas waktu kedaluwarsa wajib diisi" }),
  duration: z.coerce.number().min(1).max(5),
  tags: z.string().optional(),
});

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      meeting_time: '',
      max_members: 10,
      visibility: 'public',
      expires_at: '',
      duration: 1,
      tags: ''
    }
  });

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await api.get('/tags');
        setTags(res.data);
      } catch (error) {
        toast.error('Gagal mengambil daftar tag');
      }
    };
    fetchTags();
  }, []);

  const onSubmit = async (data) => {
    try {
      setIsSubmitting(true);
      
      let mt = data.meeting_time;
      if (mt && mt.length === 16) mt += ':00';
      
      let ea = data.expires_at;
      if (ea && ea.length === 16) ea += ':00';

      const payload = {
        ...data,
        meeting_time: mt,
        expires_at: ea,
        tags: data.tags ? [data.tags] : []
      };

      await api.post('/study-groups', payload);
      toast.success('Grup berhasil ditambahkan!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto w-full">
      <div className="bg-white rounded-3xl neo-brutalism p-8 md:p-12 border-4 border-black relative">
        <h2 className="text-3xl font-serif font-bold text-black mb-2 border-b-4 border-black pb-4">
          Buat Study Group Baru
        </h2>
        <p className="text-gray-600 mb-8 mt-4">Isi detail grup belajar yang ingin Anda buat di bawah ini.</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-800">Judul Study Group</label>
            <input 
              type="text" 
              {...register("title")} 
              className={`w-full p-3 rounded-xl border-2 neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue ${errors.title ? 'border-red-500' : 'border-black'}`} 
            />
            {errors.title && <span className="text-red-500 text-sm font-bold">{errors.title.message}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-gray-800">Deskripsi</label>
            <textarea 
              {...register("description")} 
              rows={4}
              className={`w-full p-3 rounded-xl border-2 neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue ${errors.description ? 'border-red-500' : 'border-black'}`} 
            ></textarea>
            {errors.description && <span className="text-red-500 text-sm font-bold">{errors.description.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">Kategori / Tag</label>
              <select 
                {...register("tags")}
                className={`w-full p-3 rounded-xl border-2 neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white ${errors.tags ? 'border-red-500' : 'border-black'}`}
              >
                <option value="">Pilih Tag Utama</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>{tag.name}</option>
                ))}
              </select>
              {errors.tags && <span className="text-red-500 text-sm font-bold">{errors.tags.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">Lokasi / Universitas</label>
              <input 
                type="text" 
                {...register("location")} 
                className={`w-full p-3 rounded-xl border-2 neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue ${errors.location ? 'border-red-500' : 'border-black'}`} 
              />
              {errors.location && <span className="text-red-500 text-sm font-bold">{errors.location.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">Jadwal Pertemuan</label>
              <input 
                type="datetime-local" 
                {...register("meeting_time")} 
                className={`w-full p-3 rounded-xl border-2 neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue ${errors.meeting_time ? 'border-red-500' : 'border-black'}`} 
              />
              {errors.meeting_time && <span className="text-red-500 text-sm font-bold">{errors.meeting_time.message}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">Kapasitas Maksimal</label>
              <input 
                type="number" 
                {...register("max_members")} 
                min="2"
                max="20"
                className={`w-full p-3 rounded-xl border-2 neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue ${errors.max_members ? 'border-red-500' : 'border-black'}`} 
              />
              {errors.max_members && <span className="text-red-500 text-sm font-bold">{errors.max_members.message}</span>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">Visibility</label>
              <select 
                {...register("visibility")} 
                className="w-full p-3 rounded-xl border-2 border-black neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
              >
                <option value="public">Publik</option>
                <option value="private">Privat</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">Durasi (Jam)</label>
              <input 
                type="number" 
                {...register("duration")} 
                min="1" max="5"
                className="w-full p-3 rounded-xl border-2 border-black neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-gray-800">Batas Waktu Grup</label>
              <input 
                type="datetime-local" 
                {...register("expires_at")} 
                className={`w-full p-3 rounded-xl border-2 neo-brutalism focus:outline-none focus:ring-2 focus:ring-brand-blue ${errors.expires_at ? 'border-red-500' : 'border-black'}`} 
              />
              {errors.expires_at && <span className="text-red-500 text-sm font-bold">{errors.expires_at.message}</span>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-12 pt-6 border-t-4 border-black">
            <button 
              type="button" 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-gray-200 text-black font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-gray-300 transition-colors" 
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-8 py-3 bg-brand-yellow text-black font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-[#e5b217] transition-colors disabled:opacity-70"
            >
              {isSubmitting ? 'Menyimpan...' : 'Buat Grup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupPage;
