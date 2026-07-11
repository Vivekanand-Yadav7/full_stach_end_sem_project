const express = require('express');
const prisma = require('../config/prisma');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// GET orders — retailer sees all, customer sees their own
router.get('/', auth, async (req, res) => {
  try {
    const where = req.user.role === 'customer' ? { placedById: req.user.id } : {};
    const orders = await prisma.order.findMany({
      where,
      include: {
        products: {
          include: {
            product: {
              select: { name: true, imageUrl: true, price: true, category: true }
            }
          }
        },
        placedBy: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
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
      const product = await prisma.product.findUnique({ where: { id: item.product || item.productId } });
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

    // Use a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Deduct stock
      for (const { product, item } of resolvedProducts) {
        await tx.product.update({
          where: { id: product.id },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      // Build order with image/name snapshots
      const orderProducts = resolvedProducts.map(({ product, item }) => ({
        productId: product.id,
        quantity: item.quantity,
        price: item.price,
        productName: product.name,
        productImage: product.imageUrl,
      }));

      const newOrder = await tx.order.create({
        data: {
          totalAmount,
          placedById: req.user.id,
          customerName: req.user.name,
          products: {
            create: orderProducts
          }
        },
        include: {
          products: {
            include: {
              product: {
                select: { name: true, imageUrl: true, price: true, category: true }
              }
            }
          },
          placedBy: {
            select: { name: true, email: true }
          }
        }
      });
      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Order creation failed:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// PUT update order status (Retailer only)
router.put('/:id/status', auth, requireRole('retailer'), async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedOrder = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        products: {
          include: {
            product: {
              select: { name: true, imageUrl: true, price: true, category: true }
            }
          }
        },
        placedBy: {
          select: { name: true, email: true }
        }
      }
    });
      
    res.json(updatedOrder);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
