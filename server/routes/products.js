const express = require('express');
const Product = require('../models/Product');
const { auth, requireRole } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const router = express.Router();

// GET all products — any authenticated user (retailer or customer)
router.get('/', auth, async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPLOAD product image to Cloudinary — retailer only
router.post('/upload', auth, requireRole('retailer'), (req, res, next) => {
  console.log('Upload request received from user:', req.user._id);
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('Multer/Cloudinary error:', err);
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    console.log('File uploaded to Cloudinary:', req.file?.path);
    next();
  });
}, (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  res.json({ imageUrl: req.file.path });
});

// CREATE product — retailer only
router.post('/', auth, requireRole('retailer'), async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE product — retailer only
router.put('/:id', auth, requireRole('retailer'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE product — retailer only
router.delete('/:id', auth, requireRole('retailer'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
