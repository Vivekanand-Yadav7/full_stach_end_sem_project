import React, { useRef, useState, useEffect } from 'react';
import { Loader2, LogOut, Camera, MapPin, User as UserIcon } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const AvatarUpload = ({ position = 'top' }) => {
  const { user, updateUser, logout } = useAuth();
  const { addNotification } = useNotification();
  const [uploading, setUploading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    setUploading(true);
    setIsOpen(false);
    try {
      const res = await api.put('/auth/avatar', formData);
      const newAvatar = res.data.avatar;
      
      const updatedUser = { ...user, avatar: newAvatar };
      updateUser(updatedUser);
      addNotification('Profile picture updated!');
    } catch (err) {
      console.error('Upload Error:', err.response?.data || err);
      addNotification(err.response?.data?.message || err.message || 'Failed to upload profile picture', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'user'}`;

  return (
    <div className="relative shrink-0" ref={menuRef}>
      {/* Avatar Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-all bg-white shadow-sm focus:outline-none"
      >
        {uploading ? (
          <div className="w-full h-full flex items-center justify-center bg-slate-100">
            <Loader2 className="animate-spin text-primary" size={18} />
          </div>
        ) : (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        )}
      </button>

      {/* Hidden File Input */}
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
      />

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className={`absolute w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-[100] ${
            position === 'bottom' 
              ? 'bottom-full mb-3 left-0' 
              : 'top-full mt-3 right-0'
          }`}
        >
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <p className="font-bold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <div className="p-2 space-y-1">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors"
            >
              <Camera size={16} />
              <span>Edit Profile Picture</span>
            </button>
            <button 
              onClick={() => { setIsOpen(false); addNotification('Edit Profile coming soon!', 'info'); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors"
            >
              <UserIcon size={16} />
              <span>Edit Profile</span>
            </button>
            {user?.role === 'customer' && (
              <button 
                onClick={() => { setIsOpen(false); addNotification('Address management coming soon!', 'info'); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:bg-primary/5 hover:text-primary rounded-xl transition-colors"
              >
                <MapPin size={16} />
                <span>Delivery Address</span>
              </button>
            )}
          </div>
          <div className="p-2 border-t border-slate-100">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors font-medium"
            >
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarUpload;
