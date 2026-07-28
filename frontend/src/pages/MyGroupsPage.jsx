import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'sonner';

const MyGroupsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

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
                <div key={req.id} className="border-4 border-black rounded-2xl p-6 bg-brand-bg flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-xs font-bold px-3 py-1 bg-brand-blue text-white rounded-full neo-brutalism border-2 border-black">
                        {req.study_group?.tags?.[0]?.name || 'UMUM'}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <h3 className="text-2xl font-bold text-black mb-1">{req.study_group?.title}</h3>
                    <div className="text-gray-600 font-medium">
                      {req.study_group?.location} {scheduleStr && `· ${scheduleStr}`}
                    </div>
                  </div>

                  <div>
                    {req.status === 'approved' ? (
                      req.study_group?.whatsapp_link ? (
                        <a 
                          href={req.study_group.whatsapp_link} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-block px-6 py-3 bg-brand-green text-white font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-green-500 transition-colors whitespace-nowrap"
                        >
                          Buka WhatsApp Grup
                        </a>
                      ) : (
                        <Link 
                          to={`/group/${req.study_group_id}`}
                          className="inline-block px-6 py-3 bg-brand-blue text-white font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-blue-600 transition-colors whitespace-nowrap"
                        >
                          Lihat Detail Grup
                        </Link>
                      )
                    ) : req.status === 'pending' ? (
                      <div className="text-gray-500 font-bold text-sm bg-gray-200 px-4 py-2 rounded-xl border-2 border-black neo-brutalism">
                        Menunggu Persetujuan
                      </div>
                    ) : (
                      <div className="text-red-500 font-bold text-sm bg-red-100 px-4 py-2 rounded-xl border-2 border-red-500 neo-brutalism">
                        Permintaan Ditolak (Akses Ditutup)
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyGroupsPage;
