import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Mail, Lock, User, Store, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await register(name, email, password, role);
      navigate(user.role === 'retailer' ? '/' : '/shop');
    } catch (err) {
      setError(err.response?.data?.message || 'Error creating account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-md !p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg mb-4">
            <Package size={32} />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Choose your account type to get started</p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              role === 'customer'
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-slate-200 bg-white/50 text-slate-500 hover:border-slate-300'
            }`}
          >
            <User size={28} />
            <div className="text-center">
              <p className="font-bold text-sm">Customer</p>
              <p className="text-[10px] opacity-70">Browse & order products</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setRole('retailer')}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
              role === 'retailer'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-slate-200 bg-white/50 text-slate-500 hover:border-slate-300'
            }`}
          >
            <Store size={28} />
            <div className="text-center">
              <p className="font-bold text-sm">Retailer</p>
              <p className="text-[10px] opacity-70">Manage & sell inventory</p>
            </div>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-sm mb-4 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                className="input-field pl-12"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                className="input-field pl-12"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                className="input-field pl-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : `Create ${role === 'retailer' ? 'Retailer' : 'Customer'} Account`}
          </button>
        </form>

        <div className="my-6 flex items-center before:flex-1 before:border-t before:border-slate-200 after:flex-1 after:border-t after:border-slate-200">
          <span className="px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">or sign up with</span>
        </div>

        <button
          type="button"
          onClick={() => window.location.href = `http://localhost:5000/api/auth/google?role=${role}`}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 transition-colors font-bold text-slate-700 shadow-sm"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="text-center mt-6 text-slate-500 text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
