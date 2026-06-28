
/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React from 'react';
import { ShoppingBag, CreditCard, PackageCheck, Truck } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */

const CaraKerja = () => {
  const steps = [
    {
      id: 1,
      title: "Pilih Buah Segar",
      description: "Jelajahi katalog kami dan masukkan buah segar favorit Anda ke dalam keranjang.",
      icon: <ShoppingBag size={32} className="text-green-500 dark:text-green-400" />,
      bgColor: "bg-green-100 dark:bg-green-950/40"
    },
    {
      id: 2,
      title: "Checkout & Bayar",
      description: "Selesaikan pesanan dan bayar dengan mudah menggunakan QRIS atau transfer.",
      icon: <CreditCard size={32} className="text-blue-500 dark:text-blue-400" />,
      bgColor: "bg-blue-100 dark:bg-blue-950/40"
    },
    {
      id: 3,
      title: "Pesanan Diproses",
      description: "Tim kami akan langsung menyiapkan dan mengemas buah segar pesanan Anda.",
      icon: <PackageCheck size={32} className="text-orange-500 dark:text-orange-400" />,
      bgColor: "bg-orange-100 dark:bg-orange-950/40"
    },
    {
      id: 4,
      title: "Pantau & Terima",
      description: "Pantau status pesanan secara real-time hingga buah tiba di depan pintu Anda.",
      icon: <Truck size={32} className="text-red-500 dark:text-red-400" />,
      bgColor: "bg-red-100 dark:bg-red-950/40"
    }
  ];

  return (
    <section id="cara-kerja" className="py-20 md:py-24 px-6 bg-white dark:bg-gray-950 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            Cara <span className="text-green-600 dark:text-green-400">Belanja</span>
          </h2>
          <p className="text-base md:text-lg text-gray-500 dark:text-gray-400">
            Hanya butuh 4 langkah mudah untuk mendatangkan buah segar berkualitas tinggi langsung ke meja makan keluarga Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-1 bg-gray-50 dark:bg-gray-900 rounded-full -z-10"></div>
          {steps.map((step) => (
            <div
              key={step.id}
              className="relative bg-white dark:bg-gray-900 p-8 rounded-4xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-green-100 dark:hover:border-green-500/20 hover:-translate-y-2 transition-all duration-300 group"
            >
              <div className="absolute -top-4 -right-4 w-10 h-10 bg-gray-900 dark:bg-gray-800 text-white rounded-full flex items-center justify-center font-black text-lg shadow-md group-hover:bg-green-600 dark:group-hover:bg-green-500 transition-colors">
                {step.id}
              </div>

              <div className={`${step.bgColor} w-20 h-20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {step.icon}
              </div>

              <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">{step.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CaraKerja;
