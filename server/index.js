require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');
const { execSync } = require('child_process');
const prisma = require('./config/prisma');

// Load Passport config
require('./config/passport');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const dashboardRoutes = require('./routes/dashboard');
const smartSearchRoutes = require('./routes/smartSearch');
const recommendRoutes = require('./routes/recommend');

const app = express();

// CORS — restrict to CLIENT_URL in production, open in dev
const corsOptions = {
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
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

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../client/dist');
  app.use(express.static(distPath));
  // All non-API routes → React app (client-side routing)
  // Note: Express v5 requires /{*path} instead of * for wildcards
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

async function startServer() {
  try {
    // Run DB migrations automatically on startup
    if (process.env.NODE_ENV === 'production') {
      console.log('Running Prisma migrations...');
      execSync('npx prisma migrate deploy', {
        cwd: __dirname,
        stdio: 'inherit',
      });
    }

    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
