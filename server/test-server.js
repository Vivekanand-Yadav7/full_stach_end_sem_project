require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const { MongoMemoryServer } = require('mongodb-memory-server');

require('./config/passport');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cors());
  app.use(morgan('dev'));
  app.use(passport.initialize());

  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/dashboard', dashboardRoutes);

  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri);
  console.log('Connected to In-Memory MongoDB');

  const PORT = 5000;
  app.listen(PORT, () => console.log(`Test server running on port ${PORT}`));
}

startServer().catch(err => console.error(err));
