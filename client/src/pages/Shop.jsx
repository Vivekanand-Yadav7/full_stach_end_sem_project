import React, { useEffect, useState, useCallback } from 'react';
import { Search, ShoppingCart, Plus, Minus, X, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

const CATEGORIES = ['all', 'Burger', 'Sea Food', 'Dessert', 'Steak', 'Pizza'];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const { addNotification } = useNotification();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category !== 'all') params.category = category;
      const res = await api.get('/products', { params });
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const addToCart = (product) => {
    if (product.quantity === 0) return addNotification('Out of stock!', 'error');
    setCart((prev) => {
      const existing = prev.find((i) => i.product === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          addNotification(`Only ${product.quantity} in stock`, 'error');
          return prev;
        }
        return prev.map((i) => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product: product._id, name: product.name, price: product.price, quantity: 1, max: product.quantity, imageUrl: product.imageUrl }];
    });
    setIsCartOpen(true);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.product !== id) return i;
        const newQty = i.quantity + delta;
        if (newQty < 1) return i;
        if (newQty > i.max) { addNotification(`Only ${i.max} in stock`, 'error'); return i; }
        return { ...i, quantity: newQty };
      })
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((i) => i.product !== id));

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const placeOrder = async () => {
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      await api.post('/orders', {
        products: cart.map((i) => ({ product: i.product, quantity: i.quantity, price: i.price })),
        totalAmount: cartTotal,
      });
      setCart([]);
      setIsCartOpen(false);
      addNotification('🎉 Order placed successfully!');
      fetchProducts();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Browse Products</h1>
          <p className="text-slate-500">Find what you're looking for and place an order</p>
        </div>
        {/* Cart toggle */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="relative btn-primary flex items-center gap-2 self-start sm:self-auto"
        >
          <ShoppingCart size={20} />
          My Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search products by name or description..."
            className="input-field pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-semibold capitalize transition-all ${
                category === cat
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'bg-white/70 text-slate-600 hover:bg-primary/5 hover:text-primary border border-primary/10'
              }`}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-400 font-medium text-lg">No products found</p>
          <p className="text-slate-400 text-sm">Try a different search or category</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {products.map((product, index) => {
              const cartItem = cart.find((i) => i.product === product._id);
              return (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="glass-card group overflow-hidden !p-0"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-primary shadow-sm">
                      {product.category}
                    </div>
                    {product.quantity < 5 && product.quantity > 0 && (
                      <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white rounded-full text-[10px] font-bold">
                        Only {product.quantity} left!
                      </div>
                    )}
                    {product.quantity === 0 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                      <span className="text-primary font-bold ml-2">${product.price.toFixed(2)}</span>
                    </div>
                    <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>

                    {cartItem ? (
                      <div className="flex items-center justify-between bg-primary/5 rounded-2xl p-2">
                        <button onClick={() => { if (cartItem.quantity === 1) removeFromCart(product._id); else updateQty(product._id, -1); }} className="p-2 hover:bg-white rounded-xl text-primary transition-colors">
                          <Minus size={16} />
                        </button>
                        <span className="font-bold text-primary">{cartItem.quantity} in cart</span>
                        <button onClick={() => addToCart(product)} className="p-2 hover:bg-white rounded-xl text-primary transition-colors">
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={product.quantity === 0}
                        className="btn-primary w-full text-sm !py-2.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-primary/10 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ShoppingCart size={22} className="text-primary" />
                  Your Cart
                  {cartCount > 0 && (
                    <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">{cartCount}</span>
                  )}
                </h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <ShoppingCart size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">Your cart is empty</p>
                    <p className="text-slate-300 text-sm">Add items from the shop</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.product} className="flex items-center gap-3 p-3 bg-secondary/50 rounded-2xl">
                      <img src={item.imageUrl} alt={item.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{item.name}</p>
                        <p className="text-primary font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-white rounded-xl p-1">
                        <button onClick={() => updateQty(item.product, -1)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-500">
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateQty(item.product, 1)} className="p-1 hover:bg-slate-100 rounded-lg text-primary">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.product)} className="text-red-400 hover:text-red-600 p-1">
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 border-t border-primary/10 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Total</span>
                    <span className="text-2xl font-bold text-primary">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button onClick={placeOrder} disabled={placingOrder} className="btn-primary w-full flex items-center justify-center gap-2">
                    {placingOrder ? <Loader2 className="animate-spin" size={20} /> : 'Place Order'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
