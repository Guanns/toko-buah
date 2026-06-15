/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { 

/* -------------------------------------------------------------------------- */
/*                          KONSTANTA & UTILITY LOKAL                         */
/* -------------------------------------------------------------------------- */
  Ticket, 
  Copy, 
  CheckCircle2, 
  Clock, 
  Percent, 
  ChevronDown, 
  Info, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function Promo
const Promo = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [expandedVoucher, setExpandedVoucher] = useState(null); 

  useEffect(() => {
    fetch('http://localhost:5000/api/vouchers/active')
      .then(res => res.json())
      .then(data => {
        setVouchers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data promo:", err);
        setLoading(false);
      });
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500); 
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Tanpa Batas Waktu';
    return new Date(dateString).toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const toggleTerms = (id) => {
    setExpandedVoucher(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-24 px-4 md:px-8 font-sans text-gray-800 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        
        
        <div className="mb-12 text-center md:text-left border-b border-gray-100 dark:border-gray-900 pb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Voucher Belanja
          </h1>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-2 max-w-xl leading-relaxed">
            Salin kode voucher aktif di bawah ini dan gunakan pada saat proses checkout untuk mendapatkan potongan harga spesial.
          </p>
        </div>

        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-850 rounded-3xl h-40 flex flex-row">
                <div className="bg-gray-100 dark:bg-gray-800 w-1/3 rounded-l-3xl"></div>
                <div className="p-6 flex-1 space-y-4">
                  <div className="h-5 w-28 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  <div className="h-3 w-40 bg-gray-100 dark:bg-gray-800/80 rounded"></div>
                  <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded-lg mt-2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-16 flex flex-col items-center text-center shadow-xs max-w-lg mx-auto">
            <div className="bg-gray-50 dark:bg-gray-950 p-5 rounded-full mb-5 text-gray-400">
              <Ticket size={40} strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Belum Ada Promo Saat Ini</h3>
            <p className="text-gray-550 dark:text-gray-400 text-xs max-w-xs leading-relaxed font-medium">
              Maaf, saat ini belum ada kode promo aktif yang tersedia. Silakan kunjungi kembali halaman ini nanti.
            </p>
          </div>
        ) : (
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vouchers.map((voucher) => {
              const isPercent = voucher.discount_type === 'PERCENT';
              const isHighDiscount = !isPercent && Number(voucher.discount_value) >= 20000;
              const discountLabel = isPercent 
                ? `${voucher.discount_value}%` 
                : `Rp${Number(voucher.discount_value).toLocaleString('id-ID')}`;
              
              const isLimited = voucher.quota !== null && voucher.quota > 0;
              const isLowQuota = isLimited && voucher.quota <= 10;
              const isExpanded = expandedVoucher === voucher.id;

              
              let leftGradient = "from-emerald-500 to-teal-600";
              let badgeText = "Diskon";
              
              if (isPercent) {
                leftGradient = "from-emerald-500 to-teal-600";
                badgeText = "Persentase";
              } else if (isHighDiscount) {
                leftGradient = "from-amber-500 to-orange-600";
                badgeText = "Spesial";
              } else if (isLowQuota) {
                leftGradient = "from-rose-500 to-red-600";
                badgeText = "Terbatas";
              }

              return (
                <div 
                  key={voucher.id} 
                  className={`relative flex flex-col bg-white dark:bg-gray-900 border ${
                    isExpanded 
                      ? 'border-green-300 dark:border-green-800 ring-1 ring-green-300/30' 
                      : 'border-gray-100 dark:border-gray-800/80'
                  } rounded-3xl shadow-xs hover:shadow-md hover:border-green-300 dark:hover:border-green-800 transition-all duration-300 overflow-hidden group`}
                >
                  
                  <div className="absolute top-[45%] md:top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 dark:bg-gray-950 rounded-full border-r border-gray-150 dark:border-gray-850 z-10"></div>
                  <div className="absolute top-[45%] md:top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-50 dark:bg-gray-950 rounded-full border-l border-gray-150 dark:border-gray-850 z-10"></div>

                  
                  <div className="flex flex-col md:flex-row flex-1">
                    
                    
                    <div className={`bg-gradient-to-br ${leftGradient} md:w-1/3 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shrink-0`}>
                      <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full pointer-events-none"></div>
                      
                      <span className="text-white/80 text-[9px] font-black uppercase tracking-widest mb-1.5 flex items-center gap-1 select-none">
                        {isPercent ? <Percent size={9} /> : <TrendingUp size={9} />} {badgeText}
                      </span>
                      <span className="text-white text-2xl font-black tracking-tight leading-none group-hover:scale-105 transition-transform">
                        {discountLabel}
                      </span>
                      <span className="text-white/90 text-[8px] font-bold mt-2 bg-white/15 px-2 py-0.5 rounded-full select-none">
                        POTONGAN
                      </span>
                    </div>

                    
                    <div className="p-6 flex-1 flex flex-col justify-between relative">
                      <div>
                        
                        <div className="flex justify-between items-center gap-2 mb-2">
                          <h3 className="text-base font-black text-gray-900 dark:text-white tracking-wide uppercase select-all">
                            {voucher.code}
                          </h3>
                          
                          {isLowQuota ? (
                            <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/40 px-2 py-0.5 rounded-md animate-pulse select-none">
                              Sisa {voucher.quota}
                            </span>
                          ) : isLimited ? (
                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 px-2 py-0.5 rounded-md select-none">
                              Sisa {voucher.quota}
                            </span>
                          ) : (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 px-2 py-0.5 rounded-md select-none flex items-center gap-0.5">
                              <ShieldCheck size={9} /> Aktif
                            </span>
                          )}
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mt-1">
                          Min. Belanja:{' '}
                          <span className="text-gray-900 dark:text-gray-250 font-bold">
                            Rp {Number(voucher.min_purchase).toLocaleString('id-ID')}
                          </span>
                        </p>
                      </div>

                      
                      <div className="mt-5 pt-3 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between gap-4">
                        
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider flex items-center gap-1 select-none">
                            <Clock size={9} /> Berlaku S/D
                          </span>
                          <p className="text-[10px] font-black text-gray-700 dark:text-gray-300 mt-0.5">
                            {formatDate(voucher.expired_at)}
                          </p>
                        </div>

                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleTerms(voucher.id)}
                            className="p-2 bg-gray-50 dark:bg-gray-850 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-xl transition-all border border-gray-100 dark:border-gray-800 cursor-pointer"
                            title="Syarat & Ketentuan"
                          >
                            <ChevronDown size={12} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180 text-green-600' : ''}`} />
                          </button>

                          <button 
                            onClick={() => handleCopyCode(voucher.code)}
                            className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border cursor-pointer select-none ${
                              copiedCode === voucher.code 
                              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800' 
                              : 'bg-gray-900 hover:bg-gray-800 text-white border-transparent'
                            }`}
                          >
                            {copiedCode === voucher.code ? (
                              <>
                                <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Tersalin</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Salin</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  
                  <div 
                    className={`transition-all duration-300 overflow-hidden ${
                      isExpanded ? 'max-h-56 border-t border-gray-50 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-950/20' : 'max-h-0'
                    }`}
                  >
                    <div className="p-5 text-xs text-gray-550 dark:text-gray-400 space-y-2 leading-relaxed">
                      <h4 className="font-bold text-gray-750 dark:text-gray-300 flex items-center gap-1 mb-1">
                        <Info size={11} /> Syarat & Ketentuan:
                      </h4>
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Kupon berlaku untuk pembelanjaan minimal sebesar <span className="font-bold text-gray-755 dark:text-gray-300">Rp {Number(voucher.min_purchase).toLocaleString('id-ID')}</span>.</li>
                        {voucher.discount_type === 'PERCENT' ? (
                          <li>Mendapatkan potongan harga sebesar {voucher.discount_value}% dari total belanja.</li>
                        ) : (
                          <li>Mendapatkan potongan langsung Rp {Number(voucher.discount_value).toLocaleString('id-ID')} saat checkout.</li>
                        )}
                        <li>Kuota voucher terbatas (berlaku sistem siapa cepat dia dapat).</li>
                        <li>Voucher valid sampai dengan <span className="font-bold text-gray-755 dark:text-gray-300">{formatDate(voucher.expired_at)}</span>.</li>
                      </ul>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default Promo;
