/**
 * ==============================================================================
 * MODUL: Hero.jsx
 * KELOMPOK: Komponen UI
 * DESKRIPSI: Komponen antarmuka pengguna untuk Hero FreshMarket.
 * ==============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { ShoppingBag, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function Hero
const Hero = () => {
  const slides = [
    {
      id: 1,
      url: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=1000&auto=format&fit=crop",
      title: "Buah Segar Pilihan",
      desc: "Kualitas premium dari petani lokal"
    },
    {
      id: 2,
      url: "https://images.unsplash.com/photo-1571575173700-afb9492e6a50?q=80&w=600&auto=format&fit=crop",
      title: "Melon Segar",
      desc: "Dipetik langsung saat matang sempurna"
    },
    {
      id: 3,
      url: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?q=80&w=1000&auto=format&fit=crop",
      title: "Nanas Madu",
      desc: "Segar dan kaya akan vitamin"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [currentIndex, slides.length]);

  return (
    <section id="beranda" className="relative bg-white dark:bg-gray-950 pt-10 md:pt-24 pb-20 md:pb-32 px-6 overflow-hidden transition-colors duration-300">
      <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-green-50/70 dark:bg-green-950/20 rounded-b-[50px] md:rounded-l-full -z-10 transform md:translate-x-1/4"></div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
        
        
        <div className="w-full md:w-1/2 order-1 md:order-2">
          <div className="relative h-[300px] md:h-[500px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl group border-4 border-white">
            
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentIndex ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={slide.url}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
                  <h3 className="text-xl font-bold">{slide.title}</h3>
                  <p className="text-sm text-gray-200">{slide.desc}</p>
                </div>
              </div>
            ))}

            <button 
              onClick={prevSlide}
              className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft size={20} className="text-green-600" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight size={20} className="text-green-600" />
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        
        <div className="w-full md:w-1/2 space-y-6 md:space-y-8 text-center md:text-left order-2 md:order-1">
          <h1 className="text-4xl md:text-7xl font-extrabold leading-tight text-gray-950 dark:text-white">
            Akses Mudah<br />
            Buah <span className="text-green-600 dark:text-green-400">Lokal Indonesia</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed max-w-xl mx-auto md:mx-0">
            FreshMarket menghubungkan dapur Anda langsung dengan hasil panen buah terbaik dari petani di Bontang. Kualitas terjamin, diantar langsung ke rumah.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            <Link
              to="/products" 
              className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg active:scale-95 cursor-pointer"
            >
              Belanja Sekarang <ShoppingBag size={20} />
            </Link>
            <a 
              href="#cara-kerja" 
              className="flex items-center justify-center gap-2 group text-green-700 dark:text-green-400 font-semibold px-6 py-4 rounded-full hover:bg-green-50 dark:hover:bg-green-950/30 transition-all cursor-pointer"
            >
              Cara Kerja <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
