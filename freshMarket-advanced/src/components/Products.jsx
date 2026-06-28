
/* -------------------------------------------------------------------------- */
/*                            DEPENDENSI & IMPOR                              */
/* -------------------------------------------------------------------------- */
import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, X, SearchX, CheckCircle2, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

/* -------------------------------------------------------------------------- */
/*                           KOMPONEN UTAMA / LOGIKA                          */
/* -------------------------------------------------------------------------- */

const Products = ({ searchQuery, setSearchQuery }) => {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/products');
        const data = await res.json();

        const formattedData = data.map(p => ({
          id: p.id,
          name: p.name,
          shortDesc: p.category,
          desc: 'Buah segar dan berkualitas pilihan kami, disiapkan khusus untuk keluarga Anda.',
          priceNumber: p.price,
          unit: '',
          image: p.image_url || 'https://via.placeholder.com/400?text=No+Image',
          stock: p.stock
        }));

        setProductsList(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Gagal menarik data", err);
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  const filteredProducts = productsList.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
  };

  const handleAddToCart = () => {
    addToCart(selectedProduct, quantity);
    const itemName = selectedProduct.name;
    const itemQty = quantity;
    setSelectedProduct(null);
    setToastMessage(`Berhasil menambah ${itemQty} ${itemName}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBuyNow = () => {
    addToCart(selectedProduct, quantity);
    navigate('/cart');
  };

  return (
    <section className="py-6 md:py-10 px-4 md:px-6 bg-slate-50/30 dark:bg-gray-950 min-h-screen relative font-sans text-slate-650 dark:text-slate-350 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10 gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-white tracking-tight">
              Katalog <span className="text-emerald-600 dark:text-emerald-400">Buah Segar</span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Pilih buah segar berkualitas tinggi untuk memenuhi kebutuhan nutrisi Anda.</p>
          </div>
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-650 dark:group-focus-within:text-emerald-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari buah segar kamu disini..."
              className="w-full bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-800 py-2.5 pl-11 pr-4 rounded-xl focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-450 focus:ring-4 focus:ring-emerald-500/10 dark:focus:ring-emerald-500/20 transition-all text-xs font-medium text-slate-700 dark:text-gray-200 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <div className="w-10 h-10 border-4 border-slate-200 dark:border-gray-850 border-t-emerald-600 dark:border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
             <SearchX size={44} className="text-slate-350 dark:text-slate-600 mb-4" />
             <h3 className="text-sm font-semibold text-slate-700 dark:text-white">Produk Tidak Ditemukan</h3>
             <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Belum ada produk yang dipublikasikan atau cari kata kunci lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((item) => (
              <div
                key={item.id}
                onClick={() => { setSelectedProduct(item); setQuantity(1); }}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-850 overflow-hidden shadow-sm hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] hover:border-emerald-100/80 dark:hover:border-emerald-500/20 transition-all duration-300 group cursor-pointer flex flex-col"
              >
                <div className="relative aspect-square bg-slate-50/50 dark:bg-gray-950/55 overflow-hidden p-3 md:p-4">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500 shadow-sm border border-slate-100/50 dark:border-gray-800/50" />
                </div>

                <div className="px-4 pb-4 pt-2 flex flex-col flex-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1 truncate">{item.shortDesc}</span>
                  <h3 className="font-semibold text-slate-800 dark:text-white text-xs sm:text-sm leading-snug mb-3.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2">{item.name}</h3>

                  <div className="mt-auto flex items-end justify-between">
                    <div>
                      <p className="text-sm md:text-base font-semibold text-slate-850 dark:text-white leading-none">{formatRupiah(item.priceNumber)}</p>
                      <p className={`text-[10px] font-medium mt-1.5 ${item.stock < 10 ? 'text-rose-500 font-bold' : 'text-slate-400 dark:text-slate-500'}`}>
                        Stok: {item.stock}
                      </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/45 text-emerald-600 dark:text-emerald-450 p-2 rounded-lg group-hover:bg-emerald-600 dark:group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                      <Plus size={14} strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm md:p-6 transition-all">
          <div className="bg-white dark:bg-gray-900 w-full md:max-w-3xl rounded-t-2xl md:rounded-2xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row animate-in slide-in-from-bottom-full md:zoom-in-95 duration-300 max-h-[90vh]">

            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-white/95 dark:bg-gray-800 backdrop-blur-md p-2 rounded-full text-slate-400 dark:text-slate-350 hover:text-slate-655 dark:hover:text-white z-20 shadow-sm border border-slate-100 dark:border-gray-700">
              <X size={18} />
            </button>

            <div className="w-full md:w-5/12 h-48 md:h-auto bg-slate-50/50 dark:bg-gray-950/45 shrink-0 relative flex items-center justify-center p-4 md:p-8">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover rounded-xl shadow-sm border border-slate-100/50 dark:border-gray-800" />
            </div>

            <div className="w-full md:w-7/12 flex flex-col h-full justify-between">
              <div className="p-6 md:p-8 overflow-y-auto">
                <div className="mb-4 md:mb-5">
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/50 px-2.5 py-1 rounded inline-block mb-2 md:mb-2.5">
                    {selectedProduct.shortDesc}
                  </span>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white mb-1 leading-tight">{selectedProduct.name}</h2>
                  <div className="flex items-baseline gap-1 md:gap-2">
                    <span className="text-base md:text-xl font-semibold text-slate-850 dark:text-white">{formatRupiah(selectedProduct.priceNumber)}</span>
                  </div>
                </div>

                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-white mb-1">Detail Produk</h4>
                  <p className="text-slate-550 dark:text-slate-300 text-xs leading-relaxed">{selectedProduct.desc}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-3 border-t border-slate-100 dark:border-gray-800 pt-3">
                    Sisa stok: <span className={`font-semibold ${selectedProduct.stock < 10 ? 'text-rose-500' : 'text-slate-700 dark:text-gray-250'}`}>{selectedProduct.stock}</span>
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 p-4 md:p-6 mt-auto">
                <div className="flex justify-between items-center mb-4 md:mb-5">
                  <div className="flex items-center bg-slate-50 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-lg">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 transition-colors"><Minus size={14} /></button>
                    <span className="w-8 text-center font-semibold text-slate-700 dark:text-white text-xs">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(selectedProduct.stock, quantity + 1))}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-450 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Total Harga</p>
                    <span className="text-base md:text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(selectedProduct.priceNumber * quantity)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-white dark:bg-gray-850 text-emerald-600 dark:text-emerald-400 border border-emerald-605 dark:border-emerald-500/70 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-medium py-2.5 rounded-xl transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart size={14} /> + Keranjang
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={selectedProduct.stock === 0}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-medium py-2.5 rounded-xl transition-all shadow-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    <Zap size={14} className="fill-white text-white" /> {selectedProduct.stock === 0 ? 'Habis' : 'Beli'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {toastMessage && (
        <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-[150] w-[90%] md:w-auto max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="bg-gray-900 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-full shadow-2xl flex items-center gap-3 font-medium text-xs md:text-sm">
            <CheckCircle2 className="text-green-400 shrink-0" size={18} />
            <span className="truncate">{toastMessage}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;
