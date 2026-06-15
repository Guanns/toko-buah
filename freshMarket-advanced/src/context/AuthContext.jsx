/**
 * ==============================================================================
 * MODUL: AuthContext.jsx
 * KELOMPOK: Context Provider (Manajemen State)
 * DESKRIPSI: Mengelola state global aplikasi FreshMarket untuk AuthContext.
 * ==============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './ToastContext';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || null);
  const navigate = useNavigate();
  const { toast } = useToast();

  
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        const existingUser = JSON.parse(localStorage.getItem('user')) || {};
        const mergedUser = {
          ...data.user,
          address: data.user.address || existingUser.address || ''
        };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
        localStorage.setItem('token', data.token);
        toast.success(`Selamat datang kembali, ${data.user.name}!`);

        if (data.user.role === 'admin' || data.user.role === 'kasir') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        toast.error(`Gagal: ${data.message}`);
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server backend.');
    }
  };

  
  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      const data = await response.json();

      if (response.ok) {
        toast.success('Pendaftaran Berhasil! Silakan Login menggunakan akun baru Anda.');
        navigate('/login');
        return true; 
      } else {
        toast.error(`Gagal Daftar: ${data.message}`);
        return false;
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server backend.');
      return false;
    }
  };

  
  const updateUser = (updatedFields) => {
    const merged = { ...user, ...updatedFields };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
