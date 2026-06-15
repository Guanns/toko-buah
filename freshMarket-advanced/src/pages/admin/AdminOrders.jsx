/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { Search, Inbox, ChevronRight } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useAuth } from '../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function AdminOrders
const AdminOrders = () => {
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  
  const [downloadedSuratJalan, setDownloadedSuratJalan] = useState([]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
      else {
        setOrders([]);

        if (res.status === 401 || res.status === 403) {
          logout();
        }
      }
    } catch (err) {
      console.error("Gagal menarik data pesanan", err);
      setOrders([]);
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      await fetch(`http://localhost:5000/api/admin/orders/${id}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchOrders(); 
    } catch (err) {
      alert("Gagal update status");
    }
  };

  
  const renderStatus = (status) => {
    switch(status) {
      case 'MENUNGGU_ADMIN': 
        return <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"></div><span className="text-sm font-medium text-gray-700">Menunggu</span></div>;
      case 'DIPROSES': 
        return <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div><span className="text-sm font-medium text-gray-700">Diproses</span></div>;
      case 'DIKIRIM': 
        return <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500"></div><span className="text-sm font-medium text-gray-700">Dikirim</span></div>;
      case 'SELESAI': 
        return <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-sm font-medium text-gray-700">Selesai</span></div>;
      default: return null;
    }
  };

  const safeParseItems = (items) => {
    if (!items) return [];
    if (Array.isArray(items)) return items; 
    try { return JSON.parse(items); } catch(e) { return []; }
  };

  
  const handleCetakSuratJalan = (order) => {
    const itemsList = safeParseItems(order.items);
    const dataItem = itemsList[0] || {};
    const shippingAddress = order.shipping_address || dataItem.shipping_address || 'Alamat tidak ditentukan';
    const phoneNumber = order.phone_number || dataItem.phone_number || 'Tidak ada nomor telepon';

    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 12;

    
    doc.setFillColor(16, 185, 129); 
    doc.rect(0, 0, pageW, 10, 'F');

    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55); 
    doc.text('SURAT JALAN PENGIRIMAN BARANG', pageW / 2, 22, { align: 'center' });
    
    doc.setLineWidth(0.3);
    doc.setDrawColor(16, 185, 129);
    doc.line(margin, 25, pageW - margin, 25);

    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text('IDENTITAS PENERIMA & TUJUAN', margin, 32);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(75, 85, 99);
    
    doc.text(`Nama Pembeli   : ${order.customer_name || '-'}`, margin, 38);
    doc.text(`Nomor Telepon  : ${phoneNumber}`, margin, 43);
    
    
    const splitAddress = doc.splitTextToSize(`Alamat Tujuan   : ${shippingAddress}`, pageW - margin * 2);
    doc.text(splitAddress, margin, 48);

    const addressHeight = splitAddress.length * 4;
    let y = 48 + addressHeight + 2;

    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text('DAFTAR BARANG YANG DIKIRIM', margin, y);
    y += 4;

    
    doc.setFillColor(243, 244, 246);
    doc.rect(margin, y - 3, pageW - margin * 2, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(31, 41, 55);
    doc.text('Nama Produk', margin + 2, y + 1.2);
    doc.text('Kuantitas (kg / unit)', pageW - margin - 2, y + 1.2, { align: 'right' });
    y += 6;

    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(55, 65, 81);
    itemsList.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(249, 250, 251);
        doc.rect(margin, y - 3.5, pageW - margin * 2, 5.5, 'F');
      }
      doc.text(item.name || '-', margin + 2, y);
      doc.text(`${item.qty || item.quantity || 1} kg`, pageW - margin - 2, y, { align: 'right' });
      y += 5.5;
    });

    y += 6;
    doc.setDrawColor(229, 231, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 8;

    
    const colW = (pageW - margin * 2) / 3;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(75, 85, 99);
    
    doc.text('Petugas Kasir,', margin + colW / 2, y, { align: 'center' });
    doc.text('Petugas Kurir,', margin + colW + colW / 2, y, { align: 'center' });
    doc.text('Penerima Barang,', margin + colW * 2 + colW / 2, y, { align: 'center' });

    y += 16; 
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.text('( ___________________ )', margin + colW / 2, y, { align: 'center' });
    doc.text('( ___________________ )', margin + colW + colW / 2, y, { align: 'center' });
    doc.text(`( ${order.customer_name || '___________________'} )`, margin + colW * 2 + colW / 2, y, { align: 'center' });

    
    doc.save(`Surat_Jalan_Order_${order.id}.pdf`);

    
    setDownloadedSuratJalan(prev => {
      if (!prev.includes(order.id)) {
        return [...prev, order.id];
      }
      return prev;
    });
  };

  
  const filteredOrders = orders.filter(order => {
    const searchLower = searchQuery.toLowerCase();
    return (
      order.customer_name?.toLowerCase().includes(searchLower) ||
      order.id.toString().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="font-sans max-w-7xl mx-auto text-gray-800">
      
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Pesanan Masuk</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola dan perbarui status pesanan pelanggan.</p>
        </div>
        
        
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari nama atau ID Pesanan..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 text-sm transition-all"
          />
        </div>
      </div>
      
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-16 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-center">
          <Inbox size={40} className="text-gray-300 mb-4" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-gray-900 mb-1">Tidak ada data pesanan</h3>
          <p className="text-sm text-gray-500">{searchQuery ? 'Pencarian tidak ditemukan.' : 'Pesanan baru akan muncul di sini.'}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              
              
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200">
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Order ID</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Pelanggan</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Tanggal</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-medium text-gray-500 tracking-wider text-right">Aksi</th>
                </tr>
              </thead>

              
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map(order => {
                  const itemsList = safeParseItems(order.items);
                  const totalAmount = order.total_amount || 0;

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      
                      
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">#{order.id}</span>
                      </td>

                      
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{order.customer_name}</span>
                          <span className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                            {itemsList.map(i => `${i.name} (x${i.qty})`).join(', ')}
                          </span>
                        </div>
                      </td>

                      
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {new Date(order.created_at || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </td>

                      
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">Rp {Number(totalAmount).toLocaleString('id-ID')}</span>
                      </td>

                      
                      <td className="px-6 py-4">
                        {renderStatus(order.status)}
                      </td>

                      
                      <td className="px-6 py-4 text-right">
                        {order.status === 'MENUNGGU_ADMIN' && (
                          <button onClick={() => handleUpdateStatus(order.id, 'DIPROSES')} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
                            Proses <ChevronRight size={14}/>
                          </button>
                        )}
                        {order.status === 'DIPROSES' && (
                          <div className="flex items-center justify-end gap-2.5">
                            <button 
                              onClick={() => handleCetakSuratJalan(order)} 
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-lg transition-all border border-indigo-100 dark:border-indigo-900/40 shadow-2xs active:scale-95 cursor-pointer"
                            >
                              Unduh Surat Jalan
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(order.id, 'DIKIRIM')}
                              disabled={!downloadedSuratJalan.includes(order.id)}
                              className={`inline-flex items-center gap-1 px-3 py-1.5 font-bold text-xs rounded-lg transition-all border shadow-2xs ${
                                downloadedSuratJalan.includes(order.id)
                                  ? 'bg-emerald-600 hover:bg-emerald-700 border-transparent text-white active:scale-95 cursor-pointer'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                              }`}
                            >
                              Kirim <ChevronRight size={12}/>
                            </button>
                          </div>
                        )}
                        {order.status === 'SELESAI' && (
                          <span className="text-sm text-gray-400">Selesai</span>
                        )}
                        {order.status === 'DIKIRIM' && (
                          <span className="text-sm text-gray-400 italic">Menunggu User</span>
                        )}
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
  );
};

export default AdminOrders;
