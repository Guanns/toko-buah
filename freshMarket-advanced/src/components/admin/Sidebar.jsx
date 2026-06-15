/**
 * ==============================================================================
 * MODUL: Sidebar.jsx
 * KELOMPOK: Komponen UI
 * DESKRIPSI: Komponen antarmuka pengguna untuk Sidebar FreshMarket.
 * ==============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Tag, 
  BarChart3, 
  LogOut, 
  Pin, 
  PinOff,
  Leaf,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function Sidebar
const Sidebar = () => {
  const [isPinned, setIsPinned] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const isExpanded = isPinned || isHovered;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const allMenuItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Dashboard', path: '/admin' },
    { id: 'products', icon: <Package size={24} />, label: 'Kelola Produk', path: '/admin/products' },
    { id: 'orders', icon: <ShoppingCart size={24} />, label: 'Pesanan Masuk', path: '/admin/orders' },
    { id: 'promo', icon: <Tag size={24} />, label: 'Promo & Voucher', path: '/admin/promo' },
    { id: 'staff', icon: <Users size={24} />, label: 'Kelola Kasir', path: '/admin/staff' },
    { id: 'reports', icon: <BarChart3 size={24} />, label: 'Laporan', path: '/admin/reports' },
  ];

  
  const filteredMenuItems = allMenuItems.filter(item => {
    if (!user) return false;
    
    if (user.role === 'kasir') {
      
      return ['dashboard', 'orders', 'reports'].includes(item.id);
    }
    
    if (user.role === 'admin') {
      
      return ['dashboard', 'products', 'promo', 'staff', 'reports'].includes(item.id);
    }
    
    return false;
  });

  return (
    <aside 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`h-screen sticky top-0 bg-[#0f172a] border-r border-slate-800/80 flex flex-col transition-all duration-300 ease-in-out z-50 ${
        isExpanded ? 'w-72' : 'w-24'
      }`}
    >
      
      
      <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/80">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className="bg-emerald-500/10 p-2 rounded-xl text-emerald-400 shrink-0">
            <Leaf size={24} />
          </div>
          <div className={`transition-opacity duration-300 whitespace-nowrap ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
            <span className="text-xl font-bold tracking-tight">
              <span className="text-red-500">Fresh</span><span className="text-green-500">market</span>
            </span>
          </div>
        </div>

        
        {isExpanded && (
          <button 
            onClick={() => setIsPinned(!isPinned)}
            className="text-slate-400 hover:text-emerald-400 hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
            title={isPinned ? "Lepas Pin" : "Pin Sidebar"}
          >
            {isPinned ? <Pin size={18} className="fill-emerald-500/20 text-emerald-400" /> : <PinOff size={18} />}
          </button>
        )}
      </div>
      
      
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {filteredMenuItems.map((item) => (
          <NavLink 
            key={item.label}
            to={item.path}
            end={item.path === '/admin'}
            className={({isActive}) => 
              `flex items-center rounded-xl transition-all duration-200 ${
                isExpanded ? 'px-4 py-3.5 gap-4' : 'justify-center p-3.5'
              } ${
                isActive 
                ? 'bg-emerald-500/10 text-emerald-400 font-semibold border-l-4 border-emerald-500' 
                : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100 font-medium'
              }`
            }
          >
            <div className="shrink-0">
              {item.icon}
            </div>
            
            <span className={`text-base whitespace-nowrap transition-all duration-300 ${
              isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 w-0 hidden'
            }`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      
      <div className="p-4 border-t border-slate-800/80">
        <div className={`flex items-center gap-4 ${isExpanded ? 'px-2 mb-6' : 'justify-center mb-6'}`}>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center text-base font-semibold shrink-0 capitalize">
            {user?.name?.charAt(0) || 'M'}
          </div>
          
          {isExpanded && (
            <div className="flex flex-col overflow-hidden whitespace-nowrap">
              <span className="text-sm font-semibold text-slate-200 truncate capitalize">{user?.name || 'Staff'}</span>
              <span className="text-xs font-medium text-emerald-500 uppercase tracking-wider mt-0.5">{user?.role}</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleLogout}
          className={`flex items-center text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors rounded-xl font-semibold ${
            isExpanded ? 'w-full px-4 py-3.5 gap-3 justify-start' : 'p-3.5 justify-center'
          }`}
          title="Keluar"
        >
          <LogOut size={20} className="shrink-0" />
          {isExpanded && <span className="text-sm whitespace-nowrap">Keluar Akun</span>}
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;
