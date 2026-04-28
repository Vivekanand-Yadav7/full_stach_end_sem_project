const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role
    const validRoles = ['retailer', 'customer'];
    const userRole = validRoles.includes(role) ? role : 'customer';

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists with this email' });

    user = new User({ name, email, password, role: userRole });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Google OAuth login route
router.get('/google', (req, res, next) => {
  const role = req.query.role || 'customer';
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    state: role
  })(req, res, next);
});

// Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Generate token
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '7d' });
    const userObj = { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role, avatar: req.user.avatar };
    
    // Redirect to frontend with token
    // Note: ensure CLIENT_URL is set in your .env file
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userObj))}`);
  }
);

// Update Avatar
router.put('/avatar', auth, (req, res, next) => {
  upload.single('avatar')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message || 'Avatar upload failed' });
    }
    next();
  });
}, async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.avatar = req.file.path;
    await user.save();
    res.json({ avatar: user.avatar });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
