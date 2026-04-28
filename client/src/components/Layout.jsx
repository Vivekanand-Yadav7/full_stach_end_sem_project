import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AvatarUpload from './AvatarUpload';

const Sidebar = ({ isOpen, toggle }) => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Products', icon: <Package size={20} />, path: '/products' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
      <div className="flex flex-col h-full">
        <div className="p-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package size={32} />
            <span>InvenOrder</span>
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${location.pathname === item.path ? 'bg-white/20 shadow-lg' : 'hover:bg-white/10'}`}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <div className="flex items-center gap-3 w-full px-2 py-3">
            <AvatarUpload position="bottom" />
            <div className="flex-1 truncate hidden sm:block text-sm font-medium opacity-90">{user?.name}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white/50 backdrop-blur-sm p-4 lg:hidden">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-primary">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>
        
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
