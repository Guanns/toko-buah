/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3, TrendingUp, ShoppingBag, Tag, AlertTriangle,
  Filter, Download, RefreshCw, Package, ArrowUpRight, Calendar,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const API = 'http://localhost:5000';

const fmt = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

const today = () => new Date().toISOString().slice(0, 10);

const StatusBadge = ({ status }) => {
  const map = {

    MENUNGGU_ADMIN: 'bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400',
    DIPROSES:       'bg-blue-50 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-400',
    DIKIRIM:        'bg-indigo-50 dark:bg-indigo-950/35 border border-indigo-200 dark:border-indigo-900/40 text-indigo-700 dark:text-indigo-400',
    SELESAI:        'bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-405',

    qris:           'bg-emerald-50 dark:bg-emerald-950/35 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-405',
    bca:            'bg-blue-50 dark:bg-blue-950/35 border border-blue-200 dark:border-blue-900/40 text-blue-700 dark:text-blue-405',
    mandiri:        'bg-orange-50 dark:bg-orange-950/35 border border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-405',
  };

  const displayLabel = status === 'qris' ? 'QRIS Instan' : status === 'bca' ? 'BCA Virtual Account' : status === 'mandiri' ? 'Mandiri VA' : status;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${map[status] || 'bg-slate-100 dark:bg-slate-805 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'}`}>
      {displayLabel}
    </span>
  );
};

const SummaryCard = ({ icon: Icon, label, value, sub, colorClass, borderClass }) => (
  <div className={`bg-white dark:bg-gray-900 border ${borderClass || 'border-slate-100 dark:border-gray-800'} rounded-2xl p-6 flex gap-5 items-start shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-305 cursor-default relative overflow-hidden group`}>

    <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-[0.03] dark:opacity-[0.06] blur-xl group-hover:scale-150 transition-all duration-500 ${colorClass}`} />

    <div className={`p-3.5 rounded-xl ${colorClass} text-white shrink-0 shadow-md group-hover:scale-110 transition-transform duration-300`}>
      <Icon size={22} />
    </div>

    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{value}</p>
      {sub && (
        <div className="text-xs text-slate-450 dark:text-gray-400 mt-2 font-medium flex items-center gap-1.5">
          {sub}
        </div>
      )}
    </div>
  </div>
);

