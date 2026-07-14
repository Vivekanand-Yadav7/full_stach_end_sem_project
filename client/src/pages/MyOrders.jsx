import React, { useEffect, useState } from 'react';
import { ShoppingBag, Calendar, Package } from 'lucide-react';
import api from '../api/axios';
import { motion } from 'framer-motion';

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=60';

/** Resolve the best available image for an order item */
const getItemImage = (item) =>
  item.productImage || item.product?.imageUrl || FALLBACK_IMG;

/** Resolve the best available name */
const getItemName = (item) =>
  item.productName || item.product?.name || 'Unknown Product';

const STAGES = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-primary font-semibold">
      Loading orders...
    </div>
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Orders</h1>
        <p className="text-slate-500">Track all your purchases in one place</p>
      </div>

      {orders.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 text-center">
          <ShoppingBag size={56} className="text-slate-200 mb-4" />
          <h3 className="text-xl font-bold text-slate-700">No orders yet</h3>
          <p className="text-slate-400 mt-2">
            Head over to the Shop to place your first order!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id || order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card"
            >
              {/* Order header */}
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  {/* Product image stack */}
                  <div className="flex -space-x-3">
                    {order.products.slice(0, 3).map((item, i) => (
                      <img
                        key={i}
                        src={getItemImage(item)}
                        alt={getItemName(item)}
                        onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                        className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-md"
                      />
                    ))}
                    {order.products.length > 3 && (
                      <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-xs font-bold text-primary shadow-md">
                        +{order.products.length - 3}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-slate-800">
                      Order #{(order.id || order._id).slice(-8).toUpperCase()}
                    </p>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                      <Calendar size={12} />
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Order progress tracking */}
              {order.status !== 'cancelled' && (
                <div className="mt-4 pt-5 pb-6 border-t border-primary/5">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-sm font-semibold text-slate-700">Order Progress</span>
                  </div>
                  <div className="relative flex items-center justify-between w-full px-2">
                    {/* Background track */}
                    <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 h-1 bg-slate-200 rounded-full"></div>
                    {/* Active track */}
                    <div
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500"
                      style={{
                        width: `calc(${Math.max(0, (STAGES.indexOf(order.status) / (STAGES.length - 1)) * 100)}% - 16px)`
                      }}
                    ></div>

                    {STAGES.map((stage, i) => {
                      const isActive = STAGES.indexOf(order.status) >= i;
                      return (
                        <div key={stage} className="relative flex flex-col items-center">
                          <div
                            className={`w-5 h-5 rounded-full border-[3px] bg-white z-10 transition-colors duration-300 flex items-center justify-center ${
                              isActive ? 'border-primary' : 'border-slate-300'
                            }`}
                          >
                            {isActive && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          </div>
                          <span className={`absolute top-7 text-[10px] font-bold whitespace-nowrap uppercase tracking-wider ${
                            isActive ? 'text-primary' : 'text-slate-400'
                          }`}>
                            {stage.replace(/_/g, ' ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order items breakdown */}
              <div className="mt-4 pt-4 border-t border-primary/5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {order.products.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-secondary/40 p-3 rounded-2xl">
                    <img
                      src={getItemImage(item)}
                      alt={getItemName(item)}
                      onError={(e) => { e.currentTarget.src = FALLBACK_IMG; }}
                      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-700 font-semibold text-sm truncate">
                        {getItemName(item)}
                      </p>
                      <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-primary font-bold text-sm flex-shrink-0">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
