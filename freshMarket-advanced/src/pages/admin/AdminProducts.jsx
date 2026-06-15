/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle, 
  Image as ImageIcon, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Tag, 
  Info,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function AdminProducts
const AdminProducts = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
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
  
  
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedInfo, setSelectedInfo] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  
  const [formData, setFormData] = useState({
    id: null, sku: '', name: '', category: 'Buah Lokal', price: '', stock: '', image_url: '', status: 'PUBLISHED', description: ''
  });
  
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setProducts([]);
        showToast(data.error || 'Gagal memuat data produk', 'error');

        if (res.status === 401 || res.status === 403) {
          logout();
        }
      }
      setLoading(false);
    } catch (err) {
      setProducts([]);
      showToast('Gagal memuat data produk', 'error');
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const currentItems = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleOpenModal = (mode, product = null) => {
    
    if (user?.role !== 'admin') return;

    setModalMode(mode);
    setSelectedImage(null); 
    
    if (mode === 'edit' && product) {
      setFormData({ ...product, description: '' }); 
    } else {
      setFormData({ id: null, sku: '', name: '', category: 'Buah Lokal', price: '', stock: '', image_url: '', status: 'PUBLISHED', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenInfo = (product) => {
    setSelectedInfo(product);
    setIsInfoModalOpen(true);
  };

  const generateSKU = (name, category) => {
    if (!name) return '';
    const prefix = category.includes('Buah') ? 'FRT' : category === 'Sayur' ? 'VEG' : 'PKT';
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
    const randomId = Math.floor(100 + Math.random() * 900);
    return `${prefix}-${initials}-${randomId}`;
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    if (modalMode === 'add') setFormData({ ...formData, name: newName, sku: generateSKU(newName, formData.category) });
    else setFormData({ ...formData, name: newName });
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    if (modalMode === 'add') setFormData({ ...formData, category: newCat, sku: generateSKU(formData.name, newCat) });
    else setFormData({ ...formData, category: newCat });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') return; 

    const url = modalMode === 'add' ? 'http://localhost:5000/api/admin/products' : `http://localhost:5000/api/admin/products/${formData.id}`;
    const method = modalMode === 'add' ? 'POST' : 'PUT';

    const dataToSend = new FormData();
    dataToSend.append('sku', formData.sku);
    dataToSend.append('name', formData.name);
    dataToSend.append('category', formData.category);
    dataToSend.append('price', formData.price);
    dataToSend.append('stock', formData.stock);
    dataToSend.append('status', formData.status);
    dataToSend.append('admin_id', user.id);
    
    if (selectedImage) {
      dataToSend.append('image', selectedImage);
    } else if (formData.image_url) {
      dataToSend.append('existing_image', formData.image_url);
    }

    try {
      const res = await fetch(url, { 
        method, 
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: dataToSend 
      });
      const data = await res.json();
      
      if (res.ok) {
        showToast(modalMode === 'add' ? 'Produk berhasil ditambahkan!' : 'Produk berhasil diperbarui!');
        setIsModalOpen(false);
        fetchProducts();
      } else {
        showToast(data.error || 'Terjadi kesalahan sistem', 'error');
      }
    } catch (err) {
      showToast('Gagal terhubung ke server', 'error');
    }
  };

  const handleDelete = (id) => {
    if (user?.role !== 'admin') return; 
    
    setConfirmModal({
      isOpen: true,
      title: 'Hapus Produk',
      message: 'Apakah Anda yakin ingin menghapus produk ini dari katalog? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      confirmType: 'danger',
      onConfirm: async () => {
        try {
          await fetch(`http://localhost:5000/api/admin/products/${id}`, { 
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          showToast('Produk berhasil dihapus!');
          fetchProducts();
        } catch (err) {
          showToast('Gagal menghapus produk', 'error');
        }
        closeConfirm();
      }
    });
  };

  const formatRupiah = (number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="font-sans text-slate-700 max-w-7xl mx-auto">
      
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-100 mb-6 gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 tracking-tight">Katalog Produk</h1>
          <p className="text-xs text-slate-400 mt-1">Kelola data inventaris, kategori, harga, dan ketersediaan buah segar Anda.</p>
        </div>
        
        {user?.role === 'admin' && (
          <button 
            onClick={() => handleOpenModal('add')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4.5 py-2 rounded-lg font-medium text-xs transition-all flex items-center gap-2 active:scale-95 shadow-sm shadow-emerald-600/10"
          >
            <Plus size={14} /> Tambah Produk
          </button>
        )}
      </div>

      
      <div className="bg-white rounded-t-xl border border-slate-100 p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari produk buah segar..." 
            value={searchQuery} 
            onChange={(e) => {setSearchQuery(e.target.value); setCurrentPage(1);}} 
            className="w-full pl-9 pr-4 py-1.5 bg-slate-50/50 border border-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs font-normal text-slate-600 transition-all placeholder-slate-400" 
          />
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Total: <span className="text-slate-700 font-semibold">{filteredProducts.length}</span> Produk
        </div>
      </div>

      
      <div className="bg-white border-x border-b border-slate-100 rounded-b-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-200 text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-150 text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                <th className="px-6 py-3.5">Detail Produk</th>
                <th className="px-6 py-3.5">Kategori</th>
                <th className="px-6 py-3.5">Harga</th>
                <th className="px-6 py-3.5">Stok</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4.5 h-4.5 border-2 border-slate-200 border-t-emerald-600 rounded-full animate-spin"></div>
                      <span>Memuat data produk...</span>
                    </div>
                  </td>
                </tr>
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400 font-medium">
                    Belum ada produk yang terdaftar.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover border border-slate-100 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                            <ImageIcon size={14} />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-sm capitalize">{item.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase mt-0.5 tracking-wider flex items-center gap-1 font-mono">
                            <Tag size={10} className="text-slate-300" /> {item.sku}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-medium rounded-full border ${
                        item.category.includes('Buah') 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100/60' 
                          : item.category === 'Sayur'
                          ? 'bg-blue-50 text-blue-700 border-blue-100/60'
                          : 'bg-amber-50 text-amber-700 border-amber-100/60'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-850 text-sm">
                        {formatRupiah(item.price)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {item.stock < 10 ? (
                          <span className="flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-md font-semibold text-[10px]">
                            <AlertTriangle size={10} /> {item.stock} Kritis
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md font-medium text-[10px]">
                            <Package size={10} className="text-slate-400" /> {item.stock} Pcs
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded-md border ${
                        item.status === 'PUBLISHED' 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                          : item.status === 'DRAFT' 
                          ? 'bg-slate-50 border-slate-200 text-slate-600' 
                          : 'bg-rose-50 border-rose-105 text-rose-700'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          onClick={() => handleOpenInfo(item)} 
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                          title="Detail Log"
                        >
                          <Info size={14} />
                        </button>
                        
                        {user?.role === 'admin' && (
                          <>
                            <button 
                              onClick={() => handleOpenModal('edit', item)} 
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                              title="Ubah Produk"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                              title="Hapus Produk"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        
        <div className="px-6 py-3.5 border-t border-slate-100 flex justify-between items-center bg-slate-50/30">
          <p className="text-[11px] text-slate-400 font-medium">
            Menampilkan <span className="font-semibold text-slate-700">{currentItems.length}</span> dari <span className="font-semibold text-slate-700">{filteredProducts.length}</span> produk
          </p>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg shadow-sm">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)} 
              className="p-1 text-slate-400 rounded-md disabled:opacity-30 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-[10px] font-semibold px-1.5 text-slate-600">Hal {currentPage} / {totalPages || 1}</span>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(p => p + 1)} 
              className="p-1 text-slate-400 rounded-md disabled:opacity-30 hover:bg-slate-50 hover:text-slate-600 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      
      {isModalOpen && user?.role === 'admin' && (
        <div className="fixed inset-0 z-150 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 my-8 border border-slate-100">
            
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl sticky top-0 z-10">
              <h2 className="text-base font-semibold text-slate-800 tracking-tight">
                {modalMode === 'add' ? 'Tambah Produk' : 'Edit Produk'}
              </h2>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-5 py-4">
              <div className="space-y-3">
                
                
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Nama Produk</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={handleNameChange} 
                    className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-700 font-normal text-sm placeholder-slate-350" 
                    placeholder="Masukan nama produk buah" 
                  />
                </div>

                
                <div>
                  <label className="text-xs font-medium text-slate-500 flex justify-between items-center mb-1">
                    <span>Deskripsi</span>
                    <span className="text-[8px] text-slate-400 normal-case">(Tidak masuk ke DB)</span>
                  </label>
                  <textarea 
                    rows="2" 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-700 font-normal text-sm resize-none placeholder-slate-350" 
                    placeholder="Masukkan deskripsi singkat..." 
                  />
                </div>

                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Kategori</label>
                    <select 
                      value={formData.category} 
                      onChange={handleCategoryChange} 
                      className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-700 font-normal text-sm bg-no-repeat"
                    >
                      <option value="Buah Lokal">Buah Lokal</option>
                      <option value="Buah Impor">Buah Impor</option>
                      <option value="Sayur">Sayur</option>
                      <option value="Paket Spesial">Paket Spesial</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Kode SKU</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.sku} 
                      onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})} 
                      className="w-full bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-750 font-medium uppercase text-sm" 
                      placeholder="FRT-APL-123" 
                    />
                  </div>
                </div>

                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Harga (Rp)</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.price} 
                      onChange={e => setFormData({...formData, price: e.target.value})} 
                      className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-700 font-medium text-sm placeholder-slate-350" 
                      placeholder="Masukan harga buah" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 block mb-1">Stok</label>
                    <input 
                      type="number" 
                      required 
                      value={formData.stock} 
                      onChange={e => setFormData({...formData, stock: e.target.value})} 
                      className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-700 font-medium text-sm placeholder-slate-350" 
                      placeholder="Masukan stok buah" 
                    />
                  </div>
                </div>

                
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Status Tayang</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})} 
                    className="w-full bg-white border border-slate-200 py-1.5 px-3 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-slate-700 font-medium text-sm"
                  >
                    <option value="PUBLISHED">PUBLISHED ( Tayang )</option>
                    <option value="DRAFT">DRAFT ( Sembunyikan )</option>
                    <option value="ARCHIVED">ARCHIVED ( Arsip )</option>
                  </select>
                </div>

                
                <div>
                  <label className="text-xs font-medium text-slate-500 block mb-1">Foto Produk</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => setSelectedImage(e.target.files[0])} 
                    className="w-full bg-white border border-slate-200 text-xs rounded-lg focus:outline-none file:mr-3 file:py-1.5 file:px-3 file:rounded-l-lg file:border-0 file:text-[10px] file:font-semibold file:bg-slate-100 file:text-slate-650 hover:file:bg-slate-200 transition-all text-slate-500" 
                  />
                  {modalMode === 'edit' && formData.image_url && !selectedImage && (
                    <p className="text-[9px] text-emerald-600 font-medium mt-1">* Gambar produk terunggah. Kosongkan jika tidak ingin diubah.</p>
                  )}
                </div>

              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-1.5 font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition-all text-xs"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-1.5 font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm active:scale-95 text-xs flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle size={14} /> Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      
      {isInfoModalOpen && selectedInfo && (
        <div className="fixed inset-0 z-160 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 border border-slate-100">
            <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center bg-indigo-50/30 rounded-t-xl">
              <h2 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                <Info size={16} className="text-indigo-650" /> Informasi Log Produk
              </h2>
              <button 
                type="button" 
                onClick={() => setIsInfoModalOpen(false)} 
                className="text-slate-400 hover:text-rose-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 space-y-3.5 text-xs bg-white rounded-b-xl">
               <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Waktu Ditambahkan</p>
                 <p className="font-medium text-slate-700">{formatDate(selectedInfo.created_at)}</p>
               </div>
               
               <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Penambah Produk</p>
                 <p className="font-medium text-slate-750 capitalize">{selectedInfo.creator_name || 'Sistem / Superadmin'}</p>
               </div>
               
               <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100/50">
                 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Pengubah Terakhir</p>
                 <p className="font-medium text-slate-750 capitalize">{selectedInfo.updater_name || 'Belum pernah diperbarui'}</p>
               </div>
            </div>
            
            <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setIsInfoModalOpen(false)} 
                  className="px-4 py-1.5 font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all text-xs"
                >
                  Tutup
                </button>
            </div>
          </div>
        </div>
      )}

      
      {toast && (
        <div className="fixed bottom-6 right-6 z-200 animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={`px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 font-medium text-white text-xs ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle size={16} className="text-emerald-400" />
            ) : (
              <AlertTriangle size={16} className="text-white" />
            )}
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
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={closeConfirm}
                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-605 font-semibold text-xs rounded-xl transition-all"
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

export default AdminProducts;
