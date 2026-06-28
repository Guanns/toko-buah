
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import {
  Leaf,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Clock
} from "lucide-react";

const Footer = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.warning("Silakan masukkan email Anda terlebih dahulu.");
      return;
    }
    toast.success("Terima kasih! Anda berhasil berlangganan newsletter Freshmarket.");
    setEmail("");
  };

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-slate-100 dark:border-slate-900 mt-28 transition-colors duration-300">

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-slate-100 dark:border-slate-900">

          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Leaf size={22} className="animate-pulse" />
              </div>
              <span className="text-slate-800 dark:text-white font-headline">
                Fresh<span className="text-emerald-500 font-bold">market</span>
              </span>
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              Menyajikan kesegaran terbaik dari alam langsung ke meja makan Anda. Buah segar pilihan untuk gaya hidup sehat keluarga Indonesia.
            </p>

            <div className="flex items-center gap-3.5">
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 transition-all duration-300 shadow-sm" aria-label="Instagram">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 transition-all duration-300 shadow-sm" aria-label="Facebook">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 dark:bg-slate-900 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-400 transition-all duration-300 shadow-sm" aria-label="Twitter">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 font-headline">Belanja</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link to="/products" className="text-slate-550 hover:text-emerald-600 dark:text-slate-450 dark:hover:text-emerald-400 transition-colors">Buah Lokal</Link>
              </li>
              <li>
                <Link to="/products" className="text-slate-550 hover:text-emerald-600 dark:text-slate-450 dark:hover:text-emerald-400 transition-colors">Buah Impor</Link>
              </li>
              <li>
                <Link to="/promo" className="text-slate-550 hover:text-emerald-600 dark:text-slate-450 dark:hover:text-emerald-400 transition-colors">Voucher Promo</Link>
              </li>
              <li>
                <Link to="/cart" className="text-slate-550 hover:text-emerald-600 dark:text-slate-450 dark:hover:text-emerald-400 transition-colors">Keranjang</Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-450 dark:text-slate-500 font-headline">Dukungan</h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link to="/tracking" className="text-slate-550 hover:text-emerald-600 dark:text-slate-450 dark:hover:text-emerald-400 transition-colors">Lacak Pesanan</Link>
              </li>
              <li>
                <Link to="/profile" className="text-slate-550 hover:text-emerald-600 dark:text-slate-450 dark:hover:text-emerald-400 transition-colors">Akun Saya</Link>
              </li>
              <li>
                <a href="#" className="text-slate-550 hover:text-emerald-600 dark:text-slate-450 dark:hover:text-emerald-400 transition-colors">Kebijakan Layanan</a>
              </li>
              <li>
                <a href="#" className="text-slate-550 hover:text-emerald-600 dark:text-slate-450 dark:hover:text-emerald-400 transition-colors">Hubungi Kami</a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-900/60 rounded-3xl p-6 space-y-5 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <div className="bg-rose-500/10 p-1.5 rounded-lg text-rose-500">
                  <MapPin size={16} />
                </div>
                <h5 className="text-sm font-bold text-slate-800 dark:text-white font-headline">Freshmarket Bontang</h5>
              </div>

              <div className="space-y-2.5 text-xs font-medium text-slate-500 dark:text-slate-450 leading-relaxed">
                <p className="flex items-start gap-2">
                  <span className="font-semibold text-slate-850 dark:text-slate-200">Alamat:</span>
                  <span>Kecamatan Bontang Utara, Kota Bontang, Kalimantan Timur</span>
                </p>
                <p className="flex items-center gap-2">
                  <Clock size={12} className="text-emerald-500" />
                  <span>Buka Setiap Hari: 07.00 - 21.00 WITA</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={12} className="text-emerald-500" />
                  <span>+62 812-xxxx-xxxx</span>
                </p>
              </div>

              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-2xl text-xs transition-all duration-300 shadow-sm active:scale-[0.98]"
              >
                <span>Buka di Google Maps</span>
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium text-slate-400 dark:text-slate-500">
          <p className="order-2 md:order-1">
            &copy; {new Date().getFullYear()} Freshmarket. Seluruh hak cipta dilindungi undang-undang.
          </p>

          <div className="flex gap-6 order-1 md:order-2">
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Ketentuan Layanan</a>
            <a href="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Hubungi Kami</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
