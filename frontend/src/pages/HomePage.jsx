import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, BarChart3, GraduationCap, ArrowRight, Clock, MapPin, 
  Users, ChevronLeft, ChevronRight, Sparkles, Compass, CheckCircle2, Bookmark 
} from 'lucide-react';
import { toast } from 'sonner';

const HomePage = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    active_groups_count: 0,
    universities_count: 0,
    total_members_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);

  const fetchStats = async () => {
    try {
      const res = await api.get('/stats');
      setStats(res.data);
    } catch (e) {
      console.error('Error fetching stats:', e);
    }
  };

  const fetchStudyGroups = async (categoryId = activeCategoryId, search = searchQuery) => {
    try {
      setLoading(true);
      const params = [];
      if (categoryId) params.push(`category_id=${categoryId}`);
      if (search && search.trim()) params.push(`search=${encodeURIComponent(search.trim())}`);
      const queryString = params.length > 0 ? `?${params.join('&')}` : '';

      const response = await api.get(`/study-groups${queryString}`);
      setStudyGroups(response.data.data || []);
      
      if (categories.length === 0) {
        const tagRes = await api.get('/tags');
        setCategories([{ id: null, name: 'Semua' }, ...tagRes.data]);
      }
    } catch (error) {
      toast.error('Gagal mengambil data dari server');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchStudyGroups(activeCategoryId, searchQuery);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategoryId]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudyGroups(activeCategoryId, searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchStudyGroups(activeCategoryId, '');
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getGroupCount = (categoryId) => {
    if (!categoryId) return studyGroups.length;
    return studyGroups.filter(g => g.category_id === categoryId).length;
  };

  // Smart Matchmaking: Recommended groups for current user's major / university
  const recommendedGroups = user ? studyGroups.filter(g => {
    if (!user.major?.name && !user.university?.short_name) return true;
    const majorName = (user.major?.name || '').toLowerCase();
    const univName = (user.university?.short_name || '').toLowerCase();
    const title = (g.title || '').toLowerCase();
    const desc = (g.description || '').toLowerCase();
    const tag = (g.tags?.[0]?.name || '').toLowerCase();
    return title.includes(majorName) || desc.includes(majorName) || tag.includes(majorName) || title.includes(univName);
  }) : [];

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Hero Section (Blue Background) */}
      <div className="bg-brand-blue w-full relative overflow-hidden pb-16 pt-8">
        
        {/* Floating Graphics */}
        <div className="hidden lg:flex absolute left-10 top-20 w-40 h-40 bg-brand-yellow rounded-full border-4 border-black items-center justify-center -rotate-12 neo-brutalism">
          <BarChart3 size={64} className="text-black" />
        </div>
        
        <div className="hidden lg:flex absolute right-16 top-24 w-48 h-48 bg-brand-purple border-4 border-black items-center justify-center transform rotate-12" style={{ clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)' }}>
          <GraduationCap size={48} className="text-black absolute z-10" />
        </div>

        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center relative z-20">
          
          <div className="bg-white text-black font-bold text-xs tracking-widest px-6 py-2.5 rounded-full border-2 border-black mb-8 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-6 w-auto" />
            <span>KATALOG STUDY GROUP • SELURUH INDONESIA</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Belajar bareng, <span className="text-brand-yellow italic">lintas kampus,</span><br />
            satu katalog.
          </h1>

          <p className="text-white/90 text-sm md:text-base font-medium max-w-2xl mb-12 leading-relaxed">
            Temukan mahasiswa lain dari kampus mana pun di Indonesia yang<br/>mengejar topik yang sama denganmu, lalu susun jadwal belajar<br/>bersama dalam satu tempat.
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl bg-white rounded-full border-4 border-black p-2 flex items-center shadow-[6px_6px_0px_rgba(0,0,0,1)] mb-12">
            <Search className="text-gray-500 ml-4 mr-2" size={24} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik, mata kuliah, atau lokasi..." 
              className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 text-black font-medium text-lg px-2 placeholder-gray-400"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={handleClearSearch}
                className="mr-2 text-xs font-bold text-gray-500 hover:text-black px-3 py-1.5 bg-gray-100 rounded-full border border-gray-300"
              >
                Reset
              </button>
            )}
            <button 
              type="submit" 
              className="bg-black text-white font-bold px-8 py-3 rounded-full hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Cari
            </button>
          </form>

          {/* Dynamic Statistics from Database */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-24 text-white">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stats.active_groups_count || studyGroups.length}
              </div>
              <div className="text-sm opacity-80 font-medium">study group aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stats.universities_count || 1}
              </div>
              <div className="text-sm opacity-80 font-medium">universitas terhubung</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold mb-1">
                {stats.total_members_count || 1}
              </div>
              <div className="text-sm opacity-80 font-medium">mahasiswa terhubung</div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content (Light Yellow Background) */}
      <div className="bg-brand-bg w-full min-h-screen text-black py-12 border-t-4 border-black">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          
          {/* Smart Matchmaking Section (Visible for Logged In Users) */}
          {user && (
            <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-black neo-brutalism space-y-4">
              <div className="flex flex-wrap justify-between items-center gap-4 border-b-2 border-black pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-yellow border-2 border-black neo-brutalism flex items-center justify-center">
                    <Sparkles size={22} className="text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-serif font-bold text-black flex items-center gap-2">
                      Rekomendasi Pintar Untuk Jurusanmu
                    </h3>
                    <p className="text-xs text-gray-600 font-bold">
                      Disesuaikan dengan prodi <span className="text-brand-blue font-extrabold">{user.major?.name || 'Program Studi Anda'}</span> ({user.university?.short_name || 'Kampus Anda'})
                    </p>
                  </div>
                </div>

                <span className="px-3 py-1 bg-brand-green text-white text-xs font-bold rounded-full border border-black neo-brutalism flex items-center gap-1">
                  <CheckCircle2 size={14} /> Smart Matchmaking Active
                </span>
              </div>

              {recommendedGroups.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {recommendedGroups.slice(0, 2).map((recGroup) => (
                    <div key={recGroup.id} className="p-4 rounded-2xl border-2 border-black bg-brand-bg flex justify-between items-center gap-4">
                      <div>
                        <span className="px-3 py-1 bg-brand-yellow text-black font-bold text-[10px] rounded-full border border-black uppercase">
                          {recGroup.tags?.[0]?.name || 'REKOMENDASI'}
                        </span>
                        <h4 className="font-bold text-lg text-black mt-1 line-clamp-1">{recGroup.title}</h4>
                        <p className="text-xs text-gray-600 font-semibold line-clamp-1">{recGroup.description}</p>
                      </div>

                      <Link 
                        to={`/group/${recGroup.id}`}
                        className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-gray-800 transition-colors flex-shrink-0 flex items-center gap-1"
                      >
                        Lihat <ArrowRight size={14} />
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-bold text-gray-500 py-2">
                  Temukan grup belajar di bawah yang sesuai dengan topik minat Anda!
                </p>
              )}
            </div>
          )}

          {/* Categories Slider with Manual Scroll Arrows & Soft Gradient Mask */}
          <div className="flex items-center gap-2 relative w-full max-w-full overflow-hidden py-2">
            
            {/* Manual Left Scroll Arrow */}
            <button 
              onClick={() => scrollSlider('left')}
              className="w-10 h-10 rounded-xl border-2 border-black bg-white text-black font-bold neo-brutalism flex items-center justify-center hover:bg-brand-yellow cursor-pointer flex-shrink-0 z-30 transition-transform hover:scale-105"
              title="Geser Kiri"
            >
              <ChevronLeft size={20} />
            </button>

            {/* Fixed 'Semua' Filter Button on the Left */}
            {categories.length > 0 && (
              <div className="relative z-30 flex-shrink-0 flex items-center">
                <div className="bg-brand-bg py-1 pr-2 z-30">
                  <button
                    onClick={() => { setActiveCategoryId(null); fetchStudyGroups(null, searchQuery); }}
                    className={`whitespace-nowrap px-6 py-2.5 rounded-full border-4 border-black font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer text-sm md:text-base ${
                      activeCategoryId === null 
                        ? 'bg-black text-white shadow-none translate-y-[2px] translate-x-[2px]' 
                        : 'bg-brand-yellow text-black hover:bg-yellow-400'
                    }`}
                  >
                    Semua <span className="ml-1.5 opacity-80">({getGroupCount(null)})</span>
                  </button>
                </div>

                {/* Smooth Fade Blur Gradient Mask right after 'Semua' button */}
                <div className="w-16 h-12 bg-gradient-to-r from-brand-bg via-brand-bg/80 to-transparent pointer-events-none z-20 -ml-2" />
              </div>
            )}

            {/* Marquee Moving Slider with Smooth Gradient Mask Dissolve */}
            {categories.length > 1 && (
              <div ref={sliderRef} className="flex-1 overflow-x-auto scrollbar-hide relative -ml-14 pl-14 scroll-smooth [mask-image:linear-gradient(to_right,transparent_0%,black_60px,black_calc(100%-40px),transparent_100%)]">
                <div className="animate-marquee flex gap-4 items-center">
                  {(() => {
                    const specificCategories = categories.filter(c => c.id !== null);
                    const repeated = [...specificCategories, ...specificCategories, ...specificCategories];
                    return repeated.map((category, index) => (
                      <button 
                        key={`${category.id}-${index}`} 
                        onClick={() => { setActiveCategoryId(category.id); fetchStudyGroups(category.id, searchQuery); }}
                        className={`whitespace-nowrap px-6 py-2.5 rounded-full border-4 border-black font-bold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] cursor-pointer text-sm md:text-base ${
                          activeCategoryId === category.id 
                            ? 'bg-black text-white shadow-none translate-y-[2px] translate-x-[2px]' 
                            : 'bg-white text-black hover:bg-yellow-200'
                        }`}
                      >
                        {category.name} <span className="ml-1.5 opacity-70">({getGroupCount(category.id)})</span>
                      </button>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Manual Right Scroll Arrow */}
            <button 
              onClick={() => scrollSlider('right')}
              className="w-10 h-10 rounded-xl border-2 border-black bg-white text-black font-bold neo-brutalism flex items-center justify-center hover:bg-brand-yellow cursor-pointer flex-shrink-0 z-30 transition-transform hover:scale-105 ml-2"
              title="Geser Kanan"
            >
              <ChevronRight size={20} />
            </button>

          </div>

          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold font-serif">
              {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Dibuka minggu ini'}
            </h2>
            <span className="text-gray-600 font-bold">{studyGroups.length} grup ditemukan</span>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="text-center py-20 font-bold text-gray-500 animate-pulse">Memuat grup belajar...</div>
          ) : studyGroups.length === 0 ? (
            <div className="text-center py-20 border-4 border-black rounded-3xl bg-white neo-brutalism p-8">
              <h3 className="text-2xl font-bold mb-2">Tidak ada grup ditemukan</h3>
              <p className="text-gray-600 font-medium">Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
              {searchQuery && (
                <button 
                  onClick={handleClearSearch}
                  className="mt-4 px-6 py-2.5 bg-brand-yellow text-black font-bold border-2 border-black rounded-full neo-brutalism"
                >
                  Lihat Semua Grup
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studyGroups.map((group) => {
                const currentMembers = group.members_count || 0;
                const capacity = group.max_members || 10;
                const meetingDate = new Date(group.meeting_time);
                const scheduleStr = meetingDate.toLocaleString('id-ID', {
                  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });

                return (
                  <div key={group.id} className="bg-white rounded-3xl p-6 border-4 border-black neo-brutalism flex flex-col justify-between hover:translate-y-[-4px] transition-all">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-4 py-1.5 bg-brand-blue text-white font-bold text-xs rounded-full border-2 border-black neo-brutalism">
                          {group.tags?.[0]?.name || 'UMUM'}
                        </span>
                        <span className="text-xs font-bold px-3 py-1 bg-brand-yellow text-black rounded-full border border-black">
                          {group.visibility ? group.visibility.toUpperCase() : 'PUBLIK'}
                        </span>
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
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default HomePage;
