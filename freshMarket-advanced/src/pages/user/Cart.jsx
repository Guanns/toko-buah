/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, Ticket, X, ShoppingBag, ArrowRight, CheckCircle2, CreditCard, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */
// function Cart
const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [voucherCode, setVoucherCode] = useState('');
  const [activeVouchers, setActiveVouchers] = useState([]);
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris'); 
  const [invoiceNumber, setInvoiceNumber] = useState('');
  
  const [invoiceItems, setInvoiceItems] = useState([]);
  const [invoiceTotals, setInvoiceTotals] = useState({ subtotal: 0, discount: 0, final: 0, voucher: null });
  
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  
  useEffect(() => {
    if (user?.address) {
      setShippingAddress(user.address);
    }
  }, [user]);

  
  const handleOpenPayment = () => {
    const code = `INV-${Date.now().toString().substring(5)}`;
    setInvoiceNumber(code);
    
    setInvoiceItems([...cartItems]);
    setInvoiceTotals({ subtotal: safeCartTotal, discount: discountAmount, final: finalTotal, voucher: appliedVoucher });
    setShowPaymentModal(true);
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/vouchers/active')
      .then(res => res.json())
      .then(data => setActiveVouchers(Array.isArray(data) ? data : []))
      .catch(err => console.error("Gagal mengambil voucher:", err));
  }, []);

  const safeCartTotal = Number(cartTotal) || 0;

  const discountAmount = useMemo(() => {
    if (!appliedVoucher) return 0;
    if (appliedVoucher.discount_type === 'PERCENT') {
      return safeCartTotal * (Number(appliedVoucher.discount_value) / 100);
    }
    return Number(appliedVoucher.discount_value) || 0;
  }, [appliedVoucher, safeCartTotal]);

  const finalTotal = useMemo(() => {
    return Math.max(0, safeCartTotal - discountAmount);
  }, [safeCartTotal, discountAmount]);

  const handleApplyVoucher = async () => {
    if (!voucherCode) return;
    try {
      const res = await fetch('http://localhost:5000/api/vouchers/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: voucherCode.toUpperCase(), cart_total: safeCartTotal })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAppliedVoucher(data.voucher);
        toast.success('Voucher berhasil digunakan!');
      } else {
        toast.error(data.message || 'Voucher tidak valid');
        handleRemoveVoucher();
      }
    } catch (err) {
      toast.error('Terjadi kesalahan validasi voucher.');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
  };

  const handlePaymentSuccess = async () => {
    if (!user) return toast.warning("Silakan login terlebih dahulu!");
    if (!shippingAddress.trim()) return toast.warning("Alamat pengiriman wajib diisi untuk proses kurir!");
    if (!phoneNumber.trim()) return toast.warning("Nomor telepon kurir wajib diisi!");
    
    
    const itemsWithShipping = cartItems.map(item => ({
      ...item,
      shipping_address: shippingAddress,
      phone_number: phoneNumber
    }));

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          user_id: user.id,
          total_amount: finalTotal,
          items: itemsWithShipping, 
          voucher_code: appliedVoucher ? appliedVoucher.code : null,
          payment_method: paymentMethod
        })
      });

      if (response.ok) {
        setPaymentSuccess(true);
        clearCart();
        toast.success("Pesanan berhasil diproses!");
        
      } else {
        toast.error("Gagal memproses pesanan.");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan.");
    }
  };

  
  
  
  const handleDownloadInvoice = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a5' });
    const green    = [134, 197, 145];  
    const darkText = [30, 50, 40];
    const lightGray = [245, 247, 246];
    const ADMIN_FEE = 2000;
    const totalBayar = invoiceTotals.final + ADMIN_FEE;
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 14;

    
    doc.setFillColor(...green);
    doc.roundedRect(0, 0, pageW, 38, 0, 0, 'F');

    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.text('Fresh', margin, 16);
    const freshW = doc.getTextWidth('Fresh');
    doc.setTextColor(20, 83, 45);
    doc.text('Market', margin + freshW, 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(255, 255, 255);
    doc.text('TEMAN SEHATMU', margin, 22);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE PEMBELIAN', pageW - margin, 13, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(invoiceNumber, pageW - margin, 19, { align: 'right' });
    const now = new Date();
    doc.text(now.toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }), pageW - margin, 24.5, { align: 'right' });

 /* xendit */
    const methodLabel = paymentMethod === 'qris' ? 'QRIS Instan' : paymentMethod === 'bca' ? 'BCA Virtual Account' : 'Mandiri Virtual Account';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(20, 83, 45);
    doc.text(`Metode: ${methodLabel}`, pageW - margin, 30, { align: 'right' });

    
    let y = 45;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);

    
    y += 5;
    doc.setFillColor(...lightGray);
    doc.rect(margin, y - 3.5, pageW - margin * 2, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...darkText);
    doc.text('Produk', margin + 2, y + 0.5);
    doc.text('Qty', pageW - margin - 34, y + 0.5, { align: 'right' });
    doc.text('Harga Satuan', pageW - margin - 16, y + 0.5, { align: 'right' });
    doc.text('Subtotal', pageW - margin, y + 0.5, { align: 'right' });

    
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    (invoiceItems.length > 0 ? invoiceItems : []).forEach((item, i) => {
      const price   = Number(item.priceNumber || item.price || 0);
      const qty     = Number(item.quantity || 1);
      const subtotal = price * qty;
      if (i % 2 === 0) {
        doc.setFillColor(250, 253, 251);
        doc.rect(margin, y - 3.5, pageW - margin * 2, 6.5, 'F');
      }
      doc.setTextColor(...darkText);
      const nameTrunc = item.name && item.name.length > 28 ? item.name.substring(0, 26) + '..' : item.name || '-';
      doc.text(nameTrunc, margin + 2, y);
      doc.text(`${qty}x`, pageW - margin - 34, y, { align: 'right' });
      doc.text(`Rp ${price.toLocaleString('id-ID')}`, pageW - margin - 16, y, { align: 'right' });
      doc.text(`Rp ${subtotal.toLocaleString('id-ID')}`, pageW - margin, y, { align: 'right' });
      y += 7;
    });

    
    y += 2;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.2);
    doc.line(margin, y, pageW - margin, y);
    y += 5;

    const addRow = (label, value, bold = false, color = darkText) => {
      doc.setFont('helvetica', bold ? 'bold' : 'normal');
      doc.setFontSize(bold ? 8 : 7.5);
      doc.setTextColor(...color);
      doc.text(label, margin + 2, y);
      doc.text(value, pageW - margin, y, { align: 'right' });
      y += 6;
    };

    addRow('Subtotal Belanja', `Rp ${invoiceTotals.subtotal.toLocaleString('id-ID')}`);
    if (invoiceTotals.voucher) addRow(`Diskon (${invoiceTotals.voucher.code})`, `-Rp ${invoiceTotals.discount.toLocaleString('id-ID')}`, false, [16, 130, 76]);
    addRow('Biaya Admin & Layanan', `Rp ${ADMIN_FEE.toLocaleString('id-ID')}`);

    y += 1;
    doc.setFillColor(...green);
    doc.roundedRect(margin, y - 4, pageW - margin * 2, 9, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL PEMBAYARAN', margin + 4, y + 1.5);
    doc.text(`Rp ${totalBayar.toLocaleString('id-ID')}`, pageW - margin - 2, y + 1.5, { align: 'right' });

    
    y += 16;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(16, 130, 76);
    doc.text('STATUS: LUNAS / PAID', pageW / 2, y, { align: 'center' });

    
    y += 8;
    doc.setDrawColor(...green);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 140, 130);
    doc.text('Terima kasih telah berbelanja di FreshMarket.', pageW / 2, y, { align: 'center' });
    doc.text(`© ${new Date().getFullYear()} FreshMarket Indonesia. Teman Sehatmu.`, pageW / 2, y + 5, { align: 'center' });

    doc.save(`invoice-${invoiceNumber}.pdf`);
  };

  if (!paymentSuccess && (!Array.isArray(cartItems) || cartItems.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center pt-20 px-6 text-center font-sans text-gray-800 dark:text-gray-250 transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-full border border-gray-100 dark:border-gray-800 shadow-sm mb-4">
          <ShoppingBag size={40} className="text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Keranjangmu masih kosong</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">Yuk, isi dengan buah-buahan segar pilihan dari Freshmarket.</p>
        <Link to="/products" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95">
          Mulai Belanja <ArrowRight size={16}/>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-28 pb-20 px-4 md:px-8 font-sans text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        
        
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Keranjang Belanja</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Manajemen item pilihan Anda sebelum melakukan pembayaran.</p>
        </div>

        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          
          <div className="w-full lg:w-2/3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
            {cartItems.map((item) => (
              <div key={item?.id || Math.random()} className="p-6 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap hover:bg-gray-50/20 dark:hover:bg-gray-800/10 transition-colors">
                
                
                <div className="flex items-center gap-5 flex-1 min-w-0">
                  <img 
                    src={item?.image_url || 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500'} 
                    alt={item?.name || 'Produk'} 
                    className="w-20 h-20 rounded-xl object-cover border border-gray-100 dark:border-gray-800 shadow-xs shrink-0"
                  />
                  <div className="truncate">
                    <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-wider bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-md inline-block mb-1">
                      {item?.category || 'Buah Segar'}
                    </span>
                    <h3 className="font-bold text-gray-900 dark:text-white text-base truncate leading-snug">{item?.name || 'Item Tanpa Nama'}</h3>
                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1.5">
                      Rp {Number(item?.priceNumber || item?.price || 0).toLocaleString('id-ID')}
                      <span className="text-xs text-gray-400 dark:text-slate-500 font-normal"> /kg</span>
                    </p>
                  </div>
                </div>

                
                <div className="flex items-center gap-6 justify-between sm:justify-end w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0 border-gray-50 dark:border-gray-850">
                  
                  
                  <div className="flex items-center border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 rounded-lg p-1.5 shadow-xs gap-1">
                    <button 
                      onClick={() => updateQuantity(item?.id, (item?.quantity || 1) - 1)} 
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-405 transition-colors active:scale-90"
                    >
                      <Minus size={14} strokeWidth={2.5} />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-gray-900 dark:text-white">
                      {item?.quantity || 1}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item?.id, (item?.quantity || 1) + 1)} 
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500 dark:text-gray-405 transition-colors active:scale-90"
                    >
                      <Plus size={14} strokeWidth={2.5} />
                    </button>
                  </div>

                  
                  <button 
                    onClick={() => removeFromCart(item?.id)} 
                    className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-2.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all active:scale-95"
                    title="Hapus Item"
                  >
                    <Trash2 size={16} strokeWidth={2} />
                  </button>

                </div>
              </div>
            ))}
          </div>

          
          <div className="w-full lg:w-1/3 lg:sticky lg:top-28">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-6">
              
              <h2 className="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-3">Ringkasan Belanja</h2>

              
              {activeVouchers.length > 0 && !appliedVoucher && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500 block">Voucher Tersedia</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeVouchers.map(v => (
                      <button 
                        key={v.id} 
                        onClick={() => setVoucherCode(v.code)} 
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${voucherCode === v.code ? 'bg-green-50 dark:bg-green-950/30 border-green-500 text-green-700 dark:text-green-400' : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-700'}`}
                      >
                        {v.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              
              <div className="space-y-2">
                <label className="text-[10px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500 block">Punya Kode Voucher?</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                    <input 
                      type="text" 
                      placeholder="Masukkan kode" 
                      value={voucherCode} 
                      onChange={e => setVoucherCode(e.target.value.toUpperCase())}
                      disabled={appliedVoucher !== null}
                      className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-gray-955 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:border-gray-400 dark:focus:border-gray-700 text-sm font-bold uppercase tracking-wide disabled:bg-gray-50 dark:disabled:bg-gray-950 disabled:text-gray-400 dark:disabled:text-gray-600"
                    />
                  </div>
                  
                  {!appliedVoucher ? (
                    <button 
                      onClick={handleApplyVoucher} 
                      disabled={!voucherCode} 
                      className="bg-gray-900 dark:bg-gray-800 hover:bg-gray-800 dark:hover:bg-gray-700 disabled:bg-gray-105 disabled:text-gray-400 dark:disabled:bg-gray-950 dark:disabled:text-gray-600 text-white font-bold text-xs px-4 rounded-xl transition-all"
                    >
                      Gunakan
                    </button>
                  ) : (
                    <button 
                      onClick={handleRemoveVoucher} 
                      className="bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-100 dark:border-red-900/50 text-red-500 dark:text-red-400 px-3.5 rounded-xl transition-all"
                    >
                      <X size={16}/>
                    </button>
                  )}
                </div>
              </div>

              
              <div className="space-y-3 pt-2 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex justify-between font-medium">
                  <span>Total Harga ({cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} Barang)</span>
                  <span className="text-gray-900 dark:text-white">Rp {safeCartTotal.toLocaleString('id-ID')}</span>
                </div>
                
                
                {appliedVoucher && (
                  <div className="flex justify-between font-bold text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-950/30 p-2.5 -mx-2 rounded-xl border border-green-100/30 dark:border-green-900/20">
                    <span className="text-xs">
                      Diskon ({appliedVoucher.code} - {appliedVoucher.discount_type === 'PERCENT' ? `${appliedVoucher.discount_value}%` : `Rp ${Number(appliedVoucher.discount_value).toLocaleString('id-ID')}`})
                    </span>
                    <span className="text-xs">-Rp {discountAmount.toLocaleString('id-ID')}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-end pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white">
                  <span className="font-bold text-sm">Total Pembayaran</span>
                  <span className="text-xl font-black text-green-600 dark:text-green-400">Rp {finalTotal.toLocaleString('id-ID')}</span>
                </div>
              </div>

              
              {user ? (
                <button 
                  onClick={handleOpenPayment} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm shadow-sm transition-all flex justify-center items-center gap-2 active:scale-[0.98]"
                >
                  <CreditCard size={16} /> Lanjut ke Pembayaran
                </button>
              ) : (
                <Link 
                  to="/login" 
                  className="w-full bg-gray-105 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold py-3.5 rounded-xl text-sm transition-all flex justify-center items-center dark:bg-gray-800 dark:hover:bg-gray-700"
                >
                  Login Untuk Checkout
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>

      
      {showPaymentModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 dark:border-gray-800 overflow-hidden animate-in zoom-in-95 duration-200 my-8">
            
            {!paymentSuccess ? (
              <div className="flex flex-col">
                
                <div className="px-6 py-4 border-b border-slate-100 dark:border-gray-800 flex justify-between items-center bg-slate-50/50 dark:bg-gray-950/50">
                  <h3 className="text-sm font-semibold text-slate-850 dark:text-white">Pembayaran Belanja</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer">
                    <X size={18} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Pilih Metode Pembayaran</label>
                    <div className="grid grid-cols-3 gap-2.5">
                      <button 
                        onClick={() => setPaymentMethod('qris')} 
                        className={`flex flex-col items-center justify-center border p-3 rounded-xl transition-all ${paymentMethod === 'qris' ? 'border-emerald-500 bg-emerald-50/45 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'border-slate-150 dark:border-gray-800 bg-white dark:bg-gray-950 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-gray-700'}`}
                      >
                        <span className="text-[10px] font-bold tracking-wider uppercase">QRIS</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Instant</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('bca')} 
                        className={`flex flex-col items-center justify-center border p-3 rounded-xl transition-all ${paymentMethod === 'bca' ? 'border-emerald-500 bg-emerald-50/45 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'border-slate-150 dark:border-gray-800 bg-white dark:bg-gray-950 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-gray-700'}`}
                      >
                        <span className="text-[10px] font-bold tracking-wider uppercase">BCA VA</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Otomatis</span>
                      </button>
                      <button 
                        onClick={() => setPaymentMethod('mandiri')} 
                        className={`flex flex-col items-center justify-center border p-3 rounded-xl transition-all ${paymentMethod === 'mandiri' ? 'border-emerald-500 bg-emerald-50/45 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'border-slate-150 dark:border-gray-800 bg-white dark:bg-gray-950 text-slate-500 dark:text-gray-400 hover:border-slate-300 dark:hover:border-gray-700'}`}
                      >
                        <span className="text-[10px] font-bold tracking-wider uppercase">Mandiri</span>
                        <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-1 font-medium">Otomatis</span>
                      </button>
                    </div>
                  </div>

                  
                  <div className="space-y-3 border-t border-slate-100 dark:border-gray-800 pt-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Nomor Telepon Penerima</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: 08123456789"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-xs font-semibold text-slate-700 dark:text-gray-200 placeholder-slate-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Alamat Pengiriman Kurir</label>
                      <textarea
                        required
                        placeholder="Masukkan alamat lengkap tujuan pengiriman paket Anda"
                        rows={2}
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl focus:bg-white focus:border-emerald-500 transition-all outline-none text-xs font-semibold text-slate-700 dark:text-gray-200 placeholder-slate-400 resize-none"
                      />
                    </div>
                  </div>

                  
                  <div className="bg-slate-50/60 dark:bg-gray-950/50 border border-slate-100 dark:border-gray-850 rounded-xl p-4 font-mono text-[11px] text-slate-600 dark:text-slate-300 space-y-2.5 relative overflow-hidden">
                    
                    <div className="text-center pb-2.5 border-b border-dashed border-slate-200 dark:border-gray-800">
                      <p className="font-semibold text-slate-700 dark:text-white tracking-wider text-xs">FRESHMARKET RECEIPT</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{invoiceNumber}</p>
                    </div>

                    
                    <div className="space-y-1.5 py-1.5 border-b border-dashed border-slate-200 dark:border-gray-800 max-h-[120px] overflow-y-auto">
                      {(paymentSuccess ? invoiceItems : cartItems).map((item, index) => {
                        const price = Number(item?.priceNumber || item?.price || 0);
                        const qty = Number(item?.quantity || 1);
                        return (
                          <div key={index} className="flex justify-between">
                            <span className="truncate max-w-[200px] capitalize">{item.name} x{qty}</span>
                            <span>Rp {(price * qty).toLocaleString('id-ID')}</span>
                          </div>
                        );
                      })}
                    </div>

                    
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal Belanja</span>
                        <span>Rp {(paymentSuccess ? invoiceTotals.subtotal : safeCartTotal).toLocaleString('id-ID')}</span>
                      </div>
                      {(paymentSuccess ? invoiceTotals.voucher : appliedVoucher) && (
                        <div className="flex justify-between text-emerald-605 dark:text-emerald-400">
                          <span>Diskon ({(paymentSuccess ? invoiceTotals.voucher : appliedVoucher).code})</span>
                          <span>-Rp {(paymentSuccess ? invoiceTotals.discount : discountAmount).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Biaya Admin & Layanan</span>
                        <span>Rp {(2000).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    
                    <div className="flex justify-between pt-2.5 border-t border-dashed border-slate-200 dark:border-gray-800 font-semibold text-slate-800 dark:text-white text-xs">
                      <span>TOTAL BAYAR</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Rp {((paymentSuccess ? invoiceTotals.final : finalTotal) + 2000).toLocaleString('id-ID')}
                      </span>
                    </div>

                    
                    <div className="text-center pt-2 text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      Metode: {paymentMethod === 'qris' ? 'QRIS Instan' : paymentMethod === 'bca' ? 'BCA Virtual Account' : 'Mandiri Virtual Account'}
                    </div>
                  </div>

                  
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={() => setShowPaymentModal(false)} 
                      className="flex-1 py-2.5 border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-850 text-slate-600 dark:text-slate-300 font-medium text-xs rounded-xl transition-all cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handlePaymentSuccess} 
                      className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium text-xs rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer font-bold"
                    >
                      Bayar Sekarang
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8 flex flex-col items-center">
                
                <div className="relative mb-6">
                  
                  <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full scale-150"></div>
                  <div className="relative w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
                    <CheckCircle2 size={36} strokeWidth={2.5} className="animate-bounce" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight text-center">Transaksi Berhasil!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-xs mb-6 font-medium">
                  Terima kasih! Pembayaran Anda telah diterima dan pesanan sedang kami proses.
                </p>

                
                <div className="w-full bg-slate-50 dark:bg-gray-950 border border-slate-100 dark:border-gray-850 rounded-2xl p-5 mb-6 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">No. Invoice</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-white">{invoiceNumber}</span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-100/70 dark:border-gray-850/50 pt-3">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Metode Bayar</span>
                    <span className="font-bold text-slate-800 dark:text-white capitalize bg-slate-200/60 dark:bg-gray-800 px-2.5 py-1 rounded-lg text-[10px]">
                      {paymentMethod === 'qris' ? 'QRIS Instan' : `${paymentMethod.toUpperCase()} VA`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs border-t border-slate-100/70 dark:border-gray-850/50 pt-3">
                    <span className="text-slate-450 dark:text-slate-500 font-semibold uppercase tracking-wider">Total Item</span>
                    <span className="font-bold text-slate-800 dark:text-white">
                      {invoiceItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} kg
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-t border-dashed border-slate-200 dark:border-gray-800 pt-3">
                    <span className="text-xs font-semibold text-slate-550 dark:text-slate-450 uppercase tracking-wider font-bold">Total Pembayaran</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      Rp {((invoiceTotals.final || 0) + 2000).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase mb-6 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  STATUS: LUNAS / PAID
                </div>

                
                <div className="w-full space-y-3">
                  <button
                    onClick={handleDownloadInvoice}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white text-sm font-bold py-3 px-5 rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                  >
                    <Download size={16} strokeWidth={2.5} /> Unduh Invoice PDF
                  </button>

                  <button
                    onClick={() => { 
                      setShowPaymentModal(false); 
                      setPaymentSuccess(false); 
                      handleRemoveVoucher();
                      navigate('/tracking'); 
                    }}
                    className="w-full flex items-center justify-center text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white font-bold py-2.5 border border-slate-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-900 rounded-xl transition-colors cursor-pointer"
                  >
                    Pantau Pesanan Saya
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
