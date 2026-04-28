const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Retailer dashboard stats
router.get('/stats', auth, requireRole('retailer'), async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const lowStockItems = await Product.find({ quantity: { $lt: 5 } });

    const mostOrdered = await Order.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.product', count: { $sum: '$products.quantity' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'productDetails' } },
      { $unwind: '$productDetails' },
    ]);

    res.json({ totalProducts, totalOrders, lowStockCount: lowStockItems.length, lowStockItems, mostOrdered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
