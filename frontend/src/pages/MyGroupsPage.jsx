import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';
import { Eye, ExternalLink, LogOut } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

const MyGroupsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [confirmLeaveData, setConfirmLeaveData] = useState({ isOpen: false, groupId: null, groupTitle: '' });

  const fetchMyRequests = async () => {
    try {
      const res = await api.get('/my-requests');
      setRequests(res.data);
    } catch {
      toast.error('Gagal mengambil data permintaan');
    } finally {
      setLoading(false);
    }
  };

  const openLeaveModal = (groupId, groupTitle) => {
    setConfirmLeaveData({ isOpen: true, groupId, groupTitle });
  };

  const handleConfirmLeaveGroup = async () => {
    if (!confirmLeaveData.groupId) return;
    setIsLeaving(true);
    try {
      await api.post(`/study-groups/${confirmLeaveData.groupId}/leave`);
      toast.success('Berhasil keluar dari study group');
      setConfirmLeaveData({ isOpen: false, groupId: null, groupTitle: '' });
      fetchMyRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal keluar dari grup');
    } finally {
      setIsLeaving(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const getStatusBadge = (status) => {
    if (status === 'pending') {
      return <span className="px-3 py-1 bg-yellow-200 text-yellow-800 font-bold rounded-full border-2 border-black neo-brutalism text-xs">Menunggu</span>;
    }
    if (status === 'approved') {
      return <span className="px-3 py-1 bg-brand-green text-white font-bold rounded-full border-2 border-black neo-brutalism text-xs">Diterima</span>;
    }
    if (status === 'rejected') {
      return <span className="px-3 py-1 bg-red-200 text-red-800 font-bold rounded-full border-2 border-black neo-brutalism text-xs">Ditolak</span>;
    }
    return null;
  };

  return (
    <div className="py-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-3xl neo-brutalism p-8 md:p-12 mb-10 border-4 border-black">
        <h2 className="text-3xl font-serif font-bold text-black mb-2 border-b-4 border-black pb-4">Grup Yang Diikuti</h2>
        <p className="text-gray-600 mb-8 mt-4">Daftar study group yang Anda minta untuk bergabung atau telah ikuti sebagai anggota.</p>

        {loading ? (
          <div className="text-center py-12 text-gray-500 font-bold">Memuat...</div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12 border-4 border-dashed border-gray-300 rounded-2xl bg-gray-50">
            <p className="text-gray-500 font-bold mb-4">Anda belum mengirim permintaan ke grup manapun.</p>
            <Link to="/" className="inline-block px-6 py-3 bg-black text-white font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-gray-800 transition-colors">
              Cari Grup
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => {
              const meetingDate = req.study_group?.meeting_time ? new Date(req.study_group.meeting_time) : null;
              const scheduleStr = meetingDate ? meetingDate.toLocaleString('id-ID', {
                weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
              }) : '';

              return (
                <div key={req.id} className="border-4 border-black rounded-2xl p-6 bg-brand-bg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 neo-brutalism">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <span className="text-xs font-bold px-3 py-1 bg-brand-blue text-white rounded-full neo-brutalism border-2 border-black">
                        {req.study_group?.tags?.[0]?.name || 'UMUM'}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <Link 
                      to={`/group/${req.study_group_id}`}
                      className="group inline-block"
                    >
                      <h3 className="text-2xl font-bold text-black mb-1 group-hover:text-brand-blue transition-colors">
                        {req.study_group?.title}
                      </h3>
                    </Link>
                    <div className="text-gray-600 font-medium text-sm">
                      {req.study_group?.location} {scheduleStr && `· ${scheduleStr}`}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Dedicated 'Detail Grup' button */}
                    <Link 
                      to={`/group/${req.study_group_id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-white text-black font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-gray-100 transition-colors whitespace-nowrap"
                    >
                      <Eye size={16} /> Detail Grup
                    </Link>

                    {req.status === 'approved' && (
                      <>
                        {req.study_group?.whatsapp_link && (
                          <a 
                            href={req.study_group.whatsapp_link} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-brand-green text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-green-500 transition-colors whitespace-nowrap"
                          >
                            <ExternalLink size={16} /> Buka WA
                          </a>
                        )}
                        <button 
                          onClick={() => openLeaveModal(req.study_group_id, req.study_group?.title)}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-red-500 text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-red-600 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          <LogOut size={15} /> Keluar
                        </button>
                      </>
                    )}

                    {req.status === 'pending' && (
                      <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-3 py-2 rounded-xl border-2 border-black neo-brutalism">
                        Menunggu Persetujuan
                      </span>
                    )}

                    {req.status === 'rejected' && (
                      <span className="text-xs font-bold bg-red-100 text-red-600 px-3 py-2 rounded-xl border-2 border-black neo-brutalism">
                        Akses Ditutup
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Keluar Grup */}
      <ConfirmModal
        isOpen={confirmLeaveData.isOpen}
        onClose={() => setConfirmLeaveData({ isOpen: false, groupId: null, groupTitle: '' })}
        onConfirm={handleConfirmLeaveGroup}
        title="Keluar Dari Group?"
        message={`Apakah Anda yakin ingin keluar dari study group "${confirmLeaveData.groupTitle}"?`}
        confirmText="Ya, Keluar"
        cancelText="Batal"
        variant="danger"
        isLoading={isLeaving}
      />
    </div>
  );
};

export default MyGroupsPage;
