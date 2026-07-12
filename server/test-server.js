require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const prisma = require('./config/prisma');

require('./config/passport');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const smartSearchRoutes = require('./routes/smartSearch');

const path = require('path');

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(morgan('dev'));
  app.use('/images', express.static(path.join(__dirname, 'public/images')));
  app.use(passport.initialize());

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/smart-search', smartSearchRoutes);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  
  // Test DB connection
  await prisma.$connect();
  console.log('Connected to PostgreSQL via Prisma');

  const PORT = 5000;
  app.listen(PORT, () => console.log(`Test server running on port ${PORT}`));
}

startServer().catch(err => console.error(err));
