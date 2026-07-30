import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Users, MapPin, Calendar, ArrowLeft, ShieldCheck, 
  MessageCircle, UserCheck, BookOpen, GraduationCap, Building2,
  CheckCircle2, AlertCircle, Edit3, ExternalLink, UserPlus, UserX, LogOut
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import ConfirmModal from '../components/ui/ConfirmModal';

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [showWaModal, setShowWaModal] = useState(false);
  const [showConfirmLeaveModal, setShowConfirmLeaveModal] = useState(false);
  const [confirmRemoveMemberData, setConfirmRemoveMemberData] = useState({ isOpen: false, memberId: null, memberName: '' });
  const [waLinkInput, setWaLinkInput] = useState('');

  const queryClient = useQueryClient();

  const { data: group, isLoading: loading } = useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      const res = await api.get(`/study-groups/${id}`);
      return res.data;
    },
  });

  const { data: requestStatusData } = useQuery({
    queryKey: ['myRequests', id],
    queryFn: async () => {
      if (!user) return { status: 'none', whatsapp_link: null };
      const res = await api.get('/my-requests');
      const request = res.data.find(req => req.study_group_id === id);
      if (request) {
        return { 
          status: request.status, 
          whatsapp_link: request.study_group?.whatsapp_link || null 
        };
      }
      return { status: 'none', whatsapp_link: null };
    },
    enabled: !!user,
  });

  // Calculate actual whatsapp link based on request status or owner
  const isOwner = user && group && user.id === group.owner_id;
  const requestStatus = requestStatusData?.status || 'none';
  const resolvedWhatsappLink = group?.whatsapp_link || requestStatusData?.whatsapp_link;
  
  useEffect(() => {
    if (group?.whatsapp_link && !waLinkInput) {
      setWaLinkInput(group.whatsapp_link);
    }
  }, [group, waLinkInput]);

  const [showJoinNoteModal, setShowJoinNoteModal] = useState(false);
  const [showProfileAlertModal, setShowProfileAlertModal] = useState(false);
  const [joinNoteInput, setJoinNoteInput] = useState('');

  const joinMutation = useMutation({
    mutationFn: (message) => api.post(`/study-groups/${id}/join`, { message }),
    onSuccess: () => {
      toast.success('Permintaan bergabung terkirim!');
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      setShowJoinNoteModal(false);
      setJoinNoteInput('');
    },
    onError: (error) => {
      const serverMsg = error.response?.data?.message;
      if (serverMsg && serverMsg.includes('Profil belum lengkap')) {
        setShowProfileAlertModal(true);
      } else {
        toast.error(serverMsg || 'Gagal mengirim permintaan');
      }
    }
  });

  const handleRequestJoin = () => {
    if (!user) {
      toast.error('Anda harus login untuk bergabung');
      navigate('/login');
      return;
    }

    // Strict validation: Must complete NIM (student_id) and Major (major_id) before joining
    if (!user.student_id || !user.major_id || !user.major?.name) {
      setShowProfileAlertModal(true);
      return;
    }

    if (group.members_count >= group.max_members) {
      toast.error('Grup sudah penuh');
      return;
    }
    setShowJoinNoteModal(true);
  };

  const handleConfirmJoinWithNote = (e) => {
    e.preventDefault();
    joinMutation.mutate(joinNoteInput);
  };

  const leaveGroupMutation = useMutation({
    mutationFn: () => api.post(`/study-groups/${id}/leave`),
    onSuccess: () => {
      toast.success('Anda telah keluar dari study group');
      setShowConfirmLeaveModal(false);
      queryClient.invalidateQueries({ queryKey: ['myRequests'] });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal keluar dari grup');
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId) => api.delete(`/study-groups/${id}/members/${memberId}`),
    onSuccess: () => {
      toast.success('Anggota berhasil dikeluarkan dari grup');
      setConfirmRemoveMemberData({ isOpen: false, memberId: null, memberName: '' });
      queryClient.invalidateQueries({ queryKey: ['group', id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal mengeluarkan anggota');
    }
  });

  const saveWaMutation = useMutation({
    mutationFn: (link) => api.put(`/study-groups/${id}`, { whatsapp_link: link }),
    onSuccess: () => {
      toast.success('Link WhatsApp grup berhasil disimpan!');
      queryClient.invalidateQueries({ queryKey: ['group', id] });
      setShowWaModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan link WhatsApp');
    }
  });

  const handleSaveWaLink = (e) => {
    e.preventDefault();
    if (waLinkInput && !waLinkInput.startsWith('http://') && !waLinkInput.startsWith('https://')) {
      toast.error('Format URL tidak valid (harus diawali http:// atau https://)');
      return;
    }
    saveWaMutation.mutate(waLinkInput);
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

  const getInitials = (name) => {
    if (!name) return 'M';
    const parts = name.split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="py-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
        <Skeleton variant="card" className="h-[400px]" />
      </div>
    );
  }

  if (!group) return null;
  const currentMembers = group.members_count || 0;
  const capacity = group.max_members || 10;
  const isFull = currentMembers >= capacity;
  const meetingDate = new Date(group.meeting_time);
  const isExpired = group.expires_at ? new Date(group.expires_at) < new Date() : (meetingDate ? meetingDate < new Date() : false);
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
                LINTAS KAMPUS
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
            <div className="w-14 h-14 rounded-full bg-brand-purple text-black font-bold text-xl border-2 border-black flex items-center justify-center neo-brutalism flex-shrink-0">
              {getInitials(group.owner?.name)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-bold text-lg text-black">{group.owner?.name || 'Inisiator Grup'}</h4>
                <span className="px-2.5 py-0.5 bg-black text-white text-xs font-bold rounded-full">Owner</span>
              </div>
              <div className="text-xs text-black font-bold mt-1 flex items-center gap-2 flex-wrap">
                {group.owner?.university?.name && (
                  <span className="flex items-center gap-1">
                    <Building2 size={14} className="text-brand-blue" />
                    {group.owner.university.name} ({group.owner.university.short_name || 'Kampus'})
                  </span>
                )}
                {group.owner?.major?.name && (
                  <span className="flex items-center gap-1 text-gray-700">
                    • <GraduationCap size={14} />
                    {group.owner.major.name}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-500 font-semibold mt-0.5">{group.owner?.email}</div>
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
                {resolvedWhatsappLink ? (
                  <span>Tautan WA aktif: <a href={resolvedWhatsappLink} target="_blank" rel="noreferrer" className="underline font-extrabold">{resolvedWhatsappLink}</a></span>
                ) : (
                  <span>Belum ada link WA terpasang. Tambahkan agar peserta yang disetujui dapat bergabung ke grup WhatsApp!</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button onClick={() => setShowWaModal(true)} variant="primary" className="text-xs">
                <Edit3 size={15} /> {resolvedWhatsappLink ? 'Edit Link WA' : '+ Tambah Link WA'}
              </Button>
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


        {/* Daftar Mahasiswa & Kampus Terdaftar */}
        <div className="space-y-4 pt-4 border-t-2 border-black">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h3 className="font-bold text-black text-2xl font-serif flex items-center gap-2">
              <Users size={24} /> Mahasiswa & Kampus Terdaftar ({group.members?.length || currentMembers} Orang)
            </h3>
            {group.members && group.members.length > 0 && (
              <span className="px-3 py-1 bg-brand-yellow text-black font-bold text-xs rounded-full border-2 border-black neo-brutalism">
                {new Set(group.members.map(m => m.university?.short_name || m.university?.name).filter(Boolean)).size} Universitas Terhubung
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {group.members && group.members.length > 0 ? (
              group.members.map((member) => {
                const isMemberOwner = member.id === group.owner_id;
                return (
                  <div 
                    key={member.id} 
                    className="p-4 rounded-2xl border-2 border-black bg-brand-bg/50 neo-brutalism flex items-start gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-brand-purple text-black font-bold text-sm border-2 border-black flex items-center justify-center neo-brutalism flex-shrink-0">
                      {getInitials(member.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-black text-base truncate">{member.name}</h4>
                        {isMemberOwner ? (
                          <span className="px-2 py-0.5 bg-black text-white text-[10px] font-extrabold rounded-full">Owner</span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 bg-brand-yellow text-black text-[10px] font-extrabold rounded-full border border-black">Anggota</span>
                            {isOwner && (
                              <button
                                onClick={() => setConfirmRemoveMemberData({ isOpen: true, memberId: member.id, memberName: member.name })}
                                disabled={removeMemberMutation.isPending}
                                className="px-2 py-0.5 bg-red-500 text-white font-extrabold text-[10px] rounded-full border border-black neo-brutalism hover:bg-red-600 transition-colors flex items-center gap-1 cursor-pointer ml-1"
                              >
                                <UserX size={12} /> Keluarkan
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="mt-1 space-y-1 text-xs text-gray-700 font-semibold">
                        <div className="flex items-center gap-1.5 truncate text-black font-bold">
                          <Building2 size={14} className="text-brand-blue flex-shrink-0" />
                          <span className="truncate">{member.university?.name || member.university?.short_name || 'Kampus Belum Diisi'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <GraduationCap size={14} className="text-gray-500 flex-shrink-0" />
                          <span className="truncate">{member.major?.name || 'Program Studi Belum Diisi'} {member.semester ? `(Semester ${member.semester})` : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-6 text-center border-2 border-dashed border-gray-300 rounded-2xl text-gray-500 font-bold text-sm bg-gray-50">
                Belum ada informasi anggota tambahan.
              </div>
            )}
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
                {resolvedWhatsappLink ? (
                  <a 
                    href={resolvedWhatsappLink} 
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
                <button 
                  onClick={() => setShowConfirmLeaveModal(true)}
                  disabled={leaveGroupMutation.isPending}
                  className="px-5 py-3 bg-red-500 text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-red-600 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <LogOut size={16} /> Keluar dari Grup
                </button>
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
              isExpired ? (
                <span className="px-6 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl border-2 border-black neo-brutalism text-xs">
                  ⚠️ Sesi Pertemuan Telah Lewat
                </span>
              ) : isFull ? (
                <span className="px-6 py-3 bg-red-100 text-red-700 font-bold rounded-xl border-2 border-black neo-brutalism text-xs">
                  ⚠️ Kapasitas Grup Penuh
                </span>
              ) : (
                <Button
                  onClick={handleRequestJoin}
                  disabled={joinMutation.isPending}
                  variant="primary"
                  className="px-8 py-3.5 text-base"
                >
                  {joinMutation.isPending ? 'Mengirim...' : 'Kirim Permintaan Gabung'}
                </Button>
              )
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
      <Modal 
        isOpen={showWaModal} 
        onClose={() => setShowWaModal(false)}
        title={
          <div className="flex items-center gap-2">
            <MessageCircle size={24} className="text-brand-green" /> 
            Kelola Link WhatsApp Group
          </div>
        }
      >
        <p className="text-xs font-semibold text-gray-600 mb-6">
          Masukkan link undangan grup WhatsApp agar anggota yang Anda setujui dapat langsung bergabung!
        </p>

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
            <Button type="button" onClick={() => setShowWaModal(false)} variant="secondary" className="text-xs">
              Batal
            </Button>
            <Button type="submit" disabled={saveWaMutation.isPending} variant="success" className="text-xs">
              {saveWaMutation.isPending ? 'Menyimpan...' : 'Simpan Link WA'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Pesan Catatan Permintaan Bergabung */}
      <Modal 
        isOpen={showJoinNoteModal} 
        onClose={() => setShowJoinNoteModal(false)}
        title={
          <div className="flex items-center gap-2">
            <UserPlus size={24} className="text-brand-blue" /> 
            Permintaan Bergabung
          </div>
        }
      >
        <p className="text-xs font-semibold text-gray-600 mb-4">
          Tulis pesan singkat untuk inisiator grup (opsional) agar ia dapat mengenali motivasi atau topik yang ingin kamu pelajari.
        </p>

        <form onSubmit={handleConfirmJoinWithNote} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1 uppercase tracking-wider">
              Pesan / Alasan Bergabung (Opsional)
            </label>
            <textarea
              rows={3}
              value={joinNoteInput}
              onChange={(e) => setJoinNoteInput(e.target.value)}
              placeholder="Contoh: Halo, saya ingin belajar topik ini untuk persiapan UTS minggu depan..."
              className="w-full p-3 rounded-xl border-2 border-black text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-blue neo-brutalism"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" onClick={() => setShowJoinNoteModal(false)} variant="secondary" className="text-xs">
              Batal
            </Button>
            <Button type="submit" disabled={joinMutation.isPending} variant="primary" className="text-xs">
              {joinMutation.isPending ? 'Mengirim...' : 'Kirim Permintaan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Peringatan Profil Belum Lengkap (NIM & Prodi Wajib) */}
      <Modal 
        isOpen={showProfileAlertModal} 
        onClose={() => setShowProfileAlertModal(false)}
        title={
          <div className="flex items-center gap-2">
            <AlertCircle size={24} className="text-red-500" /> 
            Profil Wajib Dilengkapi!
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-sm font-bold text-gray-800 leading-relaxed">
            Untuk menjaga keabsahan mahasiswa antar kampus, Anda <strong className="text-red-600">wajib mengisi Jurusan &amp; NIM (Nomor Induk Mahasiswa)</strong> di halaman profil terlebih dahulu sebelum dapat bergabung ke study group.
          </p>

          <div className="p-4 rounded-xl border-2 border-black bg-brand-yellow/30 text-xs font-bold text-black space-y-1.5">
            <div className="flex justify-between items-center">
              <span>📌 Jurusan:</span>
              <span className={user?.major?.name || user?.major_id ? 'text-green-700 font-extrabold' : 'text-red-600 font-extrabold'}>
                {user?.major?.name || '❌ Belum Diisi'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>📌 NIM / NPM:</span>
              <span className={user?.student_id ? 'text-green-700 font-extrabold' : 'text-red-600 font-extrabold'}>
                {user?.student_id || '❌ Belum Diisi'}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" onClick={() => setShowProfileAlertModal(false)} variant="secondary" className="text-xs">
              Batal
            </Button>
            <Button type="button" onClick={() => navigate('/profile')} variant="primary" className="text-xs">
              Lengkapi Profil Sekarang →
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Modal: Keluar dari Grup */}
      <ConfirmModal
        isOpen={showConfirmLeaveModal}
        onClose={() => setShowConfirmLeaveModal(false)}
        onConfirm={() => leaveGroupMutation.mutate()}
        title="Keluar Dari Group?"
        message={`Apakah Anda yakin ingin keluar dari study group "${group?.title || ''}"?`}
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="danger"
        isLoading={leaveGroupMutation.isPending}
      />

      {/* Confirm Modal: Keluarkan Anggota */}
      <ConfirmModal
        isOpen={confirmRemoveMemberData.isOpen}
        onClose={() => setConfirmRemoveMemberData({ isOpen: false, memberId: null, memberName: '' })}
        onConfirm={() => {
          if (confirmRemoveMemberData.memberId) {
            removeMemberMutation.mutate(confirmRemoveMemberData.memberId);
          }
        }}
        title="Keluarkan Anggota?"
        message={`Apakah Anda yakin ingin mengeluarkan ${confirmRemoveMemberData.memberName} dari study group ini?`}
        confirmText="Ya, Keluarkan"
        cancelText="Batal"
        variant="danger"
        isLoading={removeMemberMutation.isPending}
      />
    </div>
  );
};

export default GroupDetailPage;
