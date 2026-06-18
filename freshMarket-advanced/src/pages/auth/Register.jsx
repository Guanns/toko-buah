/* 1 */

/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Leaf, ArrowLeft, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function Register
const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Password dan Konfirmasi Password tidak cocok!");
      return;
    }
    await register(name, email, password);
  };

  return (
    <div className="min-h-screen flex bg-slate-50/50 font-sans">
      
      
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 overflow-hidden flex-col justify-between p-12 text-white">
        
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        
        <div className="relative flex items-center gap-2.5 z-10">
          <div className="bg-emerald-500/15 p-2 rounded-xl text-emerald-300 backdrop-blur-sm border border-emerald-500/10 shrink-0">
            <Leaf size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Fresh<span className="text-emerald-400">market</span>
          </span>
        </div>

        
        <div className="relative my-auto max-w-md z-10 space-y-6">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-emerald-50">
            Mulai hidup sehat bersama keluarga hari ini.
          </h1>
          <p className="text-emerald-200/80 text-sm leading-relaxed font-medium">
            Bergabunglah dengan Freshmarket untuk mendapatkan diskon khusus member, kupon belanja mingguan, dan jaminan buah segar berkualitas tinggi.
          </p>
          
          
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-emerald-300">10K+</p>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-200/60 mt-1">Pelanggan Aktif</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold text-emerald-300">50+</p>
              <p className="text-[10px] uppercase font-semibold tracking-wider text-emerald-200/60 mt-1">Petani Terhubung</p>
            </div>
          </div>
        </div>

        
        <div className="relative text-xs text-emerald-300/40 font-medium z-10">
          &copy; {new Date().getFullYear()} Freshmarket Indonesia. Teman Sehatmu.
        </div>
      </div>

      
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative pt-24 pb-12 px-6 sm:px-16 lg:px-20 xl:px-28 bg-white overflow-y-auto">
        
        
        <div className="absolute top-8 left-6 sm:left-16">
          <Link to="/" className="group flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-600 transition-colors">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Beranda
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto">
          
          
          <div className="mb-8 text-left">
            <div className="lg:hidden inline-flex items-center justify-center bg-emerald-50 p-2.5 rounded-2xl mb-6 text-emerald-600">
              <Leaf size={24} />
            </div>
            <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Daftar Akun Baru</h2>
            <p className="mt-1.5 text-slate-400 font-medium text-sm leading-relaxed">
              Lengkapi informasi di bawah ini untuk bergabung menjadi member sehat Freshmarket.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600 block">Nama Lengkap</label>
              <div className="relative flex items-center">
                <User size={18} className="absolute left-4 text-slate-400" />
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Budi Santoso"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 text-sm font-medium placeholder-slate-400"
                />
              </div>
            </div>

            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600 block">Alamat Email</label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="nama@email.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 text-sm font-medium placeholder-slate-400"
                />
              </div>
            </div>

            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600 block">Kata Sandi</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-slate-400" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Minimal 6 karakter" 
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 text-sm font-medium placeholder-slate-400"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600 block">Konfirmasi Kata Sandi</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-slate-400" />
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  required 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  placeholder="Ulangi kata sandi" 
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-slate-700 text-sm font-medium placeholder-slate-400"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            
            <button 
              type="submit" 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm mt-4"
            >
              Daftar Akun
            </button>
          </form>

          
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400 font-medium">
              Sudah memiliki akun? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Masuk sekarang</Link>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Register;
