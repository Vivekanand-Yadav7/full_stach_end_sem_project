import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, ShoppingCart, Plus, Minus, X, Loader2, Sparkles, Bot, Send, ArrowLeft, Zap } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['all', 'Burger', 'Sea Food', 'Dessert', 'Steak', 'Pizza', 'Salad', 'Beverage', 'Pasta', 'Sushi'];

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const { addNotification } = useNotification();
  const { user } = useAuth();

  // Smart Search state
  const [isSmartOpen, setIsSmartOpen] = useState(false);
  const [smartQuery, setSmartQuery] = useState('');
  const [smartRecommendation, setSmartRecommendation] = useState(null);
  const [smartProducts, setSmartProducts] = useState([]);
  const [smartLoading, setSmartLoading] = useState(false);
  const [isSmartMode, setIsSmartMode] = useState(false);

  // AI Recommendation state
  const [recommendations, setRecommendations] = useState([]);
  const [recLoading, setRecLoading] = useState(false);
  const recDebounceRef = useRef(null);

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

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Trigger recommendations whenever the cart changes (debounced 600ms)
  useEffect(() => {
    if (recDebounceRef.current) clearTimeout(recDebounceRef.current);

    if (cart.length === 0) {
      setRecommendations([]);
      return;
    }

    recDebounceRef.current = setTimeout(async () => {
      setRecLoading(true);
      try {
        const res = await api.post('/recommend', {
          userId: user?.id,
          orderedFoodIds: cart.map(i => i.product),
        });
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        console.warn('Recommendations unavailable:', err.message);
      } finally {
        setRecLoading(false);
      }
    }, 600);

    return () => clearTimeout(recDebounceRef.current);
  }, [cart, user]);

  const pid = (product) => product.id || product._id;

  const addToCart = (product) => {
    if (product.quantity === 0) return addNotification('Out of stock!', 'error');
    const id = pid(product);
    setCart((prev) => {
      const existing = prev.find((i) => i.product === id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          addNotification(`Only ${product.quantity} in stock`, 'error');
          return prev;
        }
        return prev.map((i) => i.product === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product: id, name: product.name, price: product.price, quantity: 1, max: product.quantity, imageUrl: product.imageUrl }];
    });
    addNotification(`${product.name} added to bucket!`, 'success');
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
      setRecommendations([]);
      addNotification('🎉 Order placed successfully!');
      fetchProducts();
    } catch (err) {
      addNotification(err.response?.data?.message || 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!smartQuery.trim()) return;
    setSmartLoading(true);
    setSmartRecommendation(null);
    setSmartProducts([]);
    try {
      const res = await api.post('/smart-search', { query: smartQuery, limit: 5 });
      setSmartRecommendation(res.data.recommendation);
      setSmartProducts(res.data.products || []);
      setIsSmartOpen(false);
      setIsSmartMode(true);
    } catch (err) {
      setSmartRecommendation('❌ ' + (err.response?.data?.message || 'Smart search failed. Please try again.'));
    } finally {
      setSmartLoading(false);
    }
  };

  const clearSmartMode = () => {
    setIsSmartMode(false);
    setSmartRecommendation(null);
    setSmartProducts([]);
    setSmartQuery('');
  };

  const displayProducts = isSmartMode ? smartProducts : products;
  const showLoading = isSmartMode ? false : loading;

  // ProductCard — shared for grid + recommendations
  const ProductCard = ({ product, index = 0, ring = false }) => {
    const id = pid(product);
    const cartItem = cart.find((i) => i.product === id);
    return (
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className={`glass-card group overflow-hidden !p-0 ${ring ? 'ring-2 ring-violet-200/60' : ''}`}
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
          {ring && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-gradient-to-r from-violet-500 to-indigo-500 text-white rounded-full text-[10px] font-bold flex items-center gap-1">
              <Sparkles size={10} />
              AI Pick
            </div>
          )}
          {!ring && product.quantity < 5 && product.quantity > 0 && (
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
            <span className="text-primary font-bold ml-2">${product.price?.toFixed(2)}</span>
          </div>
          <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
          {cartItem ? (
            <div className="flex items-center justify-between bg-primary/5 rounded-2xl p-2">
              <button onClick={() => { if (cartItem.quantity === 1) removeFromCart(id); else updateQty(id, -1); }} className="p-2 hover:bg-white rounded-xl text-primary transition-colors">
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Browse Products</h1>
          <p className="text-slate-500">Find what you're looking for and place an order</p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            id="smart-search-btn"
            onClick={() => { setIsSmartOpen(true); setSmartRecommendation(null); setSmartQuery(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-200 hover:opacity-90 transition-opacity"
          >
            <Sparkles size={16} />
            AI Search
          </button>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative btn-primary flex items-center gap-2"
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
      </div>

      {/* AI Recommendation Banner — smart mode */}
      <AnimatePresence>
        {isSmartMode && smartRecommendation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="relative bg-gradient-to-r from-violet-50 via-indigo-50 to-purple-50 border border-violet-200/60 rounded-2xl p-5 shadow-sm"
          >
            <button
              onClick={clearSmartMode}
              className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-violet-600 bg-white/80 hover:bg-white border border-violet-200/60 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to all
            </button>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500">
                <Sparkles size={14} className="text-white" />
              </div>
              <span className="text-sm font-bold text-violet-700">AI Recommendation</span>
              <span className="text-xs text-violet-400 font-medium">for "{smartQuery}"</span>
            </div>
            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed pr-20">{smartRecommendation}</p>
            {smartProducts.length > 0 && (
              <p className="text-xs text-violet-500 font-medium mt-3">
                Showing {smartProducts.length} matching product{smartProducts.length !== 1 ? 's' : ''} below
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search + Filter — hide when in smart mode */}
      {!isSmartMode && (
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
      )}

      {/* Product Grid */}
      {showLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary" size={36} />
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-20">
          {isSmartMode ? (
            <>
              <Bot size={48} className="mx-auto text-violet-300 mb-4" />
              <p className="text-slate-400 font-medium text-lg">No matching products found</p>
              <p className="text-slate-400 text-sm mb-4">Try describing what you want differently</p>
              <button onClick={clearSmartMode} className="text-violet-600 font-semibold text-sm hover:underline">
                ← Back to all products
              </button>
            </>
          ) : (
            <>
              <Search size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-medium text-lg">No products found</p>
              <p className="text-slate-400 text-sm">Try a different search or category</p>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {displayProducts.map((product, index) => (
              <ProductCard key={pid(product)} product={product} index={index} ring={isSmartMode} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Recommendations Section ─────────────────────────────────── */}
      <AnimatePresence>
        {(recLoading || recommendations.length > 0) && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="space-y-4"
          >
            {/* Divider + heading */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 border border-violet-200/60">
                <Zap size={14} className="text-violet-500" />
                <span className="text-xs font-bold text-violet-700 tracking-wide uppercase">Recommended for You</span>
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-200 to-transparent" />
            </div>

            {recLoading ? (
              <div className="flex items-center justify-center gap-3 py-10">
                <Loader2 className="animate-spin text-violet-500" size={24} />
                <span className="text-sm text-slate-400 font-medium">Personalising your feed…</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {recommendations.map((product, index) => (
                  <ProductCard key={`rec-${pid(product)}`} product={product} index={index} ring />
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

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

      {/* Smart Search Drawer */}
      <AnimatePresence>
        {isSmartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
              onClick={() => setIsSmartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-violet-100 flex justify-between items-center bg-gradient-to-r from-violet-50 to-indigo-50">
                <h2 className="text-xl font-bold flex items-center gap-2 text-violet-700">
                  <Bot size={22} className="text-violet-500" />
                  AI Food Assistant
                </h2>
                <button onClick={() => setIsSmartOpen(false)} className="p-2 hover:bg-white/70 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm text-slate-500">
                  Describe what you're craving and our AI will find the best matching products for you!
                </p>

                {smartLoading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="relative">
                      <Loader2 className="animate-spin text-violet-500" size={36} />
                      <Sparkles size={14} className="absolute -top-1 -right-1 text-indigo-400 animate-pulse" />
                    </div>
                    <p className="text-sm text-slate-400 text-center">AI is searching products for you...</p>
                  </div>
                )}

                {smartRecommendation && !smartLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-violet-500" />
                      <span className="text-sm font-bold text-violet-600">AI Recommendation</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{smartRecommendation}</p>
                    {smartProducts.length > 0 && (
                      <p className="text-xs text-violet-500 font-medium mt-3">
                        ✨ {smartProducts.length} product{smartProducts.length !== 1 ? 's' : ''} found — check the main grid!
                      </p>
                    )}
                  </motion.div>
                )}
              </div>

              <form onSubmit={handleSmartSearch} className="p-6 border-t border-violet-100 space-y-3">
                <textarea
                  id="smart-search-input"
                  className="w-full resize-none rounded-2xl border border-violet-200 bg-violet-50/50 p-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 h-24"
                  placeholder="e.g. I want something sweet and chocolatey..."
                  value={smartQuery}
                  onChange={(e) => setSmartQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSmartSearch(e); } }}
                />
                <button
                  id="smart-search-submit"
                  type="submit"
                  disabled={smartLoading || !smartQuery.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-violet-200 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {smartLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {smartLoading ? 'Searching...' : 'Ask AI'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
