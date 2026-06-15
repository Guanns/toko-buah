/**
 * ==============================================================================
 * MODUL: OrderContext.jsx
 * KELOMPOK: Context Provider (Manajemen State)
 * DESKRIPSI: Mengelola state global aplikasi FreshMarket untuk OrderContext.
 * ==============================================================================
 */

/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { createContext, useState, useContext } from 'react';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]); 
  const addOrder = (items, total) => {
    const newOrder = {
      id: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      total: total,
      status: 'DIPROSES',
      items: items.map(item => `${item.name} (${item.quantity}${item.unit})`)
    };
    setOrders([newOrder, ...orders]);
  };

  return (
    <OrderContext.Provider value={{ orders, addOrder }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
