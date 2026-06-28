
/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/shared/Navbar';

/* -------------------------------------------------------------------------- */
/*                          KONSTANTA & UTILITY LOKAL                         */
/* -------------------------------------------------------------------------- */
const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}
});

export const useTheme = () => useContext(ThemeContext);

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
export const UserLayout = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === 'dark' ? 'dark bg-gray-950 text-white min-h-screen transition-colors duration-300' : 'bg-white text-slate-700 min-h-screen transition-colors duration-300'}>
        <Navbar />
        <Outlet />
      </div>
    </ThemeContext.Provider>
  );
};

export default UserLayout;
