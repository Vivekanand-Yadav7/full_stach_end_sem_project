const express = require('express');
const prisma = require('../config/prisma');
const { auth, requireRole } = require('../middleware/auth');
const { indexProduct } = require('../rag/ingest/indexProduct');
const { deleteProductVector } = require('../rag/ingest/vectorStore');
const { upload } = require('../config/cloudinary');
const router = express.Router();

// Upload image route
router.post('/upload-image', auth, requireRole('retailer'), (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('Multer/Cloudinary Error:', err);
      return res.status(500).json({ message: 'Upload failed', error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }
    res.json({ imageUrl: req.file.path });
  });
});

// GET all products — any authenticated user (retailer or customer)
router.get('/', auth, async (req, res) => {
  try {
    const { search, category } = req.query;
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category && category !== 'all') {
      where.category = category;
    }
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE product — retailer only
router.post('/', auth, requireRole('retailer'), async (req, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body
    });
    await indexProduct(product).catch(err => console.error("Qdrant index error:", err));
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product — retailer only
router.put('/:id', auth, requireRole('retailer'), async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body
    });
    await indexProduct(product).catch(err => console.error("Qdrant index error:", err));
    res.json(product);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE product — retailer only
router.delete('/:id', auth, requireRole('retailer'), async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    await deleteProductVector(req.params.id).catch(err => console.error("Qdrant delete error:", err));
    res.json({ message: 'Product deleted' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
