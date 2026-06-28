
/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { Ticket, Copy, CheckCircle2, ArrowRight, Sparkles, Percent, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */

const VoucherHome = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/vouchers/active')
      .then(res => res.json())
      .then(data => {

        setVouchers(Array.isArray(data) ? data.slice(0, 3) : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal mengambil data promo di beranda:", err);
        setLoading(false);
      });
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Selamanya';
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50 dark:bg-gray-950/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-5 lg:px-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse mb-4"></div>
          <div className="h-4 w-72 bg-gray-100 dark:bg-gray-850 rounded-lg animate-pulse mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (vouchers.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-950/80 transition-colors duration-300 relative overflow-hidden">

      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-green-400/5 dark:bg-green-500/5 blur-3xl rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-400/5 dark:bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-5 lg:px-6 relative z-1">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Makin Hemat dengan <span className="text-green-600 dark:text-green-400">Voucher Pilihan</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xl text-sm md:text-base font-medium">
              Salin kode voucher di bawah ini dan terapkan saat checkout untuk langsung mengaktifkan potongan harga spesial.
            </p>
          </div>

          <Link
            to="/promo"
            className="group inline-flex items-center gap-2 text-sm font-bold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors py-2"
          >
            Lihat Semua Voucher
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vouchers.map((voucher) => {
            const isPercent = voucher.discount_type === 'PERCENT';
            const discountLabel = isPercent
              ? `${voucher.discount_value}%`
              : `Rp${Number(voucher.discount_value).toLocaleString('id-ID')}`;

            return (
              <div
                key={voucher.id}
                className="relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-green-300 dark:hover:border-green-800/80 transition-all duration-300 flex flex-col justify-between overflow-hidden group min-h-[180px]"
              >

                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-500/10 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      {isPercent ? <Percent size={10} /> : null} Potongan Belanja
                    </span>
                    <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {discountLabel}
                    </h3>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 rounded-2xl border border-green-100/50 dark:border-green-900/30">
                    <Ticket size={20} className="group-hover:rotate-12 transition-transform" />
                  </div>
                </div>

                <div className="mt-4 space-y-1.5">
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Min. Belanja: <span className="text-gray-800 dark:text-gray-200 font-bold">Rp {Number(voucher.min_purchase).toLocaleString('id-ID')}</span>
                  </p>
                  <p className="text-[11px] text-gray-400 dark:text-gray-550 flex items-center gap-1">
                    <Calendar size={12} /> Berlaku s/d {formatDate(voucher.expired_at)}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-800/60 flex items-center justify-between gap-3">
                  <div className="bg-gray-50 dark:bg-gray-950 px-3 py-2 rounded-xl border border-gray-100/50 dark:border-gray-850">
                    <span className="text-xs font-black text-gray-800 dark:text-gray-200 tracking-wide uppercase select-all">
                      {voucher.code}
                    </span>
                  </div>

                  <button
                    onClick={() => handleCopyCode(voucher.code)}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 border cursor-pointer select-none bg-green-600 hover:bg-green-700 text-white border-transparent"
                  >
                    {copiedCode === voucher.code ? (
                      <>
                        <CheckCircle2 size={12} />
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
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default VoucherHome;
