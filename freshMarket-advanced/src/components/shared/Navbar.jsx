
/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, ShoppingCart, LogOut, PackageSearch, LayoutDashboard, Home, ShoppingBag, Ticket, Settings, ChevronDown, Sun, Moon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../layouts/UserLayout';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    setIsProfileOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-100 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-md shadow-sm py-3 border-b border-gray-100/10 dark:border-gray-900/50'
        : 'bg-white dark:bg-gray-950 py-4 border-b border-gray-100 dark:border-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-6 flex justify-between items-center">

        <Link to="/" className="flex flex-col group shrink-0" onClick={() => setIsOpen(false)}>
          <div className="text-2xl font-black leading-none flex gap-1 tracking-tight">
            <span className="text-red-500">Fresh</span>
            <span className="text-green-600">Market</span>
          </div>
          <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 tracking-[0.2em] mt-1">
            TEMAN SEHATMU
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-4 xl:gap-8">

          <div className="flex gap-5 xl:gap-7 font-semibold text-sm text-gray-500 dark:text-gray-400">
            <Link to="/" className={`transition-colors hover:text-green-600 dark:hover:text-green-400 ${isActive('/') ? 'text-green-600 dark:text-green-400' : ''}`}>Beranda</Link>
            <Link to="/products" className={`transition-colors hover:text-green-600 dark:hover:text-green-400 ${isActive('/products') ? 'text-green-600 dark:text-green-400' : ''}`}>Katalog</Link>
            <Link to="/tracking" className={`transition-colors hover:text-green-600 dark:hover:text-green-400 ${isActive('/tracking') ? 'text-green-600 dark:text-green-400' : ''}`}>Pesanan Saya</Link>
            <Link to="/promo" className={`transition-colors hover:text-green-600 dark:hover:text-green-400 ${isActive('/promo') ? 'text-green-600 dark:text-green-400' : ''}`}>Voucher</Link>
          </div>

          <div className="flex items-center gap-4 xl:gap-5 border-l pl-5 xl:pl-8 border-gray-200 dark:border-gray-800">

            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-green-50 dark:hover:bg-green-950/40 rounded-full transition-all text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
              title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? <Sun size={22} className="text-amber-500 animate-pulse" /> : <Moon size={22} className="text-indigo-500" />}
            </button>

            <Link to="/cart" className="relative group p-2 hover:bg-green-50 dark:hover:bg-green-950/40 rounded-full transition-all">
              <ShoppingCart size={22} className="text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-gray-950 shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="flex items-center gap-2 xl:gap-3">

                {(user.role === 'admin' || user.role === 'kasir') && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-2 rounded-lg font-bold text-[11px] transition-all shadow-sm active:scale-95 mr-1"
                  >
                    <LayoutDashboard size={14} />
                    <span className="hidden xl:inline">
                      {user.role === 'kasir' ? 'Panel Kasir' : 'Panel Admin'}
                    </span>
                  </Link>
                )}

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className={`flex items-center gap-2.5 border pl-1.5 pr-3 py-1.5 rounded-full transition-all focus:outline-none active:scale-95 ${
                      isProfileOpen
                        ? 'bg-white dark:bg-gray-900 border-green-200 dark:border-green-800 shadow-sm ring-2 ring-green-500/10'
                        : 'bg-gray-50 dark:bg-gray-900 border-gray-200/60 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                      {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate max-w-25 xl:max-w-30 capitalize">
                      {user.name}
                    </span>
                    <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <div className={`absolute right-0 mt-3 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out origin-top-right ${isProfileOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>
                    <div className="p-2 space-y-1">
                      <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="w-full flex items-center justify-start gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-950/40 hover:text-green-600 dark:hover:text-green-400 rounded-xl transition-all whitespace-nowrap text-left">
                        <Settings size={16} className="shrink-0" /> Pengaturan Akun
                      </Link>
                      <button onClick={handleLogout} className="w-full flex items-center justify-start gap-3 px-3 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400 rounded-xl transition-all whitespace-nowrap text-left">
                        <LogOut size={16} className="shrink-0" /> Keluar Akun
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <Link to="/login" className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-green-600/20 active:scale-95">
                Masuk
              </Link>
            )}
          </div>
        </div>

        <div className="flex lg:hidden items-center gap-3">

          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full text-gray-700 dark:text-gray-300 cursor-pointer"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun size={22} className="text-amber-500" /> : <Moon size={22} className="text-indigo-500" />}
          </button>

          <Link to="/cart" className="relative p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-full">
            <ShoppingCart size={24} className="text-gray-700 dark:text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white dark:border-gray-950">
                {cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors">
            {isOpen ? <X size={28} className="text-gray-900 dark:text-white" /> : <Menu size={28} className="text-gray-900 dark:text-white" />}
          </button>
        </div>
      </div>

      <div className={`lg:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-950 border-b dark:border-gray-900 shadow-2xl overflow-y-auto transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[85vh] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-5 flex flex-col gap-1.5 font-semibold text-sm">

          {user && (
            <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100/60 dark:border-gray-800">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 flex items-center justify-center text-lg font-black uppercase shrink-0">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="flex flex-col justify-center overflow-hidden">
                <p className="text-base font-black text-gray-900 dark:text-white capitalize truncate">{user.name}</p>
              </div>
            </div>
          )}

          <Link to="/" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${isActive('/') ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
             <Home size={20} /> Beranda
          </Link>
          <Link to="/products" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${isActive('/products') ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
             <ShoppingBag size={20} /> Katalog Produk
          </Link>
          <Link to="/tracking" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${isActive('/tracking') ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
             <PackageSearch size={20} /> Pesanan Saya
          </Link>
          <Link to="/promo" onClick={() => setIsOpen(false)} className={`flex items-center gap-4 p-3.5 rounded-xl transition-colors ${isActive('/promo') ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'}`}>
             <Ticket size={20} /> Voucher & Promo
          </Link>

          <div className="mt-2 pt-4 border-t border-gray-100 dark:border-gray-900 flex flex-col gap-2">
            {user ? (
              <>
                <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-start gap-4 p-3.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-colors text-left font-semibold">
                  <Settings size={20} className="shrink-0" /> Pengaturan Akun
                </Link>

                {(user.role === 'admin' || user.role === 'kasir') && (
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 p-3.5 mt-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all shadow-sm font-bold text-sm">
                    <LayoutDashboard size={18} />
                    {user.role === 'kasir' ? 'Panel Kasir' : 'Panel Admin'}
                  </Link>
                )}

                <button onClick={handleLogout} className="flex items-center justify-center gap-2 p-3.5 mt-2 text-red-500 hover:text-red-650 transition-colors font-bold text-sm">
                  <LogOut size={18} className="shrink-0" /> Keluar Akun
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setIsOpen(false)} className="flex justify-center p-3.5 bg-green-600 text-white rounded-xl shadow-md mt-2 text-sm font-bold">
                Masuk ke Akun
              </Link>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
