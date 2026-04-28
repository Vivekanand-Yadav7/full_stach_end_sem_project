import React, { useEffect, useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';

import { useNotification } from '../context/NotificationContext';

const ProductModal = ({ product, onClose, onSave, addNotification }) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    price: '',
    category: '',
    quantity: '',
    description: '',
    imageUrl: product?.imageUrl || ''
  });
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataToSend = new FormData();
    formDataToSend.append('image', file);

    setUploading(true);
    try {
      const res = await api.post('/products/upload', formDataToSend);
      setFormData({...formData, imageUrl: res.data.imageUrl});
      if (addNotification) addNotification('Image uploaded successfully!', 'success');
    } catch (error) {
      console.error('Upload Error:', error.response?.data || error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to upload image';
      if (addNotification) {
        addNotification(errorMsg, 'error');
      } else {
        alert(errorMsg);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-lg relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6">{product ? 'Edit Product' : 'Add New Product'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-semibold mb-1 block">Product Name</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Delicious Burger"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Price ($)</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="12.99"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Category</label>
              <select 
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select...</option>
                <option value="Burger">Burger</option>
                <option value="Sea Food">Sea Food</option>
                <option value="Dessert">Dessert</option>
                <option value="Steak">Steak</option>
                <option value="Pizza">Pizza</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Quantity</label>
              <input 
                type="number" 
                className="input-field" 
                placeholder="50"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Image</label>
              <div className="flex gap-2 items-center">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={uploading}
                  className="input-field !p-1 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                />
                {uploading && <Loader2 className="animate-spin text-primary" size={20} />}
              </div>
              {formData.imageUrl && !uploading && (
                <div className="mt-2 h-16 w-16 rounded-lg overflow-hidden border border-slate-200">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Description</label>
            <textarea 
              className="input-field h-24 resize-none" 
              placeholder="Short description..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={uploading}>
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);

  const { addNotification } = useNotification();

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
        await api.put(`/products/${currentProduct._id}`, data);
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

  const filteredProducts = products.filter(p => 
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
        <button 
          onClick={() => { setCurrentProduct(null); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2 justify-center"
        >
          <Plus size={20} />
          Add Product
        </button>
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
              key={product._id}
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
                    onClick={() => handleDelete(product._id)}
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
    </div>
  );
};

export default Products;
