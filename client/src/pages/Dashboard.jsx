import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import ProductModal from '../components/ProductModal';

const StatCard = ({ title, value, icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass-card flex items-center gap-6"
  >
    <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data) => {
    try {
      if (currentProduct) {
        await api.put(`/products/${currentProduct.id || currentProduct._id}`, data);
      } else {
        await api.post('/products', data);
      }
      fetchStats();
      setIsModalOpen(false);
      setCurrentProduct(null);
      addNotification(`Product ${currentProduct ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      addNotification(error.response?.data?.message || 'Error saving product', 'error');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-primary font-bold">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Business Overview</h1>
        <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Products" 
          value={stats?.totalProducts || 0} 
          icon={<Package size={24} />} 
          color="bg-primary"
          delay={0.1}
        />
        <StatCard 
          title="Total Orders" 
          value={stats?.totalOrders || 0} 
          icon={<ShoppingCart size={24} />} 
          color="bg-blue-500"
          delay={0.2}
        />
        <StatCard 
          title="Low Stock Alerts" 
          value={stats?.lowStockCount || 0} 
          icon={<AlertTriangle size={24} />} 
          color="bg-red-500"
          delay={0.3}
        />
        <StatCard 
          title="Top Categories" 
          value={stats?.mostOrdered?.length || 0} 
          icon={<TrendingUp size={24} />} 
          color="bg-green-500"
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6">Low Stock Items</h2>
          <div className="space-y-4">
            {stats?.lowStockItems?.length > 0 ? (
              stats.lowStockItems.map((item) => (
                <div key={item._id} className="flex items-center justify-between p-4 bg-red-50 rounded-2xl border border-red-100">
                  <div className="flex items-center gap-4">
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-xs text-red-500 uppercase font-bold">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Only {item.quantity} left</p>
                    <button 
                      onClick={() => { setCurrentProduct(item); setIsModalOpen(true); }}
                      className="text-xs text-primary font-bold hover:underline"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 italic">No items are low on stock.</p>
            )}
          </div>
        </div>

        <div className="glass-card">
          <h2 className="text-xl font-bold mb-6">Popular Products</h2>
          <div className="space-y-4">
            {stats?.mostOrdered?.map((item, index) => (
              <div key={item._id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <div className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary font-bold rounded-lg text-sm">
                  #{index + 1}
                </div>
                <img src={item.productDetails.imageUrl} alt={item.productDetails.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1">
                  <p className="font-semibold">{item.productDetails.name}</p>
                  <p className="text-xs text-slate-500">{item.count} items ordered</p>
                </div>
                <div className="font-bold text-primary">
                  ${(item.productDetails.price * item.count).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <ProductModal
          product={currentProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Dashboard;
