import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Retailer pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Orders from './pages/Orders';

// Customer pages
import CustomerLayout from './components/CustomerLayout';
import Shop from './pages/Shop';
import MyOrders from './pages/MyOrders';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import OAuthCallback from './pages/OAuthCallback';

// ─── Route Guards ──────────────────────────────────────────

/** Retailer-only protected route */
const RetailerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'retailer') return <Navigate to="/shop" />;
  return <Layout>{children}</Layout>;
};

/** Customer-only protected route */
const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'customer') return <Navigate to="/" />;
  return <CustomerLayout>{children}</CustomerLayout>;
};

/** Smart root redirect based on role */
const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return user.role === 'retailer' ? <Navigate to="/dashboard" /> : <Navigate to="/shop" />;
};

// ─── App ───────────────────────────────────────────────────

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/oauth-callback" element={<OAuthCallback />} />

            {/* Role-aware root */}
            <Route path="/" element={<RootRedirect />} />

            {/* Retailer routes */}
            <Route path="/dashboard" element={<RetailerRoute><Dashboard /></RetailerRoute>} />
            <Route path="/products" element={<RetailerRoute><Products /></RetailerRoute>} />
            <Route path="/orders" element={<RetailerRoute><Orders /></RetailerRoute>} />

            {/* Customer routes */}
            <Route path="/shop" element={<CustomerRoute><Shop /></CustomerRoute>} />
            <Route path="/my-orders" element={<CustomerRoute><MyOrders /></CustomerRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