const Table = ({ title, subtitle, icon: Icon, headers, rows, emptyMsg = 'Tidak ada data' }) => (
  <div className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-800 rounded-2xl shadow-2xs hover:shadow-sm transition-all duration-300 overflow-hidden flex flex-col h-full">
    <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-gray-800 bg-slate-50/20 dark:bg-gray-950/20">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">{title}</h3>
          {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{subtitle}</p>}
        </div>
      </div>
    </div>

    <div className="overflow-x-auto flex-1">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50/60 dark:bg-gray-950/40 border-b border-slate-100 dark:border-gray-800 text-[10px] uppercase tracking-wider text-slate-450 dark:text-slate-550 font-bold">
            {headers.map((h, i) => (
              <th
                key={h}
                className={`px-6 py-3.5 font-semibold ${
                  i === headers.length - 1 ? 'text-right' : 'text-left'
                }`}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/50 dark:divide-gray-855/40 text-xs text-slate-600 dark:text-gray-300">
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="text-center text-slate-400 dark:text-gray-500 py-12">
                {emptyMsg}
              </td>
            </tr>
          ) : rows}
        </tbody>
      </table>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
export default function AdminReports() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [startDate, setStartDate]       = useState(today());
  const [endDate, setEndDate]           = useState(today());
  const [activePreset, setActivePreset] = useState('today');
  const [summary, setSummary]           = useState(null);
  const [topProducts, setTopProducts]   = useState([]);
  const [voucherPerf, setVoucherPerf]   = useState([]);

  const [dailyClose, setDailyClose]     = useState(null);
  const [payMethods, setPayMethods]     = useState([]);
  const [lowStock, setLowStock]         = useState([]);

  const [loading, setLoading]           = useState(false);
  const [fetchError, setFetchError]     = useState('');

  const fetchAdmin = useCallback(async (sd, ed) => {
    setLoading(true);
    setFetchError('');
    try {
      const qs = `startDate=${sd}&endDate=${ed}`;
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [resS, resTP, resVP] = await Promise.all([
        fetch(`${API}/api/admin/reports/sales-summary?${qs}`, { headers }),
        fetch(`${API}/api/admin/reports/top-products?limit=10`, { headers }),
        fetch(`${API}/api/admin/reports/voucher-performance`, { headers }),
      ]);

      if (resS.status === 401 || resS.status === 403) { logout(); return; }

      const [s, tp, vp] = await Promise.all([resS.json(), resTP.json(), resVP.json()]);
      setSummary(s);
      setTopProducts(Array.isArray(tp) ? tp : []);
      setVoucherPerf(Array.isArray(vp) ? vp : []);
    } catch {
      setFetchError('Gagal terhubung ke server backend. Pastikan server berjalan dan coba refresh halaman.');
    }
    finally { setLoading(false); }
  }, [logout]);

  const fetchKasir = useCallback(async () => {
    setLoading(true);
    setFetchError('');
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [resDC, resPM, resLS] = await Promise.all([
        fetch(`${API}/api/kasir/reports/daily-closing`, { headers }),
        fetch(`${API}/api/kasir/reports/payment-methods`, { headers }),
        fetch(`${API}/api/kasir/reports/low-stock`, { headers }),
      ]);

      if (resDC.status === 401 || resDC.status === 403) { logout(); return; }

      const [dc, pm, ls] = await Promise.all([resDC.json(), resPM.json(), resLS.json()]);
      setDailyClose(dc);
      setPayMethods(Array.isArray(pm) ? pm : []);
      setLowStock(Array.isArray(ls) ? ls : []);
    } catch {
      setFetchError('Gagal terhubung ke server backend. Pastikan server berjalan dan coba refresh halaman.');
    }
    finally { setLoading(false); }
  }, [logout]);

  useEffect(() => {
    if (isAdmin) fetchAdmin(startDate, endDate);
    else         fetchKasir();
  }, [isAdmin, fetchAdmin, fetchKasir]);

  const handleFilter = () => fetchAdmin(startDate, endDate);

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    const todayDate = new Date();
    let start = new Date();
    if (preset === 'today') {
      start = todayDate;
    } else if (preset === '7days') {
      start.setDate(todayDate.getDate() - 6);
    } else if (preset === '30days') {
      start.setDate(todayDate.getDate() - 29);
    } else if (preset === 'month') {
      start = new Date(todayDate.getFullYear(), todayDate.getMonth(), 1);
    }
    const sd = start.toISOString().slice(0, 10);
    const ed = todayDate.toISOString().slice(0, 10);
    setStartDate(sd);
    setEndDate(ed);
    fetchAdmin(sd, ed);
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const W = 210;
    let y = 20;

    const line  = () => { doc.setLineWidth(0.3); doc.setDrawColor(220,220,220); doc.line(15, y, W-15, y); y += 6; };
    const title = (t, size=13) => { doc.setFontSize(size); doc.setFont('helvetica','bold'); doc.setTextColor(20,20,20); doc.text(t, 15, y); y += size*0.6; };
    const body  = (t, size=9)  => { doc.setFontSize(size); doc.setFont('helvetica','normal'); doc.setTextColor(60,60,60); doc.text(t, 15, y); y += size*0.55; };
    const col   = (cells, widths, bold=false) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setTextColor(40,40,40);
      let x = 15;
      cells.forEach((c, i) => { doc.text(String(c), x, y); x += widths[i]; });
      y += 6;
    };

    doc.setFillColor(16,185,129); doc.rect(0, 0, W, 14, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold');
    doc.text('FreshMarket — Laporan Sistem', 15, 9);
    doc.setFontSize(8); doc.setFont('helvetica','normal');
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, W-15, 9, { align:'right' });
    y = 24;

    if (isAdmin) {
      title('Ringkasan Penjualan', 13);
      body(`Periode: ${startDate} s/d ${endDate}`);
      y += 2; line();
      col(['Total Omzet','Total Transaksi','Rata-rata Transaksi'],[70,55,65], true);
      col([
        fmt(summary?.total_pendapatan),
        String(summary?.total_transaksi || 0),
        fmt(summary?.rata_rata_transaksi),
      ],[70,55,65]);
      y += 4; line();

      title('Produk Terlaris', 11);
      col(['SKU','Nama Produk','Kategori','Terjual','Pendapatan'],[20,55,35,20,50], true);
      topProducts.forEach(p =>
        col([p.sku, p.name?.substring(0,25), p.category, String(p.total_terjual), fmt(p.akumulasi_pendapatan)],[20,55,35,20,50])
      );
      y += 4; line();

      title('Performa Voucher', 11);
      col(['Kode Promo','Penggunaan','Total Potongan'],[60,40,70], true);
      voucherPerf.forEach(v =>
        col([v.kode_voucher || '-', String(v.frekuensi_penggunaan), fmt(v.total_potongan)],[60,40,70])
      );
    } else {
      const dateStr = new Date().toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'});
      title(`Laporan Penutupan Kasir`, 13);
      body(dateStr);
      y += 2; line();
      body(`Total Pemasukan Hari Ini: ${fmt(dailyClose?.total_pemasukan)}`);
      y += 4; line();

      title('Ringkasan Status Transaksi', 11);
      col(['Status','Jumlah','Nominal'],[60,40,70], true);
      (dailyClose?.ringkasan_status || []).forEach(r =>
        col([r.status, String(r.jumlah_transaksi), fmt(r.total_nominal)],[60,40,70])
      );
      y += 4; line();

      title('Rekapitulasi Transaksi Hari Ini', 11);
      col(['Label','Frekuensi','Total'],[60,40,70], true);
      payMethods.forEach(p =>
        col([p.metode_label, String(p.frekuensi), fmt(p.total_nominal)],[60,40,70])
      );
    }

    doc.save(`laporan-freshmarket-${today()}.pdf`);
  };

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto text-gray-800 dark:text-gray-100">

      {fetchError && (
        <div className="flex items-start gap-4 bg-rose-50 border border-rose-100 dark:border-rose-950/20 text-rose-800 dark:text-rose-450 rounded-2xl px-6 py-4 text-sm font-medium shadow-2xs animate-in fade-in duration-200">
          <AlertTriangle size={20} className="shrink-0 mt-0.5 text-rose-550 dark:text-rose-405" />
          <div>
            <p className="font-bold text-rose-900 dark:text-rose-350 mb-0.5">Koneksi Backend Terganggu</p>
            <p className="text-xs opacity-90">{fetchError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-slate-100 dark:border-gray-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <span className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-600/20">
              <BarChart3 size={22} />
            </span>
            {isAdmin ? 'Laporan Penjualan' : 'Laporan Kasir'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-2 font-medium">
            {isAdmin
              ? 'Analisis performa penjualan, produk terlaris, dan penggunaan voucher.'
              : `Data transaksi hari ini — ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">

          <button
            onClick={() => isAdmin ? fetchAdmin(startDate, endDate) : fetchKasir()}
            disabled={loading}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-slate-50 dark:hover:bg-gray-850 text-slate-600 dark:text-gray-300 text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer shadow-2xs"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Perbarui Data
          </button>

          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer shadow-sm shadow-emerald-600/20"
          >
            <Download size={14} />
            Unduh Laporan PDF
          </button>
        </div>
      </div>

      {isAdmin && (
        <>

          <div className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-805 rounded-2xl p-6 shadow-2xs flex flex-col gap-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider">PINTASAN RENTANG TANGGAL</span>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'today', label: 'Hari Ini' },
                  { id: '7days', label: '7 Hari Terakhir' },
                  { id: '30days', label: '30 Hari Terakhir' },
                  { id: 'month', label: 'Bulan Ini' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handlePresetClick(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      activePreset === p.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 dark:bg-gray-950 text-slate-650 dark:text-gray-450 hover:bg-slate-100 dark:hover:bg-gray-850 border border-slate-205/60 dark:border-gray-800'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100 dark:bg-gray-800" />

            <div className="flex flex-wrap items-end gap-5">
              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  <Calendar size={12} className="inline mr-1.5 text-emerald-600" />Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setActivePreset('custom'); }}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-emerald-505/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="flex-1 min-w-[200px]">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-2">
                  <Calendar size={12} className="inline mr-1.5 text-emerald-600" />Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => { setEndDate(e.target.value); setActivePreset('custom'); }}
                  className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 dark:text-gray-250 focus:outline-none focus:ring-2 focus:ring-emerald-505/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <button
                onClick={handleFilter}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <Filter size={13} />
                Terapkan Filter
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SummaryCard
              icon={TrendingUp}
              label="Total Omzet"
              value={fmt(summary?.total_pendapatan)}
              sub={<span className="flex items-center gap-1"><CheckCircle size={12} className="text-emerald-550 dark:text-emerald-400" /> {summary?.total_transaksi || 0} Transaksi Selesai</span>}
              colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600"
              borderClass="border-emerald-100 dark:border-emerald-950/20"
            />
            <SummaryCard
              icon={Tag}
              label="Total Diskon Voucher"
              value={fmt(summary?.total_diskon)}
              sub="Akumulasi potongan harga voucher"
              colorClass="bg-gradient-to-br from-amber-500 to-orange-600"
              borderClass="border-amber-100 dark:border-amber-950/20"
            />
            <SummaryCard
              icon={ShoppingBag}
              label="Rata-rata Transaksi"
              value={fmt(summary?.rata_rata_transaksi)}
              sub="Rerata omzet per pesanan pembeli"
              colorClass="bg-gradient-to-br from-indigo-500 to-blue-600"
              borderClass="border-indigo-100 dark:border-indigo-950/20"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            <Table
              title="Produk Terlaris"
              subtitle="10 Produk dengan volume penjualan tertinggi"
              icon={Package}
              headers={['SKU', 'Nama Produk', 'Kategori', 'Terjual', 'Pendapatan']}
              emptyMsg="Belum ada data produk terjual pada periode ini."
              rows={topProducts.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-gray-850/40 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400 dark:text-gray-550">{p.sku}</td>
                  <td className="px-6 py-4 font-semibold text-slate-805 dark:text-gray-150 max-w-[150px] truncate capitalize">{p.name}</td>
                  <td className="px-6 py-4">
                    <span className="bg-slate-50 dark:bg-gray-950 border border-slate-150/65 dark:border-gray-800 text-slate-550 dark:text-gray-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md">{p.category}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600 dark:text-emerald-400">{p.total_terjual} kg</td>
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-white text-right">{fmt(p.akumulasi_pendapatan)}</td>
                </tr>
              ))}
            />

            <Table
              title="Performa Voucher"
              subtitle="Analisis penggunaan kode promo diskon"
              icon={Tag}
              headers={['Kode Promo', 'Frekuensi Penggunaan', 'Total Potongan']}
              emptyMsg="Belum ada penggunaan kode voucher pada periode ini."
              rows={voucherPerf.map((v, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-gray-850/40 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-800 dark:text-gray-150">{v.kode_voucher || '-'}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                      <ArrowUpRight size={13} /> {v.frekuensi_penggunaan}x digunakan
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-rose-600 dark:text-rose-405 text-right">{fmt(v.total_potongan)}</td>
                </tr>
              ))}
            />
          </div>
        </>
      )}

      {!isAdmin && (
        <>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SummaryCard
              icon={TrendingUp}
              label="Pemasukan Hari Ini"
              value={fmt(dailyClose?.total_pemasukan)}
              sub="Akumulasi omzet dari pesanan selesai"
              colorClass="bg-gradient-to-br from-emerald-500 to-teal-600"
              borderClass="border-emerald-100 dark:border-emerald-950/20"
            />
            <SummaryCard
              icon={ShoppingBag}
              label="Total Transaksi Hari Ini"
              value={(dailyClose?.ringkasan_status || []).reduce((a, r) => a + Number(r.jumlah_transaksi), 0)}
              sub="Total pesanan terdaftar hari ini"
              colorClass="bg-gradient-to-br from-indigo-500 to-blue-600"
              borderClass="border-indigo-100 dark:border-indigo-950/20"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

            <div className="bg-white dark:bg-gray-900 border border-slate-100 dark:border-gray-805 rounded-2xl shadow-2xs overflow-hidden flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-800 bg-slate-50/20 dark:bg-gray-950/20 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-805 dark:text-white text-sm tracking-tight">Rekapitulasi Penutupan Harian</h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Berdasarkan status pemrosesan pesanan</p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  {(dailyClose?.ringkasan_status || []).length === 0 ? (
                    <p className="text-center text-xs text-slate-400 dark:text-gray-550 py-12">Belum ada transaksi terdaftar hari ini.</p>
                  ) : (
                    (dailyClose?.ringkasan_status || []).map((r, i) => (
                      <div key={i} className="flex items-center justify-between border-b border-slate-100/50 dark:border-gray-800/40 pb-3.5 last:border-0 last:pb-0">
                        <StatusBadge status={r.status} />
                        <div className="flex items-center gap-6 text-right">
                          <span className="text-xs font-semibold text-slate-450 dark:text-gray-450">{r.jumlah_transaksi} Transaksi</span>
                          <span className="text-sm font-bold text-slate-800 dark:text-white">{fmt(r.total_nominal)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-8 bg-slate-50 dark:bg-gray-955 border border-slate-200/55 dark:border-gray-850 rounded-xl p-4.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-gray-500 uppercase tracking-widest">Pemasukan Final (Selesai)</p>
                      <p className="text-xs text-slate-450 dark:text-gray-400 mt-0.5 font-medium">Siap untuk penutupan buku kas</p>
                    </div>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{fmt(dailyClose?.total_pemasukan)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Table
              title="Rekapitulasi Metode Transaksi"
              subtitle="Pembagian transaksi hari ini berdasarkan jenis pembayaran"
              icon={TrendingUp}
              headers={['Metode Pembayaran', 'Frekuensi', 'Akumulasi Nominal']}
              emptyMsg="Belum ada transaksi terdaftar hari ini."
              rows={payMethods.map((p, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-gray-850/40 transition-colors">
                  <td className="px-6 py-4"><StatusBadge status={p.metode_label} /></td>
                  <td className="px-6 py-4 font-bold text-slate-800 dark:text-gray-150">{p.frekuensi}x transaksi</td>
                  <td className="px-6 py-4 font-bold text-slate-850 dark:text-white text-right">{fmt(p.total_nominal)}</td>
                </tr>
              ))}
            />
          </div>

          {lowStock.length > 0 && (
            <div className="bg-rose-50/50 dark:bg-rose-955/10 border border-rose-100 dark:border-rose-950/30 rounded-2xl overflow-hidden shadow-2xs animate-in fade-in duration-200">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-rose-105 dark:border-rose-950/20 bg-rose-100/10 dark:bg-rose-955/20">
                <AlertTriangle size={20} className="text-rose-550 dark:text-rose-400 shrink-0" />
                <div>
                  <h3 className="font-bold text-rose-905 dark:text-rose-350 text-sm tracking-tight">Peringatan Stok Kritis (Critical Stock)</h3>
                  <p className="text-xs text-rose-650 dark:text-rose-400 mt-0.5">{lowStock.length} produk membutuhkan restock segera (stok &lt; 10 kg/unit).</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-rose-100/5 dark:bg-rose-955/5 border-b border-rose-100/50 dark:border-rose-950/20 text-[10px] uppercase tracking-wider text-rose-700 dark:text-rose-455 font-bold">
                      {['SKU', 'Nama Produk', 'Kategori', 'Sisa Stok', 'Harga Jual'].map((h, i) => (
                        <th key={h} className={`px-6 py-3.5 ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100/30 dark:divide-rose-955/15 text-xs text-slate-650 dark:text-gray-300">
                    {lowStock.map((p, i) => (
                      <tr key={i} className="hover:bg-rose-100/20 dark:hover:bg-rose-950/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] text-rose-500 dark:text-rose-400 font-semibold">{p.sku}</td>
                        <td className="px-6 py-4 font-semibold text-slate-800 dark:text-gray-150 capitalize">{p.name}</td>
                        <td className="px-6 py-4">
                          <span className="bg-rose-100/30 dark:bg-rose-955/30 border border-rose-200/30 text-rose-750 dark:text-rose-400 text-[10px] font-bold px-2.5 py-0.5 rounded-md">{p.category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 font-black text-xs px-2.5 py-1 rounded-lg ${
                            Number(p.stock) === 0
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-955/30 dark:text-amber-400'
                          }`}>
                            {p.stock} unit
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-850 dark:text-white text-right">{fmt(p.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {lowStock.length === 0 && (
            <div className="bg-emerald-50/50 dark:bg-emerald-955/10 border border-emerald-100 dark:border-emerald-950/30 rounded-2xl p-5 flex items-center gap-3.5 shadow-2xs">
              <div className="p-2.5 bg-emerald-500 text-white rounded-lg">
                <CheckCircle size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-800 dark:text-emerald-350">Stok Produk Aman</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">Seluruh produk segar Anda saat ini memiliki persediaan di atas 10 unit.</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
