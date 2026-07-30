import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { 
  Search, BarChart3, GraduationCap, ArrowRight, Clock, MapPin, 
  Users, ChevronLeft, ChevronRight, Sparkles, Compass, CheckCircle2, Bookmark, UserCheck, Plus, AlertCircle, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import GroupCard from '../components/groups/GroupCard';
import Skeleton from '../components/ui/Skeleton';

const HomePage = () => {
  const { user } = useAuth();
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const sliderRef = useRef(null);

  const { data: stats = { active_groups_count: 0, universities_count: 0, total_members_count: 0 } } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await api.get('/stats');
      return res.data;
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await api.get('/tags');
      return [{ id: null, name: 'Semua' }, ...res.data];
    }
  });

  const { data: allStudyGroups = [] } = useQuery({
    queryKey: ['allStudyGroups'],
    queryFn: async () => {
      const res = await api.get('/study-groups?per_page=100');
      return res.data.data || [];
    }
  });

  const { data: studyGroups = [], isLoading: loading } = useQuery({
    queryKey: ['studyGroups', activeCategoryId, searchQuery],
    queryFn: async () => {
      const params = [];
      if (activeCategoryId) params.push(`category_id=${activeCategoryId}`);
      if (searchQuery && searchQuery.trim()) params.push(`search=${encodeURIComponent(searchQuery.trim())}`);
      const queryString = params.length > 0 ? `?${params.join('&')}` : '';

      const response = await api.get(`/study-groups${queryString}`);
      return response.data.data || [];
    }
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (categoryId) => {
    if (activeCategoryId === categoryId) {
      setActiveCategoryId(null);
    } else {
      setActiveCategoryId(categoryId);
    }
  };

  const getGroupCount = (categoryId) => {
    if (!categoryId) return allStudyGroups.length > 0 ? allStudyGroups.length : studyGroups.length;
    return allStudyGroups.filter(g => 
      Array.isArray(g.tags) && g.tags.some(t => String(t.id) === String(categoryId))
    ).length;
  };

  // Smart Matchmaking: Recommended groups based on user profile & major tags
  const isProfileComplete = Boolean(user && (user.major_id || user.major?.name) && user.student_id);
  const hasMajor = isProfileComplete;

  const recommendedGroups = (() => {
    if (!studyGroups || studyGroups.length === 0 || !user || !hasMajor) return [];

    const majorName = (user.major?.name || '').toLowerCase();
    const univName = (user.university?.short_name || '').toLowerCase();
    const majorTagNames = (user.major?.tags || []).map(t => (t.name || '').toLowerCase());

    const filtered = studyGroups.filter(g => {
      const title = (g.title || '').toLowerCase();
      const desc = (g.description || '').toLowerCase();
      const groupTags = (g.tags || []).map(t => (t.name || '').toLowerCase());

      // Check if study group tags intersect with major's related tags
      const matchesTag = groupTags.some(gt => majorTagNames.includes(gt) || gt.includes(majorName));
      // Check if title or description mentions major or university
      const matchesText = title.includes(majorName) || desc.includes(majorName) || (univName && title.includes(univName));

      return matchesTag || matchesText;
    });

    return filtered.length > 0 ? filtered : studyGroups;
  })();

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

        <div className="max-w-4xl mx-auto px-3 sm:px-4 flex flex-col items-center text-center relative z-20">
          
          <div className="bg-white text-black font-bold text-[10px] sm:text-xs tracking-wider sm:tracking-widest px-3 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 border-black mb-6 sm:mb-8 shadow-[3px_3px_0px_rgba(0,0,0,1)] flex items-center justify-center gap-1.5 sm:gap-2 max-w-full overflow-hidden">
            <img src="/logo.png" alt="Logo" className="h-4 sm:h-6 w-auto flex-shrink-0" />
            <span className="truncate">KATALOG STUDY GROUP • SELURUH INDONESIA</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Belajar bareng, <span className="text-brand-yellow italic">lintas kampus,</span><br className="hidden sm:inline" />{' '}
            satu katalog.
          </h1>

          <p className="text-white/90 text-xs sm:text-sm md:text-base font-medium max-w-2xl mb-8 sm:mb-12 leading-relaxed">
            Temukan mahasiswa lain dari kampus mana pun di Indonesia yang<br className="hidden sm:inline"/> mengejar topik yang sama denganmu, lalu susun jadwal belajar<br className="hidden sm:inline"/> bersama dalam satu tempat.
          </p>

          {/* Search Form - Responsive Flex Layout */}
          <form onSubmit={handleSearchSubmit} className="w-full max-w-3xl bg-white rounded-2xl sm:rounded-full border-4 border-black p-2.5 sm:p-2 flex flex-col sm:flex-row items-center gap-2 shadow-[6px_6px_0px_rgba(0,0,0,1)] mb-12">
            <div className="flex items-center flex-1 w-full gap-2 px-2">
              <Search className="text-gray-500 shrink-0" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik, mata kuliah, lokasi..." 
                className="w-full min-w-0 bg-transparent border-none focus:outline-none focus:ring-0 text-black font-medium text-sm sm:text-lg placeholder-gray-400"
              />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={handleClearSearch}
                  className="text-xs font-bold text-gray-500 hover:text-black px-2.5 py-1 bg-gray-100 rounded-full border border-gray-300 shrink-0"
                >
                  Reset
                </button>
              )}
            </div>
            <button 
              type="submit" 
              className="w-full sm:w-auto bg-black text-white font-bold px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl sm:rounded-full hover:bg-gray-800 transition-colors cursor-pointer text-sm sm:text-base border-2 border-black sm:border-0"
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
          
          {/* Profile Onboarding Callout Banner for Logged-In Users Without Completed Profile */}
          {user && (!user.student_id || !user.major_id || !user.major?.name) && (
            <div className="bg-brand-yellow p-6 rounded-3xl border-4 border-black neo-brutalism flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center flex-shrink-0 font-bold border-2 border-black neo-brutalism">
                  <UserCheck size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl text-black flex items-center gap-2">
                    ⚠️ Syarat Wajib Bergabung Grup!
                  </h3>
                  <p className="text-sm text-black font-semibold mt-0.5">
                    Isi NIM / NPM dan Jurusan kamu di halaman profil agar diperbolehkan mengajukan permintaan bergabung ke study group.
                  </p>
                </div>
              </div>
              <Link 
                to="/profile" 
                className="px-5 py-2.5 bg-black text-white font-bold rounded-xl text-xs sm:text-sm border-2 border-black neo-brutalism hover:bg-gray-800 transition-all whitespace-nowrap"
              >
                Isi Profil Sekarang →
              </Link>
            </div>
          )}

          {/* Smart Matchmaking Section (Only Active for Logged-In Users with Profile) */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border-4 border-black neo-brutalism space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b-2 border-black pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-yellow border-2 border-black neo-brutalism flex items-center justify-center">
                  <Sparkles size={22} className="text-black" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-serif font-bold text-black flex items-center gap-2">
                    {hasMajor ? 'Rekomendasi Pintar Untuk Jurusanmu' : user ? 'Rekomendasi Pintar Belum Aktif' : 'Rekomendasi Study Group'}
                  </h3>
                  <p className="text-xs text-gray-600 font-bold">
                    {hasMajor ? (
                      <>Disesuaikan dengan prodi <span className="text-brand-blue font-extrabold">{user.major?.name}</span> ({user.university?.short_name || 'Kampus Anda'})</>
                    ) : user ? (
                      <>Isi <span className="text-brand-blue font-extrabold">Jurusan &amp; NIM</span> kamu di halaman profil untuk mengaktifkan rekomendasi pintar berbasis prodi!</>
                    ) : (
                      <>Silakan <Link to="/login" className="text-brand-blue font-extrabold underline">Login &amp; isi jurusan</Link> untuk mengaktifkan rekomendasi pintar terpersonalisasi.</>
                    )}
                  </p>
                </div>
              </div>

              {hasMajor ? (
                <span className="px-3 py-1 bg-brand-green text-white text-xs font-bold rounded-full border border-black neo-brutalism flex items-center gap-1">
                  <CheckCircle2 size={14} /> Smart Matchmaking Active
                </span>
              ) : user ? (
                <span className="px-3 py-1 bg-brand-yellow text-black text-xs font-bold rounded-full border border-black neo-brutalism flex items-center gap-1">
                  <AlertCircle size={14} /> Profil Belum Lengkap
                </span>
              ) : (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-full border border-black neo-brutalism flex items-center gap-1">
                  <Lock size={14} /> Belum Login
                </span>
              )}
            </div>

            {hasMajor && recommendedGroups.length > 0 ? (
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
            ) : user && !hasMajor ? (
              <div className="p-6 rounded-2xl border-2 border-dashed border-black bg-brand-yellow/20 text-center space-y-3">
                <div className="w-12 h-12 bg-brand-yellow rounded-xl border-2 border-black neo-brutalism mx-auto flex items-center justify-center font-bold text-black text-xl">
                  🎓
                </div>
                <h4 className="font-bold text-black text-lg font-serif">Rekomendasi Belum Dapat Ditampilkan</h4>
                <p className="text-xs text-gray-700 font-semibold max-w-md mx-auto leading-relaxed">
                  Sistem memerlukan data <strong className="text-black">Jurusan &amp; NIM (Nomor Induk Mahasiswa)</strong> kamu untuk mencocokkan study group yang tepat.
                </p>
                <Link 
                  to="/profile" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-gray-800 transition-colors"
                >
                  Isi Jurusan &amp; NIM Sekarang →
                </Link>
              </div>
            ) : !user ? (
              <div className="p-6 rounded-2xl border-2 border-dashed border-black bg-gray-50 text-center space-y-3">
                <div className="w-12 h-12 bg-brand-blue text-white rounded-xl border-2 border-black neo-brutalism mx-auto flex items-center justify-center font-bold text-xl">
                  🔐
                </div>
                <h4 className="font-bold text-black text-lg font-serif">Rekomendasi Khusus Pengguna Terdaftar</h4>
                <p className="text-xs text-gray-700 font-semibold max-w-md mx-auto leading-relaxed">
                  Silakan <strong className="text-black">Login</strong> dan isi profil kamu untuk melihat rekomendasi study group yang terpersonalisasi sesuai dengan jurusan dan mata kuliahmu.
                </p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-blue text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-blue-700 transition-colors"
                >
                  Login Sekarang →
                </Link>
              </div>
            ) : (
              <p className="text-xs font-bold text-gray-500 py-2">
                Temukan grup belajar di bawah yang sesuai dengan topik minat Anda!
              </p>
            )}
          </div>

          {/* Categories Marquee Loop Slider - Moving & Touch Functional */}
          <div className="flex items-center gap-2 relative w-full overflow-hidden py-2">
            {/* Fixed 'Semua' Filter Pill on the Left to Open Categories Modal */}
            {categories.length > 0 && (
              <div className="shrink-0 z-20 flex items-center pr-1 sm:pr-2 bg-brand-bg">
                <button
                  onClick={() => setShowAllCategories(true)}
                  className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 sm:border-4 border-black font-bold transition-all cursor-pointer text-xs sm:text-sm shrink-0 neo-brutalism bg-brand-yellow text-black hover:bg-yellow-400`}
                >
                  <span className="hidden sm:inline">Semua Kategori</span>
                  <span className="sm:hidden">Semua</span>
                  <span className="ml-1 opacity-80">({getGroupCount(null)})</span>
                  <span className="ml-2">☰</span>
                </button>
              </div>
            )}
               {/* Continuous Marquee Loop Track */}
            {categories.length > 1 && (
              <div className="flex-1 overflow-hidden relative [mask-image:linear-gradient(to_right,transparent_0%,black_16px,black_calc(100%-24px),transparent_100%)]">
                <div className="animate-marquee flex gap-2.5 sm:gap-3.5 items-center">
                  {(() => {
                    const specificCategories = categories.filter(c => c.id !== null);
                    const repeated = [...specificCategories, ...specificCategories, ...specificCategories, ...specificCategories];
                    return repeated.map((category, index) => (
                      <button 
                        key={`${category.id}-${index}`} 
                        onClick={() => handleCategoryClick(category.id)}
                        className={`whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-2 sm:border-4 border-black font-bold transition-all cursor-pointer text-xs sm:text-sm shrink-0 neo-brutalism ${
                          activeCategoryId === category.id 
                            ? 'bg-black text-white shadow-none translate-y-[2px] translate-x-[2px]' 
                            : 'bg-white text-black hover:bg-yellow-200'
                        }`}
                      >
                        {category.name} <span className="ml-1 opacity-70">({getGroupCount(category.id)})</span>
                      </button>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between items-end mb-8">
            <h2 className="text-3xl font-bold font-serif">
              {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : 'Dibuka minggu ini'}
            </h2>
            <span className="text-gray-600 font-bold">{studyGroups.length} grup ditemukan</span>
          </div>

          {/* Grid Content */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} />)}
            </div>
          ) : studyGroups.length === 0 ? (
            <div className="text-center py-16 border-4 border-black rounded-3xl bg-white neo-brutalism p-8 space-y-4 max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-brand-yellow rounded-2xl border-2 border-black neo-brutalism mx-auto flex items-center justify-center font-bold text-black text-2xl">
                🔎
              </div>
              <h3 className="text-2xl font-bold font-serif text-black">Topik Belajar Belum Ada</h3>
              <p className="text-gray-600 font-bold text-sm max-w-md mx-auto leading-relaxed">
                Belum ada study group untuk topik <span className="text-brand-blue font-extrabold">{searchQuery ? `"${searchQuery}"` : 'kategori ini'}</span>. Jadilah inisiator pertama yang membuat grup belajar ini!
              </p>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Link 
                  to="/create"
                  className="px-6 py-3 bg-brand-green text-white font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-green-500 transition-colors inline-flex items-center gap-2 text-xs sm:text-sm"
                >
                  <Plus size={18} /> Buat Group Baru dengan Topik Ini
                </Link>
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="px-6 py-3 bg-gray-100 text-black font-bold border-2 border-black rounded-xl neo-brutalism hover:bg-gray-200 text-xs sm:text-sm"
                  >
                    Reset Pencarian
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {studyGroups.map((group) => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Modal Semua Kategori */}
      {showAllCategories && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-brand-bg w-full max-w-3xl rounded-3xl border-4 border-black neo-brutalism overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b-4 border-black flex justify-between items-center bg-white">
              <h3 className="text-2xl font-bold font-serif">Pilih Kategori Belajar</h3>
              <button 
                onClick={() => setShowAllCategories(false)}
                className="w-10 h-10 flex items-center justify-center bg-red-500 text-white border-2 border-black rounded-xl font-bold neo-brutalism hover:bg-red-600"
              >
                X
              </button>
            </div>
            <div className="p-6 overflow-y-auto bg-brand-bg flex-1">
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <button 
                    key={category.id} 
                    onClick={() => {
                      handleCategoryClick(category.id);
                      setShowAllCategories(false);
                    }}
                    className={`px-4 py-2.5 rounded-full border-2 border-black font-bold transition-all cursor-pointer text-sm neo-brutalism ${
                      activeCategoryId === category.id 
                        ? 'bg-black text-white shadow-none translate-y-[2px] translate-x-[2px]' 
                        : 'bg-white text-black hover:bg-yellow-200'
                    }`}
                  >
                    {category.name} <span className="ml-1 opacity-70">({getGroupCount(category.id)})</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
