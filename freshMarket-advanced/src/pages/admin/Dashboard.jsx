/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  CheckCircle,
  AlertTriangle,
  Package,
  RefreshCw,
  Calendar,
  ArrowRight,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {

  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [greeting, setGreeting] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [downloadedSuratJalan, setDownloadedSuratJalan] = useState([]);

  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const darkActive = document.documentElement.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
      setIsDark(darkActive);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat pagi';
    if (hour < 15) return 'Selamat siang';
    if (hour < 19) return 'Selamat sore';
    return 'Selamat malam';
  };

  const processWeeklySales = (salesData) => {
    const result = [];
    const salesMap = {};

    const toLocalYYYYMMDD = (dateInput) => {
      const d = new Date(dateInput);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (Array.isArray(salesData)) {
      salesData.forEach(item => {
        if (item.date) {
          const dateStr = toLocalYYYYMMDD(item.date);
          salesMap[dateStr] = Number(item.amount);
        }
      });
    }

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = toLocalYYYYMMDD(d);

      result.push({
        date: dateStr,
        amount: salesMap[dateStr] || 0
      });
    }

    return result;
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = user?.role === 'admin'
        ? 'http://localhost:5000/api/admin/dashboard/stats'
        : 'http://localhost:5000/api/kasir/dashboard/stats';

      const res = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (res.ok) {
        const stats = await res.json();

        if (user?.role === 'admin' && stats.weeklySales) {
          stats.weeklySales = processWeeklySales(stats.weeklySales);
        }

        setData(stats);
      } else {
        if (res.status === 401 || res.status === 403) {
          logout();
        }
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setGreeting(getGreeting());
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        showStatusMsg(`Pesanan #${orderId} berhasil diubah ke status ${newStatus}`);
        fetchData();
      } else {
        showStatusMsg('Gagal memperbarui status pesanan', 'error');
      }
    } catch (err) {
      showStatusMsg('Terjadi kesalahan jaringan', 'error');
    }
  };

  const showStatusMsg = (message, type = 'success') => {
    setStatusMessage({ message, type });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[60vh] font-sans">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-sm font-medium text-gray-500 animate-pulse">Memuat data dashboard...</p>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 max-w-7xl mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight capitalize">
            {greeting}, {user?.name || 'Staff'}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {user?.role === 'admin'
              ? 'Berikut adalah ringkasan kinerja penjualan dan katalog Freshmarket.'
              : 'Pantau pesanan masuk hari ini dan cek stok produk segar Anda.'
            }
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 shadow-sm"
        >
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {user?.role === 'admin' && data && (
        <div className="space-y-8 animate-in fade-in duration-300">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pendapatan Total</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{formatRupiah(data.totalIncome)}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Bulan Ini</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{formatRupiah(data.monthlyIncome)}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pesanan Selesai</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{data.totalOrders} Pesanan</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Users size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pengguna Terdaftar</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{data.totalUsers} Pelanggan</p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Tren Penjualan Mingguan</h3>
                <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">7 Hari Terakhir</span>
              </div>

              <div className="relative w-full h-52 flex items-center justify-center">
                {data.weeklySales && data.weeklySales.length > 0 ? (
                  (() => {
                    const textColor = isDark ? '#9ca3af' : '#4b5563';
                    const gridColor = isDark ? 'rgba(75, 85, 99, 0.15)' : 'rgba(229, 231, 235, 0.5)';

                    const chartData = {
                      labels: data.weeklySales.map(item => {
                        const dateObj = new Date(item.date);
                        return dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric' });
                      }),
                      datasets: [
                        {
                          label: 'Penjualan',
                          data: data.weeklySales.map(item => Number(item.amount)),
                          backgroundColor: 'rgba(16, 185, 129, 0.85)',
                          hoverBackgroundColor: 'rgba(16, 185, 129, 1)',
                          borderColor: 'rgba(16, 185, 129, 1)',
                          borderWidth: 1,
                          borderRadius: 6,
                          barThickness: window.innerWidth < 640 ? 12 : 24,
                        }
                      ]
                    };

                    const chartOptions = {
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        tooltip: {
                          backgroundColor: isDark ? '#1f2937' : '#111827',
                          titleColor: '#fff',
                          bodyColor: '#fff',
                          titleFont: { size: 11, weight: 'bold' },
                          bodyFont: { size: 11 },
                          padding: 10,
                          cornerRadius: 8,
                          displayColors: false,
                          callbacks: {
                            label: (context) => {
                              return 'Penjualan: ' + formatRupiah(context.raw);
                            }
                          }
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: gridColor,
                          },
                          ticks: {
                            color: textColor,
                            font: { size: 10 },
                            callback: (value) => {
                              if (value >= 1000000) return `Rp ${value / 1000000}JT`;
                              if (value >= 1000) return `Rp ${value / 1000}RB`;
                              return `Rp ${value}`;
                            }
                          }
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                          ticks: {
                            color: textColor,
                            font: { size: 10 }
                          }
                        }
                      }
                    };

                    return <Bar data={chartData} options={chartOptions} />;
                  })()
                ) : (
                  <div className="text-xs text-gray-400">
                    Belum ada data penjualan mingguan.
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm flex flex-col">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Produk Terlaris</h3>

              <div className="space-y-4 flex-1">
                {data.bestSellers && data.bestSellers.length > 0 ? (
                  data.bestSellers.map((prod, idx) => (
                    <div key={prod.id} className="flex items-center gap-3 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <span className="text-xs font-semibold text-gray-400 w-4">#{idx + 1}</span>

                      {prod.image_url ? (
                        <img src={prod.image_url} alt={prod.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400">
                          <Package size={16} />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate capitalize">{prod.name}</p>
                        <p className="text-[10px] text-gray-400 uppercase mt-0.5">{prod.category} • SKU: {prod.sku}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          {prod.total_sold} Pcs
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-gray-400">
                    Belum ada produk terjual.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {user?.role === 'kasir' && data && (
        <div className="space-y-8 animate-in fade-in duration-300">

          {data.lowStockProducts && data.lowStockProducts.length > 0 && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-xl p-4 flex gap-3 shadow-sm">
              <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-rose-900">Perhatian: Stok Produk Menipis!</h4>
                <p className="text-xs text-rose-700 mt-0.5">Beberapa produk memiliki stok kurang dari 10. Segera lakukan restock agar penjualan tidak terhambat:</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {data.lowStockProducts.map(prod => (
                    <span key={prod.id} className="bg-white border border-rose-200 text-[10px] font-semibold text-rose-800 px-2.5 py-1 rounded-md shadow-sm">
                      {prod.name} ({prod.stock} tersisa)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <DollarSign size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pendapatan Hari Ini</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{formatRupiah(data.todayIncome)}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <ShoppingCart size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pesanan Hari Ini</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{data.todayOrders} Pesanan</p>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <AlertTriangle size={22} />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Menunggu / Diproses</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">{data.pendingOrders} Pesanan</p>
              </div>
            </div>

          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">Pesanan Masuk Terbaru (Recent Orders)</h3>
              <span className="text-[10px] text-gray-400 font-medium">Batas update status langsung</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-50/20 border-b border-gray-200 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                    <th className="px-6 py-3.5">ID Pesanan</th>
                    <th className="px-6 py-3.5">Nama Pembeli</th>
                    <th className="px-6 py-3.5">Waktu</th>
                    <th className="px-6 py-3.5">Total Harga</th>
                    <th className="px-6 py-3.5">Status Saat Ini</th>
                    <th className="px-6 py-3.5 text-center">Ubah Status</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-gray-50">
                  {data.recentOrders && data.recentOrders.length > 0 ? (
                    data.recentOrders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-700">#{order.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-800 capitalize">{order.customer_name}</td>
                        <td className="px-6 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{formatRupiah(order.total_amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                            order.status === 'SELESAI'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : order.status === 'DIKIRIM'
                              ? 'bg-blue-50 border-blue-200 text-blue-700'
                              : order.status === 'DIPROSES'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                              : 'bg-amber-50 border-amber-200 text-amber-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {order.status === 'MENUNGGU_ADMIN' && (
                              <button
                                onClick={() => handleUpdateStatus(order.id, 'DIPROSES')}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors"
                              >
                                PROSES
                              </button>
                            )}
                            {order.status === 'DIPROSES' && (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleCetakSuratJalan(order)}
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-lg transition-all border border-indigo-100 dark:border-indigo-900/40 shadow-2xs active:scale-95 cursor-pointer"
                                >
                                  Unduh Surat Jalan
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(order.id, 'DIKIRIM')}
                                  disabled={!downloadedSuratJalan.includes(order.id)}
                                  className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all border shadow-2xs ${
                                    downloadedSuratJalan.includes(order.id)
                                      ? 'bg-emerald-600 hover:bg-emerald-700 border-transparent text-white active:scale-95 cursor-pointer'
                                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                  }`}
                                >
                                  KIRIM
                                </button>
                              </div>
                            )}
                            {order.status === 'DIKIRIM' && (
                              <span className="text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-semibold">Dikirim (Menunggu User)</span>
                            )}
                            {order.status === 'SELESAI' && (
                              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md font-semibold">Selesai</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-400">
                        Belum ada pesanan terbaru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {statusMessage && (
        <div className="fixed bottom-6 right-6 z-200 animate-in slide-in-from-right-10 fade-in duration-300">
          <div className={`px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2 font-medium text-white text-xs ${
            statusMessage.type === 'error' ? 'bg-rose-600' : 'bg-gray-900'
          }`}>
            <CheckCircle size={16} className={statusMessage.type === 'error' ? 'text-white' : 'text-green-400'} />
            {statusMessage.message}
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
