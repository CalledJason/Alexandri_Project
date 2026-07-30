import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bell, UserPlus, CheckCircle2, Check, Plus, Compass, Calendar, FolderHeart, Sparkles, Menu, X, User, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const MainLayout = () => {
  const { user, logout, echo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('all');
  const dropdownRef = useRef(null);

  // Determine if we are on the homepage to apply blue bg style to body wrapper
  const isHome = location.pathname === '/';

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [user]);

  // WebSocket listeners
  useEffect(() => {
    if (user && echo) {
      const channel = echo.private(`App.Models.User.${user.id}`);
      
      channel.listen('NewJoinRequest', (e) => {
        toast('Ada Permintaan Bergabung', {
            description: e.joinRequest?.user?.name ? `${e.joinRequest.user.name} ingin bergabung ke grup Anda.` : `Seseorang ingin bergabung ke grup Anda.`,
            action: { label: 'Lihat', onClick: () => navigate('/manage') }
        });
        fetchNotifications();
      });

      channel.listen('JoinRequestApproved', (e) => {
        toast.success('Permintaan Bergabung Disetujui!', {
            description: `Anda telah diterima di grup ${e.joinRequest?.studyGroup?.title || ''}.`
        });
        fetchNotifications();
      });

      return () => {
        echo.leave(`App.Models.User.${user.id}`);
      };
    }
  }, [user, echo, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotificationClick = async (notif) => {
    // Immediately mark read in UI state and send background API call
    if (!notif.is_read) {
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      api.patch(`/notifications/${notif.id}/read`).catch(err => console.error('Error marking read:', err));
    }
    setShowNotifDropdown(false);

    // Perform direct navigation
    if (notif.type === 'join_request') {
      let groupId = null;
      if (notif.action_url) {
        const parts = notif.action_url.split('/');
        if (parts.length >= 3) groupId = parts[2];
      }
      if (groupId) {
        navigate(`/manage?open_requests=${groupId}`);
      } else {
        navigate('/manage');
      }
    } else if (notif.action_url) {
      const cleanUrl = notif.action_url.replace('/study-groups/', '/group/');
      navigate(cleanUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('Semua notifikasi telah ditandai dibaca');
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAllNotifications = async () => {
    try {
      await api.delete('/notifications/clear-all');
      setNotifications([]);
      toast.success('Semua notifikasi berhasil dibersihkan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal membersihkan notifikasi');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Berhasil keluar');
      navigate('/login');
    } catch {
      toast.error('Gagal keluar');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isHome ? 'bg-brand-blue text-white' : 'bg-brand-bg text-brand-dark'}`}>
      
      {/* Premium Floating Neo-Brutalism Header / Navbar */}
      <header className="px-2 sm:px-4 md:px-8 pt-3 sm:pt-4 pb-2 max-w-7xl mx-auto w-full sticky top-2 sm:top-3 z-50">
        <div className="flex justify-between items-center px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 rounded-2xl border-4 border-black bg-white text-black neo-brutalism shadow-[4px_4px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group flex-shrink-0">
            <div className="bg-brand-yellow rounded-xl p-1 sm:p-1.5 border-2 border-black neo-brutalism hover:scale-105 transition-transform flex items-center justify-center">
              <img src="/logo.png" alt="Alexandri Logo" className="h-6 sm:h-8 w-auto object-contain" />
            </div>
            <span className="font-serif text-lg sm:text-2xl font-extrabold tracking-tight text-black group-hover:text-brand-blue transition-colors">
              Alexandri
            </span>
          </Link>
          
          {/* Navigation Links - Conditional for Guests vs Logged-In Users */}
          <nav className="hidden md:flex items-center gap-2 font-bold text-sm bg-gray-50 p-1.5 rounded-xl border-2 border-black">
            <Link 
              to="/" 
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                location.pathname === '/' 
                  ? 'bg-black text-white border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                  : 'text-black hover:bg-gray-200'
              }`}
            >
              <Compass size={16} /> Jelajahi
            </Link>

            {user && (
              <>
                <Link 
                  to="/my-groups" 
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    location.pathname === '/my-groups' 
                      ? 'bg-black text-white border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  <FolderHeart size={16} /> Grup Yang Diikuti
                </Link>

                <Link 
                  to="/schedule" 
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    location.pathname === '/schedule' 
                      ? 'bg-black text-white border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                      : 'text-black hover:bg-gray-200'
                  }`}
                >
                  <Calendar size={16} /> Jadwal
                </Link>

                <Link 
                  to="/manage" 
                  className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                    location.pathname === '/manage' 
                      ? 'bg-brand-yellow text-black border-2 border-black font-bold shadow-[2px_2px_0px_rgba(0,0,0,1)]' 
                      : 'text-black hover:bg-yellow-200 font-bold'
                  }`}
                >
                  <Sparkles size={16} /> Grup Buatan Saya
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {user ? (
              <>
                {/* Buat Grup Button */}
                <Link 
                  to="/create" 
                  className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-green-500 transition-colors"
                >
                  <Plus size={16} /> Buat Grup
                </Link>

                <div className="flex items-center gap-1.5 sm:gap-2 relative" ref={dropdownRef}>
                  {/* Notification Bell Icon */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-black border-2 border-black neo-brutalism flex items-center justify-center hover:bg-gray-100 transition-transform relative cursor-pointer"
                      title="Notifikasi"
                    >
                      <Bell size={18} className="sm:w-5 sm:h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] sm:text-[10px] font-extrabold w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-black flex items-center justify-center animate-bounce">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown Modal */}
                    {showNotifDropdown && (
                      <div className="absolute right-0 mt-3 w-72 sm:w-96 bg-white text-black rounded-2xl border-4 border-black neo-brutalism p-4 z-50 shadow-2xl space-y-3">
                        <div className="flex justify-between items-center border-b-2 border-black pb-2">
                          <h4 className="font-serif font-bold text-base sm:text-lg text-black flex items-center gap-2">
                            <Bell size={18} /> Notifikasi
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-brand-yellow text-black text-xs rounded-full font-bold border border-black">
                                {unreadCount} baru
                              </span>
                            )}
                          </h4>
                          <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                              <button 
                                onClick={handleMarkAllRead}
                                className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Check size={14} /> Tandai dibaca
                              </button>
                            )}
                            {notifications.length > 0 && (
                              <button 
                                onClick={handleClearAllNotifications}
                                className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                                title="Bersihkan Semua Notifikasi"
                              >
                                <Trash2 size={13} /> Bersihkan
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Notification Filter Tabs */}
                        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl border border-black text-xs font-bold">
                          <button 
                            onClick={() => setNotifFilter('all')}
                            className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${notifFilter === 'all' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                          >
                            Semua ({notifications.length})
                          </button>
                          <button 
                            onClick={() => setNotifFilter('unread')}
                            className={`flex-1 py-1 px-2 rounded-lg transition-colors cursor-pointer ${notifFilter === 'unread' ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-200'}`}
                          >
                            Belum Dibaca ({unreadCount})
                          </button>
                        </div>

                        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                          {(() => {
                            const filteredNotifs = notifFilter === 'unread' 
                              ? notifications.filter(n => !n.is_read) 
                              : notifications;

                            if (filteredNotifs.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500 font-bold text-sm">
                                  {notifFilter === 'unread' ? 'Tidak ada notifikasi belum dibaca.' : 'Belum ada notifikasi.'}
                                </div>
                              );
                            }

                            return filteredNotifs.map((n) => (
                              <div 
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`p-3 rounded-xl border-2 border-black text-left cursor-pointer transition-colors flex items-start gap-3 ${
                                  n.is_read ? 'bg-gray-50 hover:bg-gray-100 opacity-70' : 'bg-brand-yellow/20 hover:bg-brand-yellow/30 font-bold'
                                }`}
                              >
                                <div className="mt-0.5 flex-shrink-0">
                                  {n.type === 'join_request' ? (
                                    <div className="w-8 h-8 rounded-full bg-brand-yellow text-black border border-black flex items-center justify-center">
                                      <UserPlus size={16} />
                                    </div>
                                  ) : n.type === 'join_approved' ? (
                                    <div className="w-8 h-8 rounded-full bg-brand-green text-white border border-black flex items-center justify-center">
                                      <CheckCircle2 size={16} />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-brand-blue text-white border border-black flex items-center justify-center">
                                      <Bell size={16} />
                                    </div>
                                  )}
                                </div>

                                <div className="flex-1 text-xs">
                                  <div className="font-bold text-black text-sm">{n.title}</div>
                                  <div className="text-gray-700 mt-0.5 leading-snug">{n.message}</div>
                                  <div className="text-[10px] text-gray-400 mt-1 font-semibold">
                                    {new Date(n.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Circle */}
                  <Link to="/profile" className="bg-brand-purple text-black w-9 h-9 sm:w-10 sm:h-10 text-xs sm:text-sm rounded-xl border-2 border-black neo-brutalism flex items-center justify-center font-bold hover:scale-105 transition-transform" title={`Profil ${user.name}`}>
                    {getInitials(user.name)}
                  </Link>

                  {/* Logout Button */}
                  <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-xl border-2 border-black neo-brutalism text-black transition-colors hidden sm:block" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="bg-brand-yellow text-black px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl font-bold text-xs sm:text-sm border-2 border-black neo-brutalism hover:bg-yellow-400 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-black text-white px-5 py-2 rounded-xl font-bold text-sm border-2 border-black neo-brutalism hover:bg-gray-800 transition-all hidden sm:block"
                >
                  Daftar
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger Toggle Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-brand-yellow text-black border-2 border-black neo-brutalism flex items-center justify-center cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 bg-white text-black rounded-2xl border-4 border-black neo-brutalism p-4 space-y-2 shadow-2xl animate-in slide-in-from-top duration-200">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className={`p-3 rounded-xl border-2 border-black font-bold flex items-center gap-3 text-sm ${location.pathname === '/' ? 'bg-black text-white' : 'bg-gray-50'}`}
            >
              <Compass size={18} /> Jelajahi Catalog
            </Link>

            {user ? (
              <>
                <Link 
                  to="/my-groups" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl border-2 border-black font-bold flex items-center gap-3 text-sm ${location.pathname === '/my-groups' ? 'bg-black text-white' : 'bg-gray-50'}`}
                >
                  <FolderHeart size={18} /> Grup Yang Diikuti
                </Link>

                <Link 
                  to="/schedule" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl border-2 border-black font-bold flex items-center gap-3 text-sm ${location.pathname === '/schedule' ? 'bg-black text-white' : 'bg-gray-50'}`}
                >
                  <Calendar size={18} /> Jadwal Belajar Saya
                </Link>

                <Link 
                  to="/manage" 
                  onClick={() => setMobileMenuOpen(false)}
                  className={`p-3 rounded-xl border-2 border-black font-bold flex items-center gap-3 text-sm ${location.pathname === '/manage' ? 'bg-brand-yellow text-black' : 'bg-gray-50'}`}
                >
                  <Sparkles size={18} /> Grup Buatan Saya
                </Link>

                <Link 
                  to="/create" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl border-2 border-black font-bold flex items-center gap-3 text-sm bg-brand-green text-white"
                >
                  <Plus size={18} /> Buat Grup Baru
                </Link>

                <Link 
                  to="/profile" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 rounded-xl border-2 border-black font-bold flex items-center gap-3 text-sm bg-brand-purple text-black"
                >
                  <User size={18} /> Profil Saya ({user.name})
                </Link>

                <button 
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full text-left p-3 rounded-xl border-2 border-black font-bold flex items-center gap-3 text-sm bg-red-100 text-red-700"
                >
                  <LogOut size={18} /> Keluar (Logout)
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t-2 border-black">
                <Link 
                  to="/login" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-center rounded-xl border-2 border-black font-bold bg-brand-yellow text-black text-sm"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-3 text-center rounded-xl border-2 border-black font-bold bg-black text-white text-sm"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        )}
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full relative pb-20 md:pb-6">
        <Outlet />
      </main>

      {/* Floating Bottom Mobile Navigation Bar for One-Thumb Navigation */}
      {user && (
        <div className="fixed bottom-3 left-3 right-3 md:hidden z-40 bg-white border-4 border-black rounded-2xl neo-brutalism p-1.5 flex justify-around items-center shadow-2xl">
          <Link 
            to="/" 
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold ${location.pathname === '/' ? 'bg-black text-white' : 'text-black'}`}
          >
            <Compass size={18} />
            <span>Jelajahi</span>
          </Link>

          <Link 
            to="/my-groups" 
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold ${location.pathname === '/my-groups' ? 'bg-black text-white' : 'text-black'}`}
          >
            <FolderHeart size={18} />
            <span>Diikuti</span>
          </Link>

          <Link 
            to="/create" 
            className="flex flex-col items-center justify-center w-11 h-11 bg-brand-green text-white rounded-xl border-2 border-black neo-brutalism shadow-md -mt-4 hover:scale-105 transition-transform"
            title="Buat Grup"
          >
            <Plus size={24} />
          </Link>

          <Link 
            to="/schedule" 
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold ${location.pathname === '/schedule' ? 'bg-black text-white' : 'text-black'}`}
          >
            <Calendar size={18} />
            <span>Jadwal</span>
          </Link>

          <Link 
            to="/manage" 
            className={`flex flex-col items-center gap-0.5 p-2 rounded-xl text-[10px] font-bold ${location.pathname === '/manage' ? 'bg-brand-yellow text-black' : 'text-black'}`}
          >
            <Sparkles size={18} />
            <span>Kelola</span>
          </Link>
        </div>
      )}
      
    </div>
  );
};

export default MainLayout;
