import { Link } from 'react-router-dom';
import { MapPin, Clock, Users, ArrowRight } from 'lucide-react';

const GroupCard = ({ group }) => {
  const currentMembers = group.members_count || 0;
  const capacity = group.max_members || 10;
  const isFull = currentMembers >= capacity;
  const meetingDate = new Date(group.meeting_time);
  const isExpired = group.expires_at ? new Date(group.expires_at) < new Date() : (meetingDate ? meetingDate < new Date() : false);
  const scheduleStr = meetingDate.toLocaleString('id-ID', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-3xl p-6 border-4 border-black neo-brutalism flex flex-col justify-between hover:translate-y-[-4px] transition-all">
      <div>
        <div className="flex justify-between items-start mb-4 gap-2 flex-wrap">
          <span className="px-4 py-1.5 bg-brand-blue text-white font-bold text-xs rounded-full border-2 border-black neo-brutalism">
            {group.tags?.[0]?.name || 'UMUM'}
          </span>
          <div className="flex items-center gap-1.5">
            {isExpired ? (
              <span className="text-[10px] font-extrabold px-2.5 py-1 bg-gray-200 text-gray-700 rounded-full border border-black">
                Lewat
              </span>
            ) : isFull ? (
              <span className="text-[10px] font-extrabold px-2.5 py-1 bg-red-100 text-red-600 rounded-full border border-black">
                Penuh
              </span>
            ) : null}
            <span className="text-xs font-bold px-3 py-1 bg-brand-yellow text-black rounded-full border border-black">
              {group.visibility ? group.visibility.toUpperCase() : 'PUBLIK'}
            </span>
          </div>
        </div>

        <h3 className="text-2xl font-bold font-serif mb-3 text-black line-clamp-2">{group.title}</h3>
        <p className="text-gray-600 text-sm font-medium mb-6 line-clamp-3">{group.description}</p>
      </div>

      <div className="space-y-4 pt-4 border-t-2 border-black">
        <div className="flex items-center text-xs font-bold text-gray-700 gap-2">
          <MapPin size={16} className="text-black flex-shrink-0" />
          <span className="truncate">{group.location}</span>
        </div>
        
        <div className="flex items-center text-xs font-bold text-gray-700 gap-2">
          <Clock size={16} className="text-black flex-shrink-0" />
          <span>{scheduleStr}</span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-black">
            <Users size={16} />
            <span>{currentMembers} / {capacity} Anggota</span>
          </div>

          <Link 
            to={`/group/${group.id}`}
            className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-1 neo-brutalism"
          >
            Detail <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default GroupCard;
