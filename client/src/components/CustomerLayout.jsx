import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, ClipboardList, LogOut, Package, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AvatarUpload from './AvatarUpload';

const CustomerLayout = ({ children }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Shop', icon: <ShoppingBag size={20} />, path: '/shop' },
    { name: 'My Orders', icon: <ClipboardList size={20} />, path: '/my-orders' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-main">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-primary/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <Package size={26} />
            <span>InvenOrder</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl font-semibold text-sm transition-all ${
                  location.pathname === item.path
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-slate-600 hover:bg-primary/5 hover:text-primary'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-700">{user?.name}</p>
              <p className="text-xs text-blue-500 font-medium">Customer</p>
            </div>
            <AvatarUpload position="top" />
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-primary"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-primary/10 px-4 py-3 flex gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-semibold text-sm transition-all ${
                  location.pathname === item.path
                    ? 'bg-primary text-white'
                    : 'text-slate-600 hover:bg-primary/5'
                }`}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default CustomerLayout;
