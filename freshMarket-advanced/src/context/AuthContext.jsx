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

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);

        if (data.user.role === 'admin' || data.user.role === 'kasir') {
          navigate('/admin');
        } else {
          navigate('/');
        }
      } else {
        alert(`Gagal: ${data.message}`);
      }
    } catch (error) {
      alert('Gagal terhubung ke server backend.');
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
        alert('Pendaftaran Berhasil! Silakan Login menggunakan akun baru Anda.');
        navigate('/login');
        return true; 
      } else {
        alert(`Gagal Daftar : ${data.message}`);
        return false;
      }
    } catch (error) {
      alert('Gagal terhubung ke server backend.');
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
