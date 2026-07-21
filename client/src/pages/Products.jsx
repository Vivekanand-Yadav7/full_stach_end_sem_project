import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, Loader2, Sparkles, Bot, Send } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

import { useNotification } from '../context/NotificationContext';

import ProductModal from '../components/ProductModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const { addNotification } = useNotification();
  const { user } = useAuth();

  // Smart Search state
  const [isSmartOpen, setIsSmartOpen] = useState(false);
  const [smartQuery, setSmartQuery] = useState('');
  const [smartResult, setSmartResult] = useState(null);
  const [smartLoading, setSmartLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct.id}`, data);
      } else {
        await api.post('/products', data);
      }
      fetchProducts();
      setIsModalOpen(false);
      setCurrentProduct(null);
      addNotification(`Product ${currentProduct ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      addNotification(error.response?.data?.message || 'Error saving product', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
        addNotification('Product deleted successfully');
      } catch (error) {
        addNotification('Error deleting product', 'error');
      }
    }
  };

  const handleSmartSearch = async (e) => {
    e.preventDefault();
    if (!smartQuery.trim()) return;
    setSmartLoading(true);
    setSmartResult(null);
    try {
      const res = await api.post('/smart-search', { query: smartQuery, limit: 5 });
      setSmartResult(res.data.recommendation);
    } catch (err) {
      setSmartResult('❌ ' + (err.response?.data?.message || 'Smart search failed.'));
    } finally {
      setSmartLoading(false);
    }
  };

  // Only show products uploaded by this retailer, then apply search filter
  const filteredProducts = products
    .filter(p => p.retailerId === user?.id)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500">Manage your menu items and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            id="retailer-smart-search-btn"
            onClick={() => { setIsSmartOpen(true); setSmartResult(null); setSmartQuery(''); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 text-white text-sm font-semibold shadow-lg shadow-violet-200 hover:opacity-90 transition-opacity"
          >
            <Sparkles size={16} />
            AI Preview
          </button>
          <button
            onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2 justify-center"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="input-field pl-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="glass-card !p-3 hover:bg-white transition-colors">
          <Filter size={20} className="text-primary" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.05 }}
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
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button 
                    onClick={() => { setCurrentProduct(product); setIsModalOpen(true); }}
                    className="p-3 bg-white text-primary rounded-full hover:scale-110 active:scale-95 transition-all"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id)}
                    className="p-3 bg-white text-red-500 rounded-full hover:scale-110 active:scale-95 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight truncate pr-2">{product.name}</h3>
                  <span className="text-primary font-bold">${product.price}</span>
                </div>
                <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-primary/5">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${product.quantity < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {product.quantity} in stock
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isModalOpen && (
        <ProductModal
          product={currentProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          addNotification={addNotification}
        />
      )}

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
                  AI Preview
                </h2>
                <button onClick={() => setIsSmartOpen(false)} className="p-2 hover:bg-white/70 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <p className="text-sm text-slate-500">
                  See how customers will experience AI search on your products. Try sample queries!
                </p>
                {smartLoading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="animate-spin text-violet-500" size={36} />
                    <p className="text-sm text-slate-400">AI is thinking...</p>
                  </div>
                )}
                {smartResult && !smartLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-100 rounded-2xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={16} className="text-violet-500" />
                      <span className="text-sm font-bold text-violet-600">AI Recommendation</span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{smartResult}</p>
                  </motion.div>
                )}
              </div>
              <form onSubmit={handleSmartSearch} className="p-6 border-t border-violet-100 space-y-3">
                <textarea
                  id="retailer-smart-search-input"
                  className="w-full resize-none rounded-2xl border border-violet-200 bg-violet-50/50 p-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 h-24"
                  placeholder="e.g. spicy vegetarian burger..."
                  value={smartQuery}
                  onChange={(e) => setSmartQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSmartSearch(e); } }}
                />
                <button
                  id="retailer-smart-search-submit"
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

export default Products;
