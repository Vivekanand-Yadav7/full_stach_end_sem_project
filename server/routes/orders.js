const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET orders — retailer sees all, customer sees their own
router.get('/', auth, async (req, res) => {
  try {
    const filter = req.user.role === 'customer' ? { placedBy: req.user._id } : {};
    const orders = await Order.find(filter)
      .populate('products.product', 'name imageUrl price category')
      .populate('placedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST order — any authenticated user can place orders
router.post('/', auth, async (req, res) => {
  try {
    const { products, totalAmount } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one product' });
    }

    // Validate stock first, and collect product snapshots
    const resolvedProducts = [];
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(400).json({ message: `Product not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}" — only ${product.quantity} left`,
        });
      }
      resolvedProducts.push({ product, item });
    }

    // Deduct stock
    for (const { product, item } of resolvedProducts) {
      product.quantity -= item.quantity;
      await product.save();
    }

    // Build order with image/name snapshots
    const orderProducts = resolvedProducts.map(({ product, item }) => ({
      product: product._id,
      quantity: item.quantity,
      price: item.price,
      productName: product.name,
      productImage: product.imageUrl,
    }));

    const order = new Order({
      products: orderProducts,
      totalAmount,
      placedBy: req.user._id,
      customerName: req.user.name,
    });
    await order.save();

    // Return populated order
    const populated = await Order.findById(order._id)
      .populate('products.product', 'name imageUrl price category')
      .populate('placedBy', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Order creation failed:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// PUT update order status (Retailer only)
router.put('/:id/status', auth, requireRole('retailer'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.status = status;
    await order.save();
    
    const populated = await Order.findById(order._id)
      .populate('products.product', 'name imageUrl price category')
      .populate('placedBy', 'name email');
      
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
