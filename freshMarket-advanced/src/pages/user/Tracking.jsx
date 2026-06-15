/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Package, Truck, CheckCircle2, ShoppingBag, Clock, ChevronRight, ReceiptText, TrendingUp, Tag, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function Tracking
const Tracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState('ALL');
  const [expandedOrders, setExpandedOrders] = useState({});
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

  const fetchUserOrders = async () => {
    if (!user) {
        setLoading(false);
        return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/orders/user/${user.id}`);
      const data = await res.json();
      
      if (Array.isArray(data)) {
          setOrders(data);
      } else {
          setOrders([]);
      }
    } catch (err) {
      setOrders([]);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => { fetchUserOrders(); }, [user]);

  const handleSelesaikanPesanan = (orderId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Konfirmasi Pesanan Selesai',
      message: 'Apakah Anda yakin buah segar pesanan Anda telah sampai dengan kondisi baik dan ingin menandai pesanan ini sebagai selesai?',
      confirmText: 'Ya, Selesai',
      confirmType: 'success',
      onConfirm: async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/orders/${orderId}/complete`, { method: 'PUT' });
          if (res.ok) {
            toast.success("Pesanan berhasil diselesaikan! Terima kasih telah berbelanja.");
            fetchUserOrders();
          } else {
            toast.error("Gagal menyelesaikan pesanan");
          }
        } catch (err) {
          toast.error("Gagal menyelesaikan pesanan");
        }
        closeConfirm();
      }
    });
  };

  const toggleOrderExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusConfig = (status) => {
    switch(status) {
      case 'MENUNGGU_ADMIN': 
        return { label: 'Menunggu', color: 'text-amber-700 bg-amber-50/70 border-amber-200/50', barColor: 'bg-amber-400', step: 1, icon: Clock };
      case 'DIPROSES': 
        return { label: 'Diproses', color: 'text-blue-700 bg-blue-50/70 border-blue-200/50', barColor: 'bg-blue-500', step: 2, icon: Package };
      case 'DIKIRIM': 
        return { label: 'Dikirim', color: 'text-indigo-700 bg-indigo-50/70 border-indigo-200/50', barColor: 'bg-indigo-500', step: 3, icon: Truck };
      case 'SELESAI': 
        return { label: 'Selesai', color: 'text-emerald-700 bg-emerald-50/70 border-emerald-200/50', barColor: 'bg-emerald-500', step: 4, icon: CheckCircle2 };
      default: 
        return { label: 'Unknown', color: 'text-gray-700 bg-gray-50/70 border-gray-200/50', barColor: 'bg-gray-400', step: 0, icon: Package };
    }
  };

  const safeParseItems = (items) => {
      if (!items) return [];
      if (Array.isArray(items)) return items; 
      try { return JSON.parse(items); } catch(e) { return []; }
  };

  
  const totalSpent = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const activeOrdersCount = orders.filter(order => order.status !== 'SELESAI').length;
  const completedOrdersCount = orders.filter(order => order.status === 'SELESAI').length;

  const tabs = [
    { id: 'ALL', label: 'Semua Pesanan' },
    { id: 'PROCESS', label: 'Diproses' },
    { id: 'SHIPPED', label: 'Dikirim' },
    { id: 'COMPLETED', label: 'Selesai' }
  ];

  const getTabCount = (tabId) => {
    switch (tabId) {
      case 'ALL': return orders.length;
      case 'PROCESS': return orders.filter(o => o.status === 'MENUNGGU_ADMIN' || o.status === 'DIPROSES').length;
      case 'SHIPPED': return orders.filter(o => o.status === 'DIKIRIM').length;
      case 'COMPLETED': return orders.filter(o => o.status === 'SELESAI').length;
      default: return 0;
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PROCESS') return order.status === 'MENUNGGU_ADMIN' || order.status === 'DIPROSES';
    if (activeTab === 'SHIPPED') return order.status === 'DIKIRIM';
    if (activeTab === 'COMPLETED') return order.status === 'SELESAI';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-8 font-sans text-gray-800">
        <div className="max-w-7xl mx-auto">
          
          <div className="mb-8 space-y-2 animate-pulse">
            <div className="h-8 w-48 bg-gray-250 rounded-lg"></div>
            <div className="h-4 w-80 bg-gray-200 rounded-lg"></div>
          </div>
          
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-5 w-28 bg-gray-250 rounded"></div>
                </div>
              </div>
            ))}
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
                <div className="h-24 bg-gray-150 rounded-xl"></div>
                <div className="h-10 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user || orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center pt-20 px-6 text-center font-sans">
        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm mb-6 text-emerald-600">
          <ShoppingBag size={48} strokeWidth={1.5} className="animate-bounce" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Transaksi</h2>
        <p className="text-gray-500 text-sm mb-8 max-w-sm leading-relaxed">
          Semua pesanan dan riwayat belanja buah segar Anda akan muncul di halaman ini. Yuk, mulai isi keranjang Anda sekarang!
        </p>
        <Link to="/products" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-sm active:scale-95 text-sm">
          Mulai Belanja Buah Segar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-28 pb-20 px-4 md:px-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto">
        
        
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pesanan Saya</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">Lacak pengiriman, kelola transaksi, dan lihat riwayat belanja buah segar Anda.</p>
            </div>
            <Link to="/products" className="inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm active:scale-95">
              Belanja Lagi
            </Link>
          </div>
        </div>

        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-all duration-300 hover:shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Belanja</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">Rp {totalSpent.toLocaleString('id-ID')}</h3>
            </div>
          </div>
          
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-all duration-300 hover:shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Truck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pesanan Aktif</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{activeOrdersCount} Transaksi</h3>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-all duration-300 hover:shadow-sm">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selesai</p>
              <h3 className="text-xl font-bold text-slate-800 mt-0.5">{completedOrdersCount} Transaksi</h3>
            </div>
          </div>
        </div>

        
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3.5 px-4 font-semibold text-xs border-b-2 transition-all shrink-0 relative flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-350'
              }`}
            >
              {tab.label}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {getTabCount(tab.id)}
              </span>
            </button>
          ))}
        </div>

        
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200/65 rounded-2xl p-12 text-center shadow-xs">
            <ShoppingBag className="mx-auto text-gray-300 mb-4 animate-pulse" size={40} />
            <h3 className="text-sm font-bold text-slate-800">Tidak ada pesanan ditemukan</h3>
            <p className="text-xs text-gray-400 mt-1">Belum ada pesanan untuk filter yang Anda pilih.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const itemsList = safeParseItems(order.items);
              const totalAmount = order.total || 0; 
              const StatusIcon = statusConfig.icon;

              const steps = [
                { label: 'Menunggu', status: 'MENUNGGU_ADMIN' },
                { label: 'Diproses', status: 'DIPROSES' },
                { label: 'Dikirim', status: 'DIKIRIM' },
                { label: 'Selesai', status: 'SELESAI' }
              ];

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200/60 shadow-xs hover:shadow-md hover:border-emerald-250 transition-all duration-300 flex flex-col h-full overflow-hidden">
                  
                  
                  <div className="p-5 border-b border-slate-100 bg-slate-50/40">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <ReceiptText size={18} className="text-slate-400" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">ID ORDER #{order.id}</p>
                          <p className="text-xs font-semibold text-slate-600 mt-0.5">
                            {new Date(order.date || order.created_at || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border flex items-center gap-1.5 ${statusConfig.color}`}>
                        <StatusIcon size={11} />
                        {statusConfig.label}
                      </span>
                    </div>

                    
                    <div className="relative flex items-center justify-between w-full mt-5 mb-1 px-1">
                      
                      <div className="absolute left-0 right-0 top-3 h-0.5 bg-slate-100 z-0">
                        <div 
                          className="h-full bg-emerald-500 transition-all duration-500" 
                          style={{ width: `${statusConfig.step === 4 ? 100 : statusConfig.step === 3 ? 66.6 : statusConfig.step === 2 ? 33.3 : 0}%` }}
                        />
                      </div>
                      
                      
                      {steps.map((s, idx) => {
                        const stepNum = idx + 1;
                        const isCompleted = statusConfig.step === 4 || stepNum < statusConfig.step;
                        const isActive = statusConfig.step !== 4 && stepNum === statusConfig.step;
                        const isCurrent = stepNum === statusConfig.step;
                        
                        return (
                          <div key={idx} className="flex flex-col items-center relative z-10 bg-white px-1 select-none">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold transition-all duration-300 ${
                              isCompleted ? 'bg-emerald-500 text-white' :
                              isActive ? 'bg-white border-2 border-emerald-500 text-emerald-600 ring-4 ring-emerald-50' :
                              'bg-gray-50 border-2 border-slate-200 text-slate-400'
                            }`}>
                              {isCompleted ? '✓' : stepNum}
                            </div>
                            <span className={`text-[9px] mt-1 font-medium tracking-wide ${
                              isCurrent ? 'text-emerald-600 font-semibold' : 'text-slate-500'
                            }`}>
                              {s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  
                  <div className="p-5 flex-1 flex flex-col space-y-4">
                    
                    {!expandedOrders[order.id] && (
                      <div className="flex items-center justify-between gap-2 py-1.5 border border-slate-100 rounded-xl px-3 bg-slate-50/50">
                        <div className="flex items-center gap-2 truncate">
                          <div className="flex -space-x-2 shrink-0">
                            {itemsList.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-white flex items-center justify-center text-xs font-bold text-emerald-700 capitalize shadow-xs shrink-0 select-none">
                                {item.name.charAt(0)}
                              </div>
                            ))}
                            {itemsList.length > 3 && (
                              <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-slate-500 shadow-xs shrink-0 select-none">
                                +{itemsList.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] font-medium text-slate-600 truncate max-w-[130px] md:max-w-[160px]">
                            {itemsList[0]?.name || 'Produk'} {itemsList.length > 1 ? `& ${itemsList.length - 1} buah lainnya` : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    
                    {expandedOrders[order.id] && (
                      <div className="space-y-2 animate-in fade-in duration-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                          <Tag size={12} />
                          <span>Daftar Buah Dipesan</span>
                        </div>
                        <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl p-3 border border-slate-100">
                          {itemsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 text-xs">
                              <div className="flex items-center gap-2 truncate">
                                <span className="font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] shrink-0">
                                  {item.qty}x
                                </span>
                                <span className="font-medium text-slate-700 truncate">{item.name}</span>
                              </div>
                              <span className="font-semibold text-slate-800 shrink-0">
                                Rp {((item.price || 0) * (item.qty || 1)).toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    
                    <button 
                      onClick={() => toggleOrderExpand(order.id)}
                      className="w-full flex items-center justify-between py-1 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors mt-1"
                    >
                      <span>{expandedOrders[order.id] ? 'Sembunyikan Rincian' : 'Lihat Rincian Belanja'}</span>
                      <ChevronRight size={14} className={`transform transition-transform duration-300 ${expandedOrders[order.id] ? 'rotate-90 text-emerald-600' : 'text-slate-400'}`} />
                    </button>
                  </div>

                  
                  <div className="p-5 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto bg-slate-50/15">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Belanja</p>
                      <p className="text-base font-bold text-emerald-600">Rp {Number(totalAmount).toLocaleString('id-ID')}</p>
                    </div>
                    
                    {order.status === 'DIKIRIM' ? (
                      <button 
                        onClick={() => handleSelesaikanPesanan(order.id)} 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4.5 py-2 rounded-xl transition-all hover:shadow-sm active:scale-95 flex items-center gap-1.5"
                      >
                        Selesaikan Pesanan <ChevronRight size={13} />
                      </button>
                    ) : (
                      <span className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border bg-white select-none ${
                        order.status === 'SELESAI' ? 'text-emerald-600 border-emerald-100' : 'text-slate-400 border-slate-200/85'
                      }`}>
                        {order.status === 'SELESAI' ? 'Tuntas' : 'Diproses'}
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl border border-slate-100 overflow-hidden p-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 border ${
                confirmModal.confirmType === 'success' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100/50' 
                  : 'bg-rose-50 text-rose-500 border-rose-100/50'
              }`}>
                {confirmModal.confirmType === 'success' ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <AlertTriangle size={24} />
                )}
              </div>
              
              <h3 className="text-sm font-semibold text-slate-800 mb-1.5">{confirmModal.title}</h3>
              <p className="text-xs text-slate-550 font-medium leading-relaxed mb-6">
                {confirmModal.message}
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={closeConfirm}
                  className="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 font-semibold text-xs rounded-xl transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmModal.onConfirm}
                  className={`flex-1 py-2.5 text-white font-semibold text-xs rounded-xl transition-all shadow-sm active:scale-95 ${
                    confirmModal.confirmType === 'success'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                      : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
                  }`}
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

export default Tracking;
