/**
 * ==============================================================================
 * MODUL: Footer.jsx
 * KELOMPOK: Komponen UI
 * DESKRIPSI: Komponen antarmuka pengguna untuk Footer FreshMarket.
 * ==============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React from "react";
import {

/* -------------------------------------------------------------------------- */
/*                          KONSTANTA & UTILITY LOKAL                         */
/* -------------------------------------------------------------------------- */
  Leaf,
  MapPin,
  Phone,
  Mail,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function Footer
const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 mt-20 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <div className="flex items-center gap-2 text-3xl font-extrabold">
              <Leaf className="text-green-600 w-8 h-8" />

              <span className="text-red-500">
                Fresh
              </span>

              <span className="text-green-600">
                Market
              </span>
            </div>

            <p className="mt-5 text-gray-600 dark:text-gray-300 leading-relaxed max-w-md">
              Menyediakan bahan pangan segar,
              sehat, dan berkualitas untuk
              kebutuhan keluarga setiap hari.
            </p>

            <div className="mt-6 flex flex-col gap-3 text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-3">
                <Phone
                  size={18}
                  className="text-green-600"
                />
                <span>+62 812-xxxx-xxxx</span>
              </div>

              <div className="flex items-center gap-3">
                <Mail
                  size={18}
                  className="text-green-600"
                />
                <span>freshmarket@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-sm">
            <h4 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-5">
              <MapPin className="text-red-500" />
              Lokasi Kami
            </h4>

            <div className="space-y-2 text-gray-600 dark:text-gray-300">
              <p className="font-semibold text-gray-800 dark:text-white">
                Fresh Market Bontang
              </p>
              <p>Jl. (Privasi WLWEOWLEWOELWEOOLWLEO)</p>
              <p>Kecamatan Bontang Utara</p>
              <p>Kalimantan Timur</p>
            </div>

            <button className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-2xl transition duration-300">
              Buka di Google Maps
            </button>
          </div>
        </div>

        
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>
            © {new Date().getFullYear()}{" "}
            FreshMarket. All rights reserved.
          </p>

          <div className="flex gap-6">
            <a
              href="#"
              className="hover:text-green-600 dark:hover:text-green-400 transition"
            >
              Privacy Policy
            </a>

            <a
              href="#"
              className="hover:text-green-600 dark:hover:text-green-400 transition"
            >
              Terms
            </a>

            <a
              href="#"
              className="hover:text-green-600 dark:hover:text-green-400 transition"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
