import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { getBaseUrl } from '../api/axios';

const ProductModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    price: product?.price || '',
    category: product?.category || '',
    quantity: product?.quantity || '',
    description: product?.description || '',
    imageUrl: product?.imageUrl || '',
    seller: product?.seller || '',
    ingredients: product?.ingredients ? product.ingredients.join(', ') : '',
    nutrition: product?.nutrition ? product.nutrition.join(', ') : ''
  });

  const getPredecidedImageUrl = (category) => {
    if (!category) return '';
    const name = category.toLowerCase().replace(' ', '');
    return `${getBaseUrl()}/images/${name}.jpg`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      price: parseFloat(formData.price),
      quantity: parseInt(formData.quantity, 10),
      ingredients: typeof formData.ingredients === 'string' ? formData.ingredients.split(',').map(s => s.trim()).filter(s => s) : formData.ingredients,
      nutrition: typeof formData.nutrition === 'string' ? formData.nutrition.split(',').map(s => s.trim()).filter(s => s) : formData.nutrition
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto relative"
      >
        <button type="button" onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-6">{product ? 'Edit Product' : 'Add New Product'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
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
                onChange={(e) => {
                  const newCategory = e.target.value;
                  setFormData({
                    ...formData, 
                    category: newCategory,
                    imageUrl: getPredecidedImageUrl(newCategory)
                  });
                }}
                required
              >
                <option value="">Select...</option>
                <option value="Burger">Burger</option>
                <option value="Sea Food">Sea Food</option>
                <option value="Dessert">Dessert</option>
                <option value="Steak">Steak</option>
                <option value="Pizza">Pizza</option>
                <option value="Salad">Salad</option>
                <option value="Beverage">Beverage</option>
                <option value="Pasta">Pasta</option>
                <option value="Sushi">Sushi</option>
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
              <label className="text-sm font-semibold mb-1 block">Seller</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="e.g. ABC Cafe"
                value={formData.seller}
                onChange={(e) => setFormData({...formData, seller: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Ingredients (comma separated)</label>
              <textarea 
                className="input-field h-24 resize-none" 
                placeholder="Paneer, Whole Wheat Bread, Butter"
                value={formData.ingredients}
                onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Nutrition (comma separated)</label>
              <textarea 
                className="input-field h-24 resize-none" 
                placeholder="Protein: 20g, Calories: 320"
                value={formData.nutrition}
                onChange={(e) => setFormData({...formData, nutrition: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold mb-1 block">Image Preview</label>
              {formData.imageUrl ? (
                <div className="mt-2 h-24 w-24 rounded-lg overflow-hidden border border-slate-200">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="mt-2 h-24 w-24 rounded-lg border border-slate-200 border-dashed flex items-center justify-center text-xs text-slate-400 text-center px-2">
                  Select a category
                </div>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <textarea 
                className="input-field h-24 resize-none" 
                placeholder="Short description..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">
            {product ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProductModal;
