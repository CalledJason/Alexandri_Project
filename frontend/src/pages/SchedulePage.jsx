import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, MapPin, MessageCircle, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const SchedulePage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past'

  const { data: schedules = [], isLoading: loading } = useQuery({
    queryKey: ['schedules', user?.id],
    queryFn: async () => {
      const [ownedRes, requestsRes] = await Promise.all([
        api.get(`/study-groups?owner_id=${user.id}`),
        api.get('/my-requests')
      ]);

      const ownedGroups = (ownedRes.data.data || []).map(group => ({
        ...group,
        userRole: 'owner',
      }));

      const joinedGroups = (requestsRes.data || [])
        .filter(req => req.status === 'approved' && req.study_group)
        .map(req => ({
          ...req.study_group,
          userRole: 'member',
        }));

      // Combine and remove duplicates by group id
      const groupMap = new Map();
      [...ownedGroups, ...joinedGroups].forEach(group => {
        groupMap.set(group.id, group);
      });

      const combined = Array.from(groupMap.values());
      combined.sort((a, b) => new Date(a.meeting_time) - new Date(b.meeting_time));
      
      return combined;
    },
    enabled: !!user?.id
  });

  const now = new Date();
  
  const upcomingSchedules = schedules.filter(s => new Date(s.meeting_time) >= now);
  const pastSchedules = schedules.filter(s => new Date(s.meeting_time) < now);

  const displayedSchedules = activeTab === 'upcoming' ? upcomingSchedules : pastSchedules;

  return (
    <div className="py-10 px-4 md:px-8 max-w-5xl mx-auto w-full">
      <div className="bg-white rounded-3xl neo-brutalism p-8 md:p-12 mb-10 border-4 border-black">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-4 border-black pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-black mb-2">Jadwal Belajar</h1>
            <p className="text-gray-600 font-medium">Agenda pertemuan study group yang Anda ikuti maupun kelola.</p>
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-full border-2 border-black neo-brutalism">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                activeTab === 'upcoming' ? 'bg-brand-blue text-white' : 'text-black hover:bg-gray-200'
              }`}
            >
              Mendatang ({upcomingSchedules.length})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-colors ${
                activeTab === 'past' ? 'bg-black text-white' : 'text-black hover:bg-gray-200'
              }`}
            >
              Selesai / Lampau ({pastSchedules.length})
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16 font-bold text-gray-500 animate-pulse">Memuat jadwal belajar...</div>
        ) : displayedSchedules.length === 0 ? (
          <div className="text-center py-16 border-4 border-dashed border-gray-300 rounded-2xl bg-gray-50">
            <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Tidak ada jadwal {activeTab === 'upcoming' ? 'mendatang' : 'lampau'}.
            </h3>
            <p className="text-gray-500 font-medium mb-6">
              {activeTab === 'upcoming' 
                ? 'Anda belum memiliki agenda belajar bersama dalam waktu dekat.' 
                : 'Belum ada riwayat pertemuan yang telah lewat.'}
            </p>
            <Link to="/" className="inline-block px-6 py-3 bg-black text-white font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-gray-800 transition-colors">
              Cari Study Group
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedSchedules.map((item) => {
              const meetingDate = new Date(item.meeting_time);
              const dayStr = meetingDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
              const dayName = meetingDate.toLocaleDateString('id-ID', { weekday: 'long' });
              const timeStr = meetingDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

              const isOwner = item.userRole === 'owner' || item.owner_id === user?.id;

              return (
                <div 
                  key={item.id} 
                  className="border-4 border-black rounded-2xl p-4 md:p-6 bg-brand-bg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 w-full md:w-auto flex-1 min-w-0">
                    {/* Date Card */}
                    <div className="bg-brand-yellow text-black border-2 border-black rounded-2xl p-3 md:p-4 text-center min-w-[90px] neo-brutalism flex-shrink-0">
                      <div className="text-xs font-extrabold uppercase tracking-wider">{dayName}</div>
                      <div className="text-2xl font-bold font-serif my-1">{dayStr}</div>
                      <div className="text-[10px] sm:text-xs font-bold bg-black text-white rounded-full py-0.5 px-2 mt-1">
                        {timeStr}
                      </div>
                    </div>

                    {/* Information */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 bg-brand-blue text-white rounded-full neo-brutalism border-2 border-black">
                          {item.tags?.[0]?.name || 'UMUM'}
                        </span>
                        
                        {isOwner ? (
                          <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 bg-brand-yellow text-black rounded-full neo-brutalism border-2 border-black">
                            Pembuat / Owner
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 bg-brand-green text-white rounded-full neo-brutalism border-2 border-black">
                            Anggota
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl sm:text-2xl font-serif font-bold text-black mb-2 leading-tight break-words">
                        {item.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={16} className="text-black" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={16} className="text-black" />
                          <span>Waktu: {timeStr} WIB</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto border-t-2 md:border-t-0 border-black/10 pt-4 md:pt-0">
                    {item.whatsapp_link && (
                      <a 
                        href={item.whatsapp_link}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full sm:w-auto px-5 py-3 bg-brand-green text-white font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-green-500 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <MessageCircle size={18} />
                        <span>WhatsApp Group</span>
                      </a>
                    )}

                    <Link 
                      to={`/group/${item.id}`}
                      className="w-full sm:w-auto px-5 py-3 bg-white text-black font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 text-sm"
                    >
                      <span>Detail</span>
                      <ExternalLink size={16} />
                    </Link>
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

export default SchedulePage;
