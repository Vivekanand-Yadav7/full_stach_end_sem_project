const express = require('express');
const prisma = require('../config/prisma');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// Retailer dashboard stats
router.get('/stats', auth, requireRole('retailer'), async (req, res) => {
  try {
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    
    const lowStockItems = await prisma.product.findMany({
      where: { quantity: { lt: 5 } }
    });

    const mostOrderedRaw = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    });

    const mostOrderedIds = mostOrderedRaw.map(item => item.productId);
    const mostOrderedProducts = await prisma.product.findMany({
      where: { id: { in: mostOrderedIds } }
    });

    const mostOrdered = mostOrderedRaw.map(item => {
      const product = mostOrderedProducts.find(p => p.id === item.productId);
      return {
        _id: item.productId,
        count: item._sum.quantity,
        productDetails: product
      };
    });

    res.json({ totalProducts, totalOrders, lowStockCount: lowStockItems.length, lowStockItems, mostOrdered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
