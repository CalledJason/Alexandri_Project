import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Users, MapPin, Calendar, ArrowLeft, ShieldCheck, 
  MessageCircle, UserCheck, BookOpen,
  CheckCircle2, AlertCircle, Edit3, ExternalLink
} from 'lucide-react';

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null); // 'none', 'pending', 'approved', 'rejected'
  const [isRequesting, setIsRequesting] = useState(false);

  // Owner WhatsApp Modal State
  const [showWaModal, setShowWaModal] = useState(false);
  const [waLinkInput, setWaLinkInput] = useState('');
  const [isSavingWa, setIsSavingWa] = useState(false);

  const fetchGroupDetails = async () => {
    try {
      const res = await api.get(`/study-groups/${id}`);
      setGroup(res.data);
      if (res.data.whatsapp_link) {
        setWaLinkInput(res.data.whatsapp_link);
      }
    } catch {
      toast.error('Gagal mengambil data grup');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const checkRequestStatus = async () => {
    try {
      const res = await api.get('/my-requests');
      const request = res.data.find(req => req.study_group_id === id);
      if (request) {
        setRequestStatus(request.status);
        if (request.status === 'approved' && request.study_group?.whatsapp_link) {
          setGroup(prev => ({ ...prev, whatsapp_link: request.study_group.whatsapp_link }));
        }
      } else {
        setRequestStatus('none');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
    if (user) {
      checkRequestStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleRequestJoin = async () => {
    if (!user) {
      toast.error('Anda harus login untuk bergabung');
      navigate('/login');
      return;
    }

    if (group.members_count >= group.max_members) {
      toast.error('Grup sudah penuh');
      return;
    }

    setIsRequesting(true);
    try {
      await api.post(`/study-groups/${id}/join`);
      toast.success('Permintaan bergabung terkirim!');
      setRequestStatus('pending');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal mengirim permintaan');
    } finally {
      setIsRequesting(false);
    }
  };

  const handleSaveWaLink = async (e) => {
    e.preventDefault();
    if (waLinkInput && !waLinkInput.startsWith('http://') && !waLinkInput.startsWith('https://')) {
      toast.error('Format URL tidak valid (harus diawali http:// atau https://)');
      return;
    }

    setIsSavingWa(true);
    try {
      await api.put(`/study-groups/${id}`, { whatsapp_link: waLinkInput });
      setGroup(prev => ({ ...prev, whatsapp_link: waLinkInput }));
      toast.success('Link WhatsApp grup berhasil disimpan!');
      setShowWaModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan link WhatsApp');
    } finally {
      setIsSavingWa(false);
    }
  };

  const generateGoogleCalendarLink = () => {
    if (!group) return '#';
    const startDate = new Date(group.meeting_time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours duration
    const formatTime = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

    const title = encodeURIComponent(`Study Group: ${group.title}`);
    const details = encodeURIComponent(`${group.description || ''}\n\nPlatform Alexandri Study Group`);
    const location = encodeURIComponent(group.location || 'Online');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${formatTime(startDate)}/${formatTime(endDate)}&details=${details}&location=${location}`;
  };

  const getOwnerInitials = (name) => {
    if (!name) return 'OW';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-bold text-gray-500 animate-pulse">
        Memuat detail grup belajar...
      </div>
    );
  }

  if (!group) return null;

  const isOwner = user && user.id === group.owner_id;
  const currentMembers = group.members_count || 0;
  const capacity = group.max_members || 10;
  const isFull = currentMembers >= capacity;
  const meetingDate = new Date(group.meeting_time);
  const formattedDate = meetingDate.toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const formattedTime = meetingDate.toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="py-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="mb-6 px-4 py-2 bg-white text-black font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-gray-100 transition-colors flex items-center gap-2 text-sm cursor-pointer"
      >
        <ArrowLeft size={18} /> Kembali ke Katalog
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-3xl neo-brutalism p-6 md:p-10 border-4 border-black space-y-8 relative">
        
        {/* Header Info */}
        <div className="space-y-4 border-b-4 border-black pb-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <span className="px-4 py-1.5 bg-brand-blue text-white font-bold text-sm rounded-full border-2 border-black neo-brutalism">
              {group.tags?.[0]?.name || 'UMUM'}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-4 py-1.5 bg-brand-yellow text-black font-bold text-xs rounded-full border-2 border-black neo-brutalism uppercase">
                {group.visibility || 'PUBLIK'}
              </span>
              
              {/* Google Calendar Link Button */}
              <a 
                href={generateGoogleCalendarLink()}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-1.5 bg-black text-white font-bold text-xs rounded-full border-2 border-black neo-brutalism hover:bg-gray-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Simpan ke Google Calendar"
              >
                <Calendar size={14} /> + Google Calendar
              </a>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold font-serif text-black leading-tight">
            {group.title}
          </h1>

          {/* Quick Details Badges */}
          <div className="flex flex-wrap gap-4 pt-2 text-sm font-bold text-gray-800">
            <div className="flex items-center gap-2 bg-brand-bg px-4 py-2 rounded-xl border-2 border-black">
              <MapPin size={18} className="text-black" />
              <span>{group.location}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-brand-bg px-4 py-2 rounded-xl border-2 border-black">
              <Calendar size={18} className="text-black" />
              <span>{formattedDate} • Jam {formattedTime} WIB</span>
            </div>

            <div className="flex items-center gap-2 bg-brand-bg px-4 py-2 rounded-xl border-2 border-black">
              <Users size={18} className="text-black" />
              <span>{currentMembers} / {capacity} Mahasiswa Terdaftar</span>
            </div>
          </div>
        </div>

        {/* Owner Profile Header */}
        <div className="bg-brand-yellow/20 p-6 rounded-2xl border-2 border-black flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-purple text-black font-bold text-xl border-2 border-black flex items-center justify-center neo-brutalism">
              {getOwnerInitials(group.owner?.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-lg text-black">{group.owner?.name || 'Inisiator Grup'}</h4>
                <span className="px-2.5 py-0.5 bg-black text-white text-xs font-bold rounded-full">Owner</span>
              </div>
              <div className="text-sm text-gray-600 font-medium">{group.owner?.email || 'Email terverifikasi'}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs font-bold text-black bg-white px-4 py-2 rounded-full border-2 border-black neo-brutalism">
            <ShieldCheck size={18} className="text-brand-green" /> Penyelenggara Resmi
          </div>
        </div>

        {/* Owner WhatsApp Action Banner */}
        {isOwner && (
          <div className="p-5 rounded-2xl border-4 border-black bg-brand-yellow p-4 neo-brutalism flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <div className="font-extrabold text-black text-lg flex items-center gap-2">
                <MessageCircle size={22} /> Kelola Link WhatsApp Group
              </div>
              <div className="text-xs text-black font-bold mt-1">
                {group.whatsapp_link ? (
                  <span>Tautan WA aktif: <a href={group.whatsapp_link} target="_blank" rel="noreferrer" className="underline font-extrabold">{group.whatsapp_link}</a></span>
                ) : (
                  <span>Belum ada link WA terpasang. Tambahkan agar peserta yang disetujui dapat bergabung ke grup WhatsApp!</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => setShowWaModal(true)}
                className="px-5 py-2.5 bg-black text-white font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-gray-800 transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 size={15} /> {group.whatsapp_link ? 'Edit Link WA' : '+ Tambah Link WA'}
              </button>
            </div>
          </div>
        )}

        {/* Deskripsi Lengkap */}
        <div className="space-y-3">
          <h3 className="font-bold text-black text-2xl font-serif flex items-center gap-2">
            <BookOpen size={24} /> Deskripsi & Topik Belajar
          </h3>
          <div className="p-6 rounded-2xl border-2 border-black bg-gray-50 text-gray-800 leading-relaxed font-medium text-lg">
            {group.description || 'Tidak ada deskripsi tambahan.'}
          </div>
        </div>

        {/* Fasilitas & Benefit */}
        <div className="space-y-4">
          <h3 className="font-bold text-black text-xl font-serif">Fasilitas & Keuntungan Bergabung</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-black bg-white neo-brutalism font-bold text-sm">
              <CheckCircle2 size={20} className="text-brand-green" /> Terbuka Lintas Kampus
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-black bg-white neo-brutalism font-bold text-sm">
              <CheckCircle2 size={20} className="text-brand-green" /> Gratis Tanpa Biaya
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-black bg-white neo-brutalism font-bold text-sm">
              <CheckCircle2 size={20} className="text-brand-green" /> Diskusi & Tanya Jawab
            </div>
          </div>
        </div>

        {/* Community Guidelines */}
        <div className="p-6 rounded-2xl border-2 border-black bg-blue-50 text-sm font-medium space-y-2">
          <div className="flex items-center gap-2 font-bold text-black text-base mb-1">
            <AlertCircle size={20} className="text-brand-blue" /> Etika Belajar Bersama:
          </div>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Hormati perbedaan pendapat sesama mahasiswa antar kampus.</li>
            <li>Usahakan hadir tepat waktu sesuai dengan jadwal yang disepakati.</li>
            <li>Gunakan grup WhatsApp hanya untuk keperluan diskusi materi & belajar.</li>
          </ul>
        </div>

        {/* Action Button & Status Bar */}
        <div className="pt-8 border-t-4 border-black border-dashed flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm font-bold text-gray-600">
            {isFull ? (
              <span className="text-red-500 font-extrabold">⚠️ Kapasitas grup sudah penuh</span>
            ) : (
              <span>Masih tersedia <strong className="text-black font-extrabold">{capacity - currentMembers}</strong> slot anggota lagi</span>
            )}
          </div>

          <div>
            {/* If Member has Pending Request */}
            {requestStatus === 'pending' && (
              <div className="px-6 py-3 bg-yellow-100 text-yellow-800 font-bold rounded-xl border-2 border-black neo-brutalism">
                Menunggu Persetujuan Owner...
              </div>
            )}
            
            {/* If Member is Approved */}
            {requestStatus === 'approved' && (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="font-bold text-brand-green flex items-center gap-1.5">
                  <UserCheck size={20} /> Status: Diterima
                </span>
                {group.whatsapp_link ? (
                  <a 
                    href={group.whatsapp_link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="px-6 py-3 bg-brand-green text-white font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-green-500 transition-colors flex items-center gap-2"
                  >
                    <MessageCircle size={20} /> Gabung WhatsApp Grup <ExternalLink size={16} />
                  </a>
                ) : (
                  <span className="px-4 py-2 bg-gray-200 text-black font-bold rounded-xl border-2 border-black text-xs">
                    Link WA Belum Dimasukkan Owner
                  </span>
                )}
              </div>
            )}
            
            {/* If Member Request Rejected */}
            {requestStatus === 'rejected' && (
              <div className="px-6 py-3 bg-red-100 text-red-600 font-bold rounded-xl border-2 border-red-600 neo-brutalism">
                Permintaan Ditolak (Akses Ditutup)
              </div>
            )}

            {/* If Not Member and Not Owner */}
            {requestStatus === 'none' && !isOwner && (
              <button
                onClick={handleRequestJoin}
                disabled={isFull || isRequesting}
                className="px-8 py-3.5 bg-black text-white font-bold text-base rounded-xl border-2 border-black neo-brutalism hover:bg-gray-800 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isRequesting ? 'Mengirim...' : isFull ? 'Grup Penuh' : 'Kirim Permintaan Gabung'}
              </button>
            )}

            {/* If Owner */}
            {isOwner && (
              <div className="flex items-center gap-3">
                <span className="px-4 py-2 bg-brand-yellow text-black font-bold text-xs rounded-xl border-2 border-black neo-brutalism">
                  Anda Adalah Pemilik Grup Ini
                </span>
                <Link
                  to="/manage"
                  className="px-6 py-3 bg-black text-white font-bold text-sm rounded-xl border-2 border-black neo-brutalism hover:bg-gray-800 transition-colors"
                >
                  Kelola Pemohon
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modal Edit/Tambah WhatsApp Link */}
      {showWaModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border-4 border-black neo-brutalism p-6 sm:p-8 max-w-md w-full space-y-6">
            <div>
              <h3 className="text-2xl font-bold font-serif text-black flex items-center gap-2">
                <MessageCircle size={24} className="text-brand-green" /> Kelola Link WhatsApp Group
              </h3>
              <p className="text-xs font-semibold text-gray-600 mt-1">
                Masukkan link undangan grup WhatsApp agar anggota yang Anda setujui dapat langsung bergabung!
              </p>
            </div>

            <form onSubmit={handleSaveWaLink} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
                  Link Undangan WhatsApp (URL)
                </label>
                <input
                  type="url"
                  value={waLinkInput}
                  onChange={(e) => setWaLinkInput(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full p-3 rounded-xl border-2 border-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue neo-brutalism"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWaModal(false)}
                  className="px-5 py-2.5 bg-gray-200 text-black font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-gray-300 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingWa}
                  className="px-6 py-2.5 bg-brand-green text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-green-500 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSavingWa ? 'Menyimpan...' : 'Simpan Link WA'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailPage;
