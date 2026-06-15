/**
 * ==============================================================================
 * MODUL: VisiMisi.jsx
 * KELOMPOK: Komponen UI
 * DESKRIPSI: Komponen antarmuka pengguna untuk VisiMisi FreshMarket.
 * ==============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React from 'react';
import { Target, Sprout, HeartHandshake, ShieldCheck, Award, Zap, Leaf } from 'lucide-react';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function VisiMisi
const VisiMisi = () => {
  return (
    <section id="visi-misi" className="relative bg-slate-50/40 dark:bg-gray-950/40 py-24 md:py-32 px-6 font-sans overflow-hidden border-t border-b border-slate-100 dark:border-gray-900/60 transition-colors duration-300">
      
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-50/40 dark:from-green-950/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-50/30 dark:bg-green-950/20 rounded-3xl blur-3xl pointer-events-none -mr-48 -mb-48"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
            Tujuan dan Komitmen Kami
          </h1>
          <p className="text-base md:text-lg text-slate-550 dark:text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
            Kami berkomitmen membangun rantai pasok pangan yang berkelanjutan, mensejahterakan petani lokal, dan menjamin kesegaran terbaik sampai di meja makan Anda.
          </p>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
          
          
          <div className="lg:col-span-5 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-green-500/20 transition-all duration-500 flex flex-col justify-between relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-green-500/5 dark:from-green-500/10 via-teal-500/5 dark:via-teal-500/10 to-transparent rounded-3xl pointer-events-none -z-10"></div>
            
            <div>
              
              <div className="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/50 ring-8 ring-green-50/50 dark:ring-green-950/40 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-105 transition-transform duration-300 shrink-0 select-none">
                <Target size={28} strokeWidth={1.75} />
              </div>

              
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-5 tracking-tight">Visi Kami</h3>
              
              <div className="relative">
                <p className="text-base md:text-lg text-slate-650 dark:text-slate-200 leading-relaxed italic font-semibold border-l-4 border-green-500 pl-4 py-2 bg-gradient-to-r from-green-50/30 dark:from-green-950/20 to-transparent rounded-r-xl">
                  "Menjadi platform e-commerce buah segar modern pilihan nomor satu yang memberikan dampak positif bagi kesehatan masyarakat dan lingkungan sekitar."
                </p>
              </div>
            </div>
            
            
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-gray-800">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest block mb-4">Pencapaian & Dampak</span>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-gray-950 border border-slate-100/80 dark:border-gray-800/80 rounded-xl p-3 text-center">
                  <p className="text-xl md:text-2xl font-black text-green-600 dark:text-green-400">500+</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider leading-tight">Mitra Petani</p>
                </div>
                <div className="bg-slate-50 dark:bg-gray-950 border border-slate-100/80 dark:border-gray-800/80 rounded-xl p-3 text-center">
                  <p className="text-xl md:text-2xl font-black text-green-600 dark:text-green-400">100%</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider leading-tight">Kualitas Premium</p>
                </div>
                <div className="bg-slate-50 dark:bg-gray-950 border border-slate-100/80 dark:border-gray-800/80 rounded-xl p-3 text-center">
                  <p className="text-xl md:text-2xl font-black text-green-600 dark:text-green-400">24 Jam</p>
                  <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider leading-tight">Jaminan Segar</p>
                </div>
              </div>
            </div>
          </div>

          
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 p-8 md:p-12 rounded-3xl border border-slate-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:border-green-500/20 transition-all duration-500 flex flex-col relative overflow-hidden group">
            
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-blue-500/5 dark:from-blue-500/10 via-indigo-500/5 dark:via-indigo-500/10 to-transparent rounded-3xl pointer-events-none -z-10"></div>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/50 ring-8 ring-green-50/50 dark:ring-green-950/40 w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shrink-0 select-none">
                <Award size={28} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Misi Kami</h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">Langkah Nyata Setiap Hari</p>
              </div>
            </div>
            
            <div className="space-y-6 flex-1">
              {[
                { 
                  icon: Sprout, 
                  colorClass: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/50',
                  title: 'Akses Pangan Berkualitas Tinggi',
                  desc: 'Memberikan akses yang mudah, cepat, dan terjangkau ke produk buah-buahan segar berkualitas tinggi untuk seluruh keluarga.',
                  detail: 'Dipilih langsung oleh ahli QC kami sebelum pengemasan.'
                },
                { 
                  icon: HeartHandshake, 
                  colorClass: 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-100 dark:border-green-900/50',
                  title: 'Menyejahterakan Komunitas Petani',
                  desc: 'Mendukung komunitas petani lokal dengan menerapkan rantai pasokan yang adil, transparan, dan saling menguntungkan.',
                  detail: 'Memotong jalur distribusi panjang untuk keuntungan petani lebih besar.'
                },
                { 
                  icon: ShieldCheck, 
                  colorClass: 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-200 border-green-100 dark:border-green-900/50',
                  title: 'Higienitas & Keamanan Terjamin',
                  desc: 'Menjamin standar kebersihan, higienitas, dan keamanan tingkat tinggi pada setiap paket produk yang kami kirimkan ke rumah Anda.',
                  detail: 'Pengepakan steril dengan material food-grade.'
                }
              ].map((misi, index) => {
                const Icon = misi.icon;
                return (
                  <div 
                    key={index}
                    className="bg-slate-50/40 dark:bg-gray-950/45 border border-slate-100/80 dark:border-gray-800/80 rounded-2xl p-5 md:p-6 flex gap-4 md:gap-5 items-start transition-all duration-300 hover:border-green-500/25 dark:hover:border-green-500/40 hover:bg-white dark:hover:bg-gray-900 hover:shadow-md group/item"
                  >
                    <div className={`p-3 rounded-xl border shrink-0 mt-0.5 transition-transform duration-300 group-hover/item:scale-105 select-none ${misi.colorClass}`}>
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-bold text-slate-800 dark:text-white tracking-wide leading-snug">{misi.title}</h4>
                      <p className="text-xs text-slate-550 dark:text-slate-300 leading-relaxed font-medium">{misi.desc}</p>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-green-655 dark:text-green-400 bg-green-50/50 dark:bg-green-950/50 border border-green-100/50 dark:border-green-900/50 px-2.5 py-0.5 rounded-lg w-fit mt-1 select-none">
                        <Zap size={10} className="fill-green-600" />
                        {misi.detail}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VisiMisi;
