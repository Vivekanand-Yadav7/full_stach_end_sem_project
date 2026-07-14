require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

// Load Passport config
require('./config/passport');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const smartSearchRoutes = require('./routes/smartSearch');
const recommendRoutes = require('./routes/recommend');

const app = express();

const path = require('path');

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/smart-search', smartSearchRoutes);
app.use('/api/recommend', recommendRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

