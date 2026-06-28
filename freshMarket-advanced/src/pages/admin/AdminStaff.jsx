/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, CheckCircle, UserPlus, Mail, Lock, User, Key, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */

const AdminStaff = () => {
  const { user, logout } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    id: null, name: '', email: '', password: ''
  });
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    confirmType: 'danger',
    onConfirm: null
  });

  const closeConfirm = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const fetchStaff = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setStaffList(Array.isArray(data) ? data : []);
      } else {
        setStaffList([]);

        if (res.status === 401 || res.status === 403) {
          logout();
        }
      }
      setLoading(false);
    } catch (err) {
      setStaffList([]);
      showToast('Gagal mengambil daftar staff kasir', 'error');
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (mode, staff = null) => {
    setModalMode(mode);
    if (mode === 'edit' && staff) {
      setFormData({ id: staff.id, name: staff.name, email: staff.email, password: '' });
    } else {
      setFormData({ id: null, name: '', email: '', password: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = modalMode === 'add' ? 'http://localhost:5000/api/admin/users' : `http://localhost:5000/api/admin/users/${formData.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        showToast(modalMode === 'add' ? 'Akun Kasir Berhasil Dibuat!' : 'Data Kasir Berhasil Diperbarui!');
        setIsModalOpen(false);
        fetchStaff();
      } else {
        showToast(data.error || 'Terjadi kesalahan sistem', 'error');
      }
    } catch (err) {
      showToast('Gagal terhubung ke server', 'error');
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Akun Kasir',
      message: 'Apakah Anda yakin ingin menghapus akun kasir ini? Akun ini tidak akan bisa login lagi ke sistem.',
      confirmText: 'Ya, Hapus',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            showToast('Akun Kasir berhasil dihapus!');
            fetchStaff();
          } else {
            showToast('Gagal menghapus akun', 'error');
          }
        } catch (err) {
          showToast('Terjadi gangguan server', 'error');
        }
        closeConfirm();
      }
    });
  };

  const filteredStaff = staffList.filter(staff =>
    staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="font-sans text-gray-800">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kelola Akun Kasir</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Buat dan kelola kredensial login staff kasir toko Anda.</p>
        </div>
        <button
          onClick={() => handleOpenModal('add')}
          className="bg-gray-900 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-md flex items-center gap-2 active:scale-95"
        >
          <UserPlus size={16} /> Daftarkan Kasir Baru
        </button>
      </div>

      <div className="bg-white rounded-t-xl border border-gray-200 p-4 flex justify-between items-center shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama atau email kasir..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-sm font-medium transition-all"
          />
        </div>
      </div>

      <div className="bg-white border-x border-b border-gray-200 rounded-b-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-200 text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase tracking-widest text-gray-500 font-bold">
                <th className="px-5 py-3 whitespace-nowrap">Nama Lengkap</th>
                <th className="px-5 py-3 whitespace-nowrap">Email Kasir</th>
                <th className="px-5 py-3 whitespace-nowrap">Peran</th>
                <th className="px-5 py-3 whitespace-nowrap">Tanggal Bergabung</th>
                <th className="px-5 py-3 text-center whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500 font-medium">Memuat data staff kasir...</td></tr>
              ) : filteredStaff.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-10 text-gray-500 font-medium">Belum ada staff kasir terdaftar.</td></tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="border-b border-gray-100 hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-gray-900 capitalize">{staff.name}</td>
                    <td className="px-5 py-4 font-medium text-gray-600">{staff.email}</td>
                    <td className="px-5 py-4">
                      <span className="bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-md">
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">
                      {new Date(staff.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenModal('edit', staff)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                          title="Edit Data Staff"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                          title="Hapus / Nonaktifkan Akun"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200">

            <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-xl">
              <h2 className="text-base font-black text-gray-900 tracking-tight">
                {modalMode === 'add' ? 'Daftarkan Akun Kasir' : 'Perbarui Akun Kasir'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Nama Lengkap Staff</label>
                <div className="relative flex items-center">
                  <User size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-gray-200 py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-sm font-medium"
                    placeholder="Masukan nama lengkap kasir"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">Email Login</label>
                <div className="relative flex items-center">
                  <Mail size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-gray-200 py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-sm font-medium"
                    placeholder="kasir@freshmarket.com"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block">
                  {modalMode === 'add' ? 'Password Login' : 'Password Baru (Opsional)'}
                </label>
                <div className="relative flex items-center">
                  <Lock size={16} className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    required={modalMode === 'add'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-white border border-gray-200 py-2 pl-9 pr-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-sm font-medium"
                    placeholder={modalMode === 'add' ? "Masukan kata sandi staff" : "Kosongkan jika tidak diubah"}
                  />
                </div>
                {modalMode === 'edit' && (
                  <p className="text-[9px] text-gray-400 font-medium leading-normal mt-1">*Isi kolom sandi jika kasir meminta pengaturan ulang password.</p>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 font-bold text-gray-500 hover:bg-gray-100 rounded-lg text-xs">
                  Batal
                </button>
                <button type="submit" className="px-5 py-1.5 font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg text-xs shadow-sm flex items-center gap-1 active:scale-95">
                  <CheckCircle size={14} /> Simpan Akun
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-200 animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={`px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 font-medium text-white text-xs ${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'}`}>
            {toast.type === 'success' ? <CheckCircle size={16} className="text-green-400" /> : <X size={16} className="text-white" />}
            {toast.message}
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 border bg-rose-50 text-rose-550 border-rose-100/50">
                <AlertTriangle size={24} />
              </div>

              <h3 className="text-sm font-semibold text-slate-800 mb-1.5">{confirmModal.title}</h3>
              <p className="text-xs text-slate-505 font-medium leading-relaxed mb-6">
                {confirmModal.message}
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={closeConfirm}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={confirmModal.onConfirm}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl transition-all shadow-sm shadow-rose-600/10 active:scale-95"
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
