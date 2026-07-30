import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { Edit2, Trash2, Plus, Users, UserPlus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import ConfirmModal from '../components/ui/ConfirmModal';

const ManageGroupsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  // Modal states
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [activeGroupTitle, setActiveGroupTitle] = useState('');
  const [activeGroupId, setActiveGroupId] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '', description: '', location: '', meeting_time: '',
    max_members: 10, visibility: 'public', whatsapp_link: '', tags: []
  });

  const { data: tags = [] } = useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await api.get('/tags');
      return res.data;
    }
  });

  const { data: groupsData = { groups: [], pendingCounts: {} }, isLoading: loading } = useQuery({
    queryKey: ['manageGroups', user?.id],
    queryFn: async () => {
      const groupsRes = await api.get(`/study-groups?owner_id=${user.id}`);
      const fetchedGroups = groupsRes.data.data || [];
      const counts = {};
      await Promise.all(fetchedGroups.map(async (g) => {
        try {
          const reqRes = await api.get(`/study-groups/${g.id}/requests`);
          counts[g.id] = (reqRes.data || []).filter(r => r.status === 'pending').length;
        } catch {
          counts[g.id] = 0;
        }
      }));
      return { groups: fetchedGroups, pendingCounts: counts };
    },
    enabled: !!user?.id
  });

  const { groups, pendingCounts } = groupsData;

  const { data: currentGroupRequests = [] } = useQuery({
    queryKey: ['groupRequests', activeGroupId],
    queryFn: async () => {
      const res = await api.get(`/study-groups/${activeGroupId}/requests`);
      return res.data;
    },
    enabled: !!activeGroupId && showRequestsModal
  });

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
      min_allowed_members: group.members_count || (group.members ? group.members.length : 2),
      visibility: group.visibility || 'public',
      whatsapp_link: group.whatsapp_link || '',
      tags: group.tags ? group.tags.map(t => t.id) : []
    });

    setShowEditModal(true);
  };

  const updateStatusMutation = useMutation({
    mutationFn: ({ requestId, action }) => api.patch(`/join-requests/${requestId}/${action}`),
    onSuccess: (_, { action }) => {
      toast.success(`Pemohon ${action === 'approve' ? 'diterima' : 'ditolak'}`);
      queryClient.invalidateQueries({ queryKey: ['groupRequests', activeGroupId] });
      queryClient.invalidateQueries({ queryKey: ['manageGroups', user?.id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui status');
    }
  });

  const editGroupMutation = useMutation({
    mutationFn: (payload) => api.put(`/study-groups/${editingGroupId}`, payload),
    onSuccess: () => {
      toast.success('Study Group berhasil diperbarui!');
      setShowEditModal(false);
      queryClient.invalidateQueries({ queryKey: ['manageGroups', user?.id] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Gagal memperbarui Study Group');
    }
  });

  const [confirmDeleteData, setConfirmDeleteData] = useState({ isOpen: false, groupId: null, groupTitle: '' });

  const deleteGroupMutation = useMutation({
    mutationFn: (id) => api.delete(`/study-groups/${id}`),
    onSuccess: () => {
      toast.success('Grup berhasil dihapus!');
      setConfirmDeleteData({ isOpen: false, groupId: null, groupTitle: '' });
      queryClient.invalidateQueries({ queryKey: ['manageGroups', user?.id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus grup');
    }
  });

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const payload = {
      ...editForm,
      max_members: Number(editForm.max_members)
    };
    editGroupMutation.mutate(payload);
  };

  const handleDelete = (group) => {
    setConfirmDeleteData({ isOpen: true, groupId: group.id, groupTitle: group.title });
  };

  const handleViewRequests = (group) => {
    setActiveGroupTitle(group.title);
    setActiveGroupId(group.id);
    setShowRequestsModal(true);
  };

  const handleUpdateStatus = (requestId, action) => {
    updateStatusMutation.mutate({ requestId, action });
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
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-gray-500 font-bold border-2 border-dashed border-gray-300 rounded-2xl bg-gray-50">
            Tidak ada grup yang Anda kelola.
          </div>
        ) : (
          <div>
            {/* Mobile Card List View (Visible on < 768px screens) */}
            <div className="block md:hidden space-y-4">
              {groups.map((group) => {
                const currentMembers = group.members_count || 0;
                const capacity = group.max_members || 10;
                const meetingDate = new Date(group.meeting_time);
                const scheduleStr = meetingDate.toLocaleString('id-ID', {
                  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                });
                const pendingCount = pendingCounts[group.id] || 0;

                return (
                  <div key={group.id} className="border-4 border-black rounded-2xl p-5 bg-brand-bg space-y-4 neo-brutalism">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-3 py-1 bg-brand-blue text-white text-xs font-bold rounded-full border-2 border-black neo-brutalism">
                        {group.tags?.[0]?.name || 'UMUM'}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border-2 border-black neo-brutalism ${currentMembers >= capacity ? 'bg-red-200 text-red-800' : 'bg-white text-black'}`}>
                        {currentMembers} / {capacity} Mahasiswa
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-black text-xl leading-tight">{group.title}</h3>
                      <div className="text-xs font-semibold text-gray-600 mt-1">
                        📍 {group.location} · 📅 {scheduleStr}
                      </div>

                      {!group.whatsapp_link && (
                        <div className="mt-2.5 p-2 bg-brand-yellow/30 border border-black rounded-xl text-[11px] font-bold text-black flex items-center justify-between gap-2">
                          <span>⚠️ Belum ada link WhatsApp terpasang</span>
                          <button onClick={() => handleEdit(group)} className="underline text-brand-blue font-extrabold shrink-0">+ Pasang</button>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t-2 border-black flex flex-wrap gap-2">
                      <button 
                        className="flex-1 py-2 px-3 bg-brand-green text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism flex items-center justify-center gap-1.5 relative"
                        onClick={() => handleViewRequests(group)}
                      >
                        <Users size={16} />
                        <span>Pemohon</span>
                        {pendingCount > 0 && (
                          <span className="bg-brand-yellow text-black text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-black animate-bounce">
                            {pendingCount} baru
                          </span>
                        )}
                      </button>

                      <button 
                        className="py-2 px-4 bg-blue-400 text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism flex items-center gap-1"
                        onClick={() => handleEdit(group)}
                      >
                        <Edit2 size={16} /> Edit
                      </button>

                      <button 
                        className="py-2 px-3 bg-red-500 text-white font-bold text-xs rounded-xl border-2 border-black neo-brutalism"
                        onClick={() => handleDelete(group)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table View (Visible on >= 768px screens) */}
            <div className="hidden md:block overflow-x-auto rounded-xl border-2 border-black bg-white neo-brutalism">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-black">
                    <th className="p-4 font-bold border-r-2 border-black text-black">Kode</th>
                    <th className="p-4 font-bold border-r-2 border-black text-black">Judul &amp; Kategori</th>
                    <th className="p-4 font-bold border-r-2 border-black text-black">Lokasi &amp; Jadwal</th>
                    <th className="p-4 font-bold border-r-2 border-black text-black">Anggota</th>
                    <th className="p-4 font-bold text-center text-black">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group, idx) => {
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
                              onClick={() => handleDelete(group)}
                              title="Hapus"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Study Group"
      >
        <form onSubmit={handleSaveEdit} className="space-y-6 pt-2">
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

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Kapasitas Maksimal (2-20)</label>
            <input 
              type="number" 
              min={editForm.min_allowed_members || 2}
              max="20"
              value={editForm.max_members}
              onChange={(e) => setEditForm({ ...editForm, max_members: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-black font-medium focus:outline-none neo-brutalism"
              required
            />
            {editForm.min_allowed_members > 2 && (
              <p className="text-[11px] font-bold text-gray-500 mt-1">
                *Minimal {editForm.min_allowed_members} orang karena sudah ada {editForm.min_allowed_members} anggota yang bergabung.
              </p>
            )}
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
            <Button type="button" onClick={() => setShowEditModal(false)} variant="secondary">
              Batal
            </Button>
            <Button type="submit" variant="primary" disabled={editGroupMutation.isPending}>
              {editGroupMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Requests Modal */}
      <Modal 
        isOpen={showRequestsModal} 
        onClose={() => setShowRequestsModal(false)}
        title={
          <div>
            <div className="text-2xl font-serif font-bold text-black">Tinjau Pemohon</div>
            <p className="text-sm text-gray-700 font-bold">{activeGroupTitle}</p>
          </div>
        }
      >
        <div className="pt-2">
          {currentGroupRequests.length === 0 ? (
            <div className="text-center py-10 text-gray-500 font-bold border-2 border-dashed border-gray-300 rounded-xl">
              Belum ada permintaan bergabung.
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {currentGroupRequests.map((req) => (
                <div key={req.id} className="border-2 border-black rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-bg neo-brutalism">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-base sm:text-lg text-black truncate">{req.user?.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate break-all">{req.user?.email}</div>
                    {req.message && (
                      <div className="mt-2 p-2.5 rounded-xl bg-white border border-black text-xs text-black font-medium italic">
                        &quot;{req.message}&quot;
                      </div>
                    )}
                    <div className="text-xs font-bold text-gray-500 mt-1">Status: <span className="capitalize">{req.status}</span></div>
                  </div>
                  
                  {req.status === 'pending' && (
                    <div className="flex gap-2 shrink-0 pt-2 sm:pt-0 border-t-2 sm:border-t-0 border-black/10">
                      <Button 
                        onClick={() => handleUpdateStatus(req.id, 'reject')}
                        variant="danger"
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 sm:flex-initial py-1.5 px-4 text-xs sm:text-sm"
                      >
                        Tolak
                      </Button>
                      <Button 
                        onClick={() => handleUpdateStatus(req.id, 'approve')}
                        variant="success"
                        disabled={updateStatusMutation.isPending}
                        className="flex-1 sm:flex-initial py-1.5 px-4 text-xs sm:text-sm"
                      >
                        Terima
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Confirm Modal Hapus Group */}
      <ConfirmModal
        isOpen={confirmDeleteData.isOpen}
        onClose={() => setConfirmDeleteData({ isOpen: false, groupId: null, groupTitle: '' })}
        onConfirm={() => {
          if (confirmDeleteData.groupId) {
            deleteGroupMutation.mutate(confirmDeleteData.groupId);
          }
        }}
        title="Hapus Study Group?"
        message={`Apakah Anda yakin ingin menghapus study group "${confirmDeleteData.groupTitle}" secara permanen? Semua data keanggotaan dan permintaan bergabung akan terhapus.`}
        confirmText="Ya, Hapus Permanen"
        cancelText="Batal"
        variant="danger"
        isLoading={deleteGroupMutation.isPending}
      />
    </div>
  );
};

export default ManageGroupsPage;
