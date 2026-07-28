import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, Users, Bell, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ManageGroupsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingCounts, setPendingCounts] = useState({});
  
  // Requests Modal State
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [currentGroupRequests, setCurrentGroupRequests] = useState([]);
  const [activeGroupTitle, setActiveGroupTitle] = useState('');
  const [activeGroupId, setActiveGroupId] = useState(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [tags, setTags] = useState([]);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    location: '',
    meeting_time: '',
    max_members: 10,
    visibility: 'public',
    whatsapp_link: '',
    tags: []
  });

  const fetchData = async () => {
    try {
      const [groupsRes, tagsRes] = await Promise.all([
        api.get(`/study-groups?owner_id=${user.id}`),
        api.get('/tags')
      ]);
      const fetchedGroups = groupsRes.data.data || [];
      setGroups(fetchedGroups);
      setTags(tagsRes.data || []);

      // Fetch pending requests count for each group
      const counts = {};
      await Promise.all(fetchedGroups.map(async (g) => {
        try {
          const reqRes = await api.get(`/study-groups/${g.id}/requests`);
          const pending = (reqRes.data || []).filter(r => r.status === 'pending').length;
          counts[g.id] = pending;
        } catch (e) {
          counts[g.id] = 0;
        }
      }));
      setPendingCounts(counts);

    } catch {
      toast.error('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  // Auto-open requests modal if navigated from notification click (?open_requests=group_id)
  useEffect(() => {
    if (groups.length > 0) {
      const openGroupId = searchParams.get('open_requests');
      if (openGroupId) {
        const targetGroup = groups.find(g => g.id === openGroupId);
        if (targetGroup) {
          handleViewRequests(targetGroup);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups, searchParams]);

  const totalPendingRequests = Object.values(pendingCounts).reduce((a, b) => a + b, 0);

  const handleAdd = () => {
    navigate('/create');
  };

  const handleEdit = (group) => {
    setEditingGroupId(group.id);
    
    // Format meeting_time for datetime-local input (YYYY-MM-THH:mm)
    let formattedMeetingTime = '';
    if (group.meeting_time) {
      const d = new Date(group.meeting_time);
      formattedMeetingTime = d.toISOString().slice(0, 16);
    }

    setEditForm({
      title: group.title || '',
      description: group.description || '',
      location: group.location || '',
      meeting_time: formattedMeetingTime,
      max_members: group.max_members || 10,
      visibility: group.visibility || 'public',
      whatsapp_link: group.whatsapp_link || '',
      tags: group.tags ? group.tags.map(t => t.id) : []
    });

    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: editForm.title,
        description: editForm.description,
        location: editForm.location,
        meeting_time: editForm.meeting_time,
        max_members: Number(editForm.max_members),
        visibility: editForm.visibility,
        whatsapp_link: editForm.whatsapp_link,
        tags: editForm.tags
      };

      await api.put(`/study-groups/${editingGroupId}`, payload);
      toast.success('Study Group berhasil diperbarui!');
      setShowEditModal(false);
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui Study Group');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus grup ini?')) {
      try {
        await api.delete(`/study-groups/${id}`);
        toast.success('Grup berhasil dihapus');
        fetchData();
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Gagal menghapus grup');
      }
    }
  };

  const handleViewRequests = async (group) => {
    try {
      const res = await api.get(`/study-groups/${group.id}/requests`);
      setCurrentGroupRequests(res.data);
      setActiveGroupTitle(group.title);
      setActiveGroupId(group.id);
      setShowRequestsModal(true);
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data pemohon');
    }
  };

  const handleUpdateStatus = async (requestId, action) => {
    try {
      await api.patch(`/join-requests/${requestId}/${action}`);
      toast.success(`Pemohon ${action === 'approve' ? 'diterima' : 'ditolak'}`);
      
      // Refresh requests list
      const res = await api.get(`/study-groups/${activeGroupId}/requests`);
      setCurrentGroupRequests(res.data);
      // Refresh main data so member count updates
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Gagal memperbarui status');
    }
  };

  return (
    <div className="py-10 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-6">
      
      {/* Banner Alert Notifikasi Pemohon Baru */}
      {totalPendingRequests > 0 && (
        <div className="p-6 rounded-3xl border-4 border-black bg-brand-yellow neo-brutalism flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center flex-shrink-0 font-bold border-2 border-black neo-brutalism">
              <UserPlus size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-xl text-black">Ada Permintaan Bergabung Baru!</h3>
              <p className="text-sm text-black font-semibold">
                Terdapat <strong>{totalPendingRequests} pemohon</strong> yang sedang menunggu persetujuan Anda untuk bergabung ke study group.
              </p>
            </div>
          </div>
          <span className="px-4 py-2 bg-black text-white font-bold rounded-xl text-xs whitespace-nowrap neo-brutalism">
            Periksa Tabel Dibawah
          </span>
        </div>
      )}

      <div className="bg-white rounded-3xl neo-brutalism p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-black mb-2">Grup Buatan Saya</h2>
            <p className="text-gray-600">Manajemen study group yang Anda buat dan tinjau permintaan anggota.</p>
          </div>
          <button 
            className="btn-primary rounded-full px-6 py-3 flex items-center gap-2 neo-brutalism bg-brand-yellow text-black hover:bg-[#e5b217] border-2 border-black font-bold" 
            onClick={handleAdd}
          >
            <Plus size={20} />
            <span>Tambah Grup Baru</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 font-bold animate-pulse text-gray-500">Memuat data...</div>
        ) : (
          <div className="overflow-x-auto rounded-xl border-2 border-black bg-white neo-brutalism">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-black">
                  <th className="p-4 font-bold border-r-2 border-black text-black">Kode</th>
                  <th className="p-4 font-bold border-r-2 border-black text-black">Judul & Kategori</th>
                  <th className="p-4 font-bold border-r-2 border-black text-black">Lokasi & Jadwal</th>
                  <th className="p-4 font-bold border-r-2 border-black text-black">Anggota</th>
                  <th className="p-4 font-bold text-center text-black">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {groups.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500 font-bold">Tidak ada grup yang Anda kelola.</td>
                  </tr>
                ) : (
                  groups.map((group, idx) => {
                    const currentMembers = group.members_count || 0;
                    const capacity = group.max_members || 10;
                    const meetingDate = new Date(group.meeting_time);
                    const scheduleStr = meetingDate.toLocaleString('id-ID', {
                      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    });
                    const pendingCount = pendingCounts[group.id] || 0;

                    return (
                      <tr key={group.id} className={`border-b-2 border-black ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-yellow-50 transition-colors`}>
                        <td className="p-4 font-bold text-gray-700 border-r-2 border-black">{group.tags?.[0]?.name || 'UMUM'}</td>
                        <td className="p-4 border-r-2 border-black">
                          <div className="font-bold text-black text-lg">{group.title}</div>
                          <span className="inline-block px-3 py-1 bg-brand-blue text-white text-xs font-bold rounded-full mt-1 border-2 border-black neo-brutalism">
                            {group.tags?.[0]?.name || 'UMUM'}
                          </span>
                        </td>
                        <td className="p-4 border-r-2 border-black text-sm">
                          <div className="font-bold text-black line-clamp-1">{group.location}</div>
                          <div className="text-gray-600">{scheduleStr}</div>
                        </td>
                        <td className="p-4 border-r-2 border-black text-center font-bold">
                          <span className={currentMembers >= capacity ? 'text-red-500' : ''}>
                            {currentMembers} / {capacity}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button 
                              className="bg-brand-green p-2 rounded-lg border-2 border-black neo-brutalism hover:bg-green-500 text-white relative" 
                              onClick={() => handleViewRequests(group)}
                              title="Lihat Pemohon"
                            >
                              <Users size={18} />
                              {pendingCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-brand-yellow text-black text-[10px] font-extrabold w-5 h-5 rounded-full border-2 border-black flex items-center justify-center animate-bounce">
                                  {pendingCount}
                                </span>
                              )}
                            </button>
                            <button 
                              className="bg-blue-400 p-2 rounded-lg border-2 border-black neo-brutalism hover:bg-blue-500 text-white" 
                              onClick={() => handleEdit(group)}
                              title="Edit"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button 
                              className="bg-red-500 p-2 rounded-lg border-2 border-black neo-brutalism hover:bg-red-600 text-white" 
                              onClick={() => handleDelete(group.id)}
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto neo-brutalism border-4 border-black relative">
            <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
              <h3 className="text-2xl font-serif font-bold text-black">Edit Study Group</h3>
              <button onClick={() => setShowEditModal(false)} className="text-2xl font-bold hover:text-red-500">&times;</button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Group</label>
                <input 
                  type="text" 
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black font-medium focus:outline-none neo-brutalism"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Deskripsi</label>
                <textarea 
                  rows="3"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black font-medium focus:outline-none neo-brutalism"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Lokasi / Universitas</label>
                  <input 
                    type="text" 
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black font-medium focus:outline-none neo-brutalism"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Waktu Pertemuan</label>
                  <input 
                    type="datetime-local" 
                    value={editForm.meeting_time}
                    onChange={(e) => setEditForm({ ...editForm, meeting_time: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black font-medium focus:outline-none neo-brutalism"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Kapasitas Maksimal (2-20)</label>
                  <input 
                    type="number" 
                    min="2"
                    max="20"
                    value={editForm.max_members}
                    onChange={(e) => setEditForm({ ...editForm, max_members: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black font-medium focus:outline-none neo-brutalism"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Visibilitas</label>
                  <select 
                    value={editForm.visibility}
                    onChange={(e) => setEditForm({ ...editForm, visibility: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border-2 border-black font-medium focus:outline-none neo-brutalism bg-white"
                  >
                    <option value="public">Publik</option>
                    <option value="private">Privat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Link WhatsApp Group (Opsional)</label>
                <input 
                  type="url" 
                  placeholder="https://chat.whatsapp.com/..."
                  value={editForm.whatsapp_link}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp_link: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-black font-medium focus:outline-none neo-brutalism"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Tag / Kategori</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => {
                    const isSelected = editForm.tags.includes(tag.id);
                    return (
                      <button
                        type="button"
                        key={tag.id}
                        onClick={() => {
                          if (isSelected) {
                            setEditForm({ ...editForm, tags: editForm.tags.filter(id => id !== tag.id) });
                          } else {
                            setEditForm({ ...editForm, tags: [...editForm.tags, tag.id] });
                          }
                        }}
                        className={`px-4 py-2 rounded-full border-2 border-black text-sm font-bold neo-brutalism transition-colors ${
                          isSelected ? 'bg-brand-blue text-white' : 'bg-gray-100 text-black hover:bg-gray-200'
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-black">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2.5 bg-gray-200 text-black font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-gray-300"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-brand-yellow text-black font-bold rounded-xl border-2 border-black neo-brutalism hover:bg-yellow-400"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Requests Modal */}
      {showRequestsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto neo-brutalism border-4 border-black relative">
            <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-black">Tinjau Pemohon</h3>
                <p className="text-gray-600 font-bold">{activeGroupTitle}</p>
              </div>
              <button onClick={() => setShowRequestsModal(false)} className="text-2xl font-bold hover:text-red-500">&times;</button>
            </div>
            
            {currentGroupRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-bold border-2 border-dashed border-gray-300 rounded-xl">
                Belum ada permintaan bergabung.
              </div>
            ) : (
              <div className="space-y-4">
                {currentGroupRequests.map((req) => (
                  <div key={req.id} className="border-2 border-black rounded-xl p-4 flex justify-between items-center bg-brand-bg">
                    <div>
                      <div className="font-bold text-lg text-black">{req.user?.name}</div>
                      <div className="text-sm text-gray-600">{req.user?.email}</div>
                      <div className="text-xs font-bold text-gray-500 mt-1">Status: {req.status}</div>
                    </div>
                    
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(req.id, 'reject')}
                          className="px-4 py-2 bg-red-100 text-red-600 font-bold border-2 border-red-600 rounded-lg hover:bg-red-200 font-bold"
                        >
                          Tolak
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(req.id, 'approve')}
                          className="px-4 py-2 bg-brand-green text-white font-bold border-2 border-black neo-brutalism hover:bg-green-500 font-bold"
                        >
                          Terima
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGroupsPage;
