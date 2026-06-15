/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */

import React, { useState, Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrderProvider } from './context/OrderContext'; 

import Navbar from './components/shared/Navbar';
import Sidebar from './components/admin/Sidebar';
import UserLayout from './layouts/UserLayout';
import { ShieldAlert } from 'lucide-react'; 

/* -------------------------------------------------------------------------- */
/*                          UTILITY                                           */
/* -------------------------------------------------------------------------- */
const Home = lazy(() => import('./pages/user/Home'));
const Login = lazy(() => import('./pages/auth/Login'));
const Products = lazy(() => import('./components/Products'));
const Cart = lazy(() => import('./pages/user/Cart'));
const Tracking = lazy(() => import('./pages/user/Tracking'));
const Register = lazy(() => import('./pages/auth/Register'));
const Promo = lazy(() => import('./pages/user/Promo')); 
const Profile = lazy(() => import('./pages/user/Profile'));

const DashboardAdmin = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminPromo = lazy(() => import('./pages/admin/AdminPromo'));
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff')); 
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));

/* -------------------------------------------------------------------------- */
// function LoadingScreen
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white font-sans">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      <p className="text-sm font-medium text-gray-500 animate-pulse tracking-wide">Memuat...</p>
    </div>
  </div>
);

/* -------------------------------------------------------------------------- */
/*                      PELINDUNG PANEL ADMIN (DESKTOP)                       */
/* -------------------------------------------------------------------------- */
/**
 * Rationale: Membatasi akses panel manajemen admin hanya untuk perangkat desktop
 * (lebar layar >= 1024px) guna menjamin fungsionalitas dan kenyamanan operasional.
 */
// function AdminDesktopGuard
const AdminDesktopGuard = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="bg-red-50 p-6 rounded-full mb-6 text-red-500 animate-bounce">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">Akses Dibatasin</h2>
        <p className="text-gray-500 text-sm max-w-sm mb-8 leading-relaxed">
          Panel Manajemen FreshMarket <b>hanya dapat diakses melalui perangkat Desktop atau Laptop</b>.
        </p>
        <a href="/" className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-xl transition-all shadow-sm active:scale-95">
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return children;
};

/* -------------------------------------------------------------------------- */
/*                      PELINDUNG SESI ADMIN (AUTH)                           */
/* -------------------------------------------------------------------------- */
// function AdminAuthGuard
const AdminAuthGuard = ({ children }) => {
  const { user } = useAuth();

  if (!user || (user.role !== 'admin' && user.role !== 'kasir')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

/* -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function App
const App = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <AuthProvider>
      <CartProvider>
        <OrderProvider>
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              
              
              <Route element={<UserLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={
                  <div className="pt-20">
                    <Products searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                  </div>
                } />
                <Route path="/cart" element={<Cart />} />
                <Route path="/tracking" element={<Tracking />} />
                <Route path="/promo" element={<Promo />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              
              
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              
              <Route path="/admin/*" element={
                <AdminDesktopGuard>
                  <AdminAuthGuard>
                    <div className="flex bg-gray-50 min-h-screen font-sans">
                      <Sidebar />
                      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
                        <Routes>
                          <Route path="/" element={<DashboardAdmin />} />
                          <Route path="/products" element={<AdminProducts />} />
                          <Route path="/orders" element={<AdminOrders />} />
                          <Route path="/promo" element={<AdminPromo />} />
                          <Route path="/staff" element={<AdminStaff />} /> 
                          <Route path="/reports" element={<AdminReports />} />
                        </Routes>
                      </main>
                    </div>
                  </AdminAuthGuard>
                </AdminDesktopGuard>
              } />

              
              <Route path="*" element={
                <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-white font-sans">
                  <h1 className="text-9xl font-black text-gray-50 absolute -z-10 select-none">404</h1>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h2>
                  <a href="/" className="mt-8 bg-gray-900 text-white px-8 py-3 rounded-xl font-medium shadow-sm transition-all active:scale-95">Kembali ke Beranda</a>
                </div>
              } />

            </Routes>
          </Suspense>
        </OrderProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
