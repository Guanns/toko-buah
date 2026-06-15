/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, X, Ticket, Calendar, Users, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function AdminPromo
const AdminPromo = () => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ 
    code: '', 
    discount_type: 'PERCENT', 
    discount_value: '', 
    min_purchase: '',
    quota: '',
    expired_at: ''
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

  const fetchVouchers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/vouchers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setVouchers(Array.isArray(data) ? data : []);
      } else {
        setVouchers([]);

        if (res.status === 401 || res.status === 403) {
          logout();
        }
      }
    } catch (err) {
      console.error("Gagal menarik data voucher:", err);
      setVouchers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVouchers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/admin/vouchers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if(res.ok) {
        toast.success("Voucher berhasil dibuat!");
        setIsModalOpen(false);
        setFormData({ code: '', discount_type: 'PERCENT', discount_value: '', min_purchase: '', quota: '', expired_at: '' });
        fetchVouchers();
      } else {
        toast.error(data.error || "Gagal membuat voucher");
      }
    } catch (err) { 
      toast.error('Terjadi kesalahan jaringan.'); 
    }
  };

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Voucher',
      message: 'Apakah Anda yakin ingin menghapus voucher promo ini? Pelanggan tidak akan bisa menggunakan kode voucher ini lagi.',
      confirmText: 'Ya, Hapus',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/admin/vouchers/${id}`, { 
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (res.ok) {
            toast.success("Voucher berhasil dihapus!");
            fetchVouchers();
          } else {
            toast.error("Gagal menghapus voucher.");
          }
        } catch (err) {
          toast.error('Gagal menghapus voucher.');
        }
        closeConfirm();
      }
    });
  };

  
  const filteredVouchers = vouchers.filter(v => 
    v.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-500">Memuat data promo...</p>
      </div>
    );
  }

  return (
    <div className="font-sans max-w-7xl mx-auto text-gray-800">
      
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Promo & Voucher</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola kode diskon untuk pelanggan setia Anda.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          
          <div className="relative w-full sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari kode promo..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm transition-all"
            />
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg font-medium text-sm transition-all flex justify-center items-center gap-2 active:scale-95 shadow-sm"
          >
            <Plus size={16} /> Buat Voucher
          </button>
        </div>
      </div>

      
      {filteredVouchers.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center shadow-sm">
          <Ticket size={40} className="text-gray-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-gray-900 mb-1">Tidak ada data voucher</h3>
          <p className="text-sm text-gray-500">{searchQuery ? 'Pencarian tidak ditemukan.' : 'Silakan buat voucher baru untuk pelanggan Anda.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Kode Promo</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Potongan</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Min. Belanja</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Kuota</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Kedaluwarsa</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredVouchers.map(v => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const expiryDate = v.expired_at ? new Date(v.expired_at) : null;
                  if (expiryDate) {
                    expiryDate.setHours(0, 0, 0, 0);
                  }
                  const isExpired = expiryDate ? expiryDate < today : false;
                  const isOutOfQuota = v.quota !== null && v.quota !== undefined && Number(v.quota) <= 0;
                  const isEnded = isExpired || isOutOfQuota;

                  return (
                    <tr key={v.id} className={`hover:bg-gray-50/50 transition-colors group ${isEnded ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className={`text-sm font-semibold tracking-wide ${isEnded ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{v.code}</span>
                          {isEnded && (
                            <span className="text-xs font-semibold text-red-500 mt-1 flex items-center gap-1 animate-pulse">
                              <AlertTriangle size={12} className="shrink-0" />
                              Sudah Habis Waktunya
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium px-2.5 py-1 rounded-md ${isEnded ? 'text-gray-400 bg-gray-100' : 'text-emerald-600 bg-emerald-50'}`}>
                          {v.discount_type === 'PERCENT' ? `${v.discount_value}%` : `Rp ${Number(v.discount_value).toLocaleString('id-ID')}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${isEnded ? 'text-gray-400' : 'text-gray-600'}`}>Rp {Number(v.min_purchase).toLocaleString('id-ID')}</span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${isOutOfQuota ? 'text-red-550' : 'text-gray-600'}`}>
                          <Users size={14} className={isOutOfQuota ? 'text-red-400' : 'text-gray-400'} />
                          {v.quota !== null && v.quota !== undefined ? `${v.quota} Tersisa` : 'Tanpa Batas'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${isExpired ? 'text-red-550' : 'text-gray-600'}`}>
                          <Calendar size={14} className={isExpired ? 'text-red-400' : 'text-gray-400'} />
                          {formatDate(v.expired_at)}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(v.id)} 
                          className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-md hover:bg-red-50"
                          title="Hapus Voucher"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-base font-medium text-gray-800">Buat Voucher Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors">
                <X size={18}/>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Kode Voucher</label>
                <input 
                  type="text" 
                  required 
                  value={formData.code} 
                  onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                  className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 uppercase tracking-wide focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                  placeholder="Contoh: FRESH2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Tipe Diskon</label>
                  <select 
                    value={formData.discount_type} 
                    onChange={e => setFormData({...formData, discount_type: e.target.value})} 
                    className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 focus:outline-none focus:border-emerald-500 transition-all bg-white"
                  >
                    <option value="PERCENT">Persentase ( % )</option>
                    <option value="FIXED">Nominal ( Rp )</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Nilai Diskon</label>
                  <input 
                    type="number" 
                    required 
                    value={formData.discount_value} 
                    onChange={e => setFormData({...formData, discount_value: e.target.value})} 
                    className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                    placeholder={formData.discount_type === 'PERCENT' ? 'Misal : 10' : 'Misal : 15000'}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1">Minimal Belanja (Rp)</label>
                <input 
                  type="number" 
                  required 
                  value={formData.min_purchase} 
                  onChange={e => setFormData({...formData, min_purchase: e.target.value})} 
                  className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                  placeholder="Misal : 50000"
                />
              </div>

              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Jumlah Kuota</label>
                  <input 
                    type="number" 
                    value={formData.quota} 
                    onChange={e => setFormData({...formData, quota: e.target.value})} 
                    className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                    placeholder="Kosongkan jika unlimit"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Kedaluwarsa Pada?</label>
                  <input 
                    type="date" 
                    value={formData.expired_at} 
                    onChange={e => setFormData({...formData, expired_at: e.target.value})} 
                    className="w-full border border-gray-200 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
                  />
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition-all shadow-sm active:scale-95 text-sm">
                  Simpan Voucher
                </button>
              </div>
            </form>

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

export default AdminPromo;
