import React, { useEffect, useState } from 'react';
import { Calendar, ChevronRight, Download, User } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=60';

const getItemImage = (item) => item.productImage || item.product?.imageUrl || FALLBACK_IMG;

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(orders.map(o => o._id === orderId ? res.data : o));
      addNotification('Order status updated successfully');
    } catch (error) {
      console.error(error);
      addNotification('Failed to update order status', 'error');
    }
  };

  const handleExportCSV = () => {
    if (orders.length === 0) return addNotification('No orders to export', 'error');

    const headers = ['Order ID', 'Customer', 'Date', 'Items Count', 'Total Amount', 'Status'];
    const rows = orders.map((o) => [
      o._id,
      o.customerName || o.placedBy?.name || 'Unknown',
      new Date(o.createdAt).toLocaleDateString(),
      o.products.length,
      o.totalAmount.toFixed(2),
      o.status,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
    addNotification('Orders exported to CSV');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-primary font-semibold">
      Loading orders...
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Order Management</h1>
          <p className="text-slate-500">All customer orders placed in your store.</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="btn-secondary flex items-center gap-2 justify-center"
        >
          <Download size={20} />
          Export CSV
        </button>
      </div>

      {/* Orders table */}
      {orders.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <ChevronRight size={48} className="text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No orders yet</h3>
          <p className="text-slate-400 mt-2">
            Orders will appear here once customers start purchasing.
          </p>
        </div>
      ) : (
        <div className="glass-card !p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-primary/5 text-slate-500 text-xs uppercase font-bold tracking-wider">
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {orders.map((order, index) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      #{order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex -space-x-2">
                        {order.products.slice(0, 3).map((item, i) => (
                          <img
                            key={i}
                            src={getItemImage(item)}
                            alt={item.productName || item.product?.name}
                            onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                            className="w-9 h-9 rounded-full border-2 border-white object-cover shadow-sm"
                            title={item.productName || item.product?.name}
                          />
                        ))}
                        {order.products.length > 3 && (
                          <div className="w-9 h-9 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-primary">
                            +{order.products.length - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <User size={14} className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {order.customerName || order.placedBy?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-400">{order.placedBy?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calendar size={13} />
                        {new Date(order.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize focus:outline-none border-2 border-transparent hover:border-slate-200 transition-colors cursor-pointer appearance-none ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
