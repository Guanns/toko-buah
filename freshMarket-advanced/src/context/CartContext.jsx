
/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { createContext, useState, useContext } from 'react';
import { useToast } from './ToastContext';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { toast } = useToast();

  const addToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevItems, { ...product, quantity }];
    });
    toast.success(`Berhasil menambahkan ${product.name} ke keranjang!`);
  };

  const removeFromCart = (id) => {
    const itemToRemove = cartItems.find(item => item.id === id);
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    if (itemToRemove) {
      toast.info(`${itemToRemove.name} dihapus dari keranjang.`);
    }
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCartItems(prevItems => prevItems.map(item => item.id === id ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => {
    const unitPrice = Number(item.priceNumber ?? item.price ?? 0);
    return total + (unitPrice * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
