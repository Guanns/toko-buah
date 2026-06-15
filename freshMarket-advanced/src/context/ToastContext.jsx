import React, { createContext, useContext } from 'react';
import { toast as hotToast, Toaster } from 'react-hot-toast';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const toast = {
    success: (msg, options) => hotToast.success(msg, {
      duration: 3000,
      style: {
        background: '#ecfdf5',
        color: '#065f46',
        border: '1px solid #a7f3d0',
        borderRadius: '12px',
        fontWeight: '500',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)'
      },
      ...options
    }),
    error: (msg, options) => hotToast.error(msg, {
      duration: 4000,
      style: {
        background: '#fff5f5',
        color: '#9b2c2c',
        border: '1px solid #feb2b2',
        borderRadius: '12px',
        fontWeight: '500',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
      },
      ...options
    }),
    warning: (msg, options) => hotToast(msg, {
      icon: '⚠️',
      duration: 3000,
      style: {
        background: '#fffbeb',
        color: '#92400e',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        fontWeight: '500',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)'
      },
      ...options
    }),
    info: (msg, options) => hotToast(msg, {
      icon: 'ℹ️',
      duration: 3000,
      style: {
        background: '#eff6ff',
        color: '#1e40af',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        fontWeight: '500',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.08)'
      },
      ...options
    }),
    promise: (promise, msgs, options) => hotToast.promise(promise, msgs, {
      style: {
        background: '#ffffff',
        color: '#1f2937',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        fontWeight: '500',
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
      },
      ...options
    })
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          className: 'font-sans',
        }}
      />
      {children}
    </ToastContext.Provider>
  );
};
