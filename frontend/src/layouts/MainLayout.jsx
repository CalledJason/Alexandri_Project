import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Bell, UserPlus, CheckCircle2, Check, Plus, Compass, Calendar, FolderHeart, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
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
      <header className="px-4 md:px-8 pt-4 pb-2 max-w-7xl mx-auto w-full sticky top-3 z-50">
        <div className="flex justify-between items-center px-6 md:px-8 py-3.5 rounded-2xl border-4 border-black bg-white text-black neo-brutalism shadow-[6px_6px_0px_rgba(0,0,0,1)] transition-all">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-brand-yellow rounded-xl p-1.5 border-2 border-black neo-brutalism hover:scale-105 transition-transform flex items-center justify-center">
              <img src="/logo.png" alt="Alexandri Logo" className="h-8 w-auto object-contain" />
            </div>
            <span className="font-serif text-2xl font-extrabold tracking-tight text-black group-hover:text-brand-blue transition-colors">
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
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Buat Grup Button */}
                <Link 
                  to="/create" 
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-brand-green text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism hover:bg-green-500 transition-colors"
                >
                  <Plus size={16} /> Buat Grup
                </Link>

                <div className="flex items-center gap-3 relative" ref={dropdownRef}>
                  {/* Notification Bell Icon */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                      className="w-10 h-10 rounded-xl bg-white text-black border-2 border-black neo-brutalism flex items-center justify-center hover:bg-gray-100 transition-transform relative cursor-pointer"
                      title="Notifikasi"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-extrabold w-5 h-5 rounded-full border-2 border-black flex items-center justify-center animate-bounce">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notifications Dropdown Modal */}
                    {showNotifDropdown && (
                      <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white text-black rounded-2xl border-4 border-black neo-brutalism p-4 z-50 shadow-2xl space-y-3">
                        <div className="flex justify-between items-center border-b-2 border-black pb-2">
                          <h4 className="font-serif font-bold text-lg text-black flex items-center gap-2">
                            <Bell size={18} /> Notifikasi
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 bg-brand-yellow text-black text-xs rounded-full font-bold border border-black">
                                {unreadCount} baru
                              </span>
                            )}
                          </h4>
                          {unreadCount > 0 && (
                            <button 
                              onClick={handleMarkAllRead}
                              className="text-xs font-bold text-brand-blue hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={14} /> Tandai dibaca
                            </button>
                          )}
                        </div>

                        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
                          {notifications.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 font-bold text-sm">
                              Belum ada notifikasi.
                            </div>
                          ) : (
                            notifications.map((n) => (
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
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Circle */}
                  <Link to="/profile" className="bg-brand-purple text-black w-10 h-10 rounded-xl border-2 border-black neo-brutalism flex items-center justify-center font-bold hover:scale-105 transition-transform" title={`Profil ${user.name}`}>
                    {getInitials(user.name)}
                  </Link>

                  {/* Logout Button */}
                  <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-xl border-2 border-black neo-brutalism text-black transition-colors" title="Logout">
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="bg-brand-yellow text-black px-5 py-2 rounded-xl font-bold text-sm border-2 border-black neo-brutalism hover:bg-yellow-400 transition-all"
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
          </div>

        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        <Outlet />
      </main>
      
    </div>
  );
};

export default MainLayout;
