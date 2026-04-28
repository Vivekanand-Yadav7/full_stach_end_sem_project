import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { oauthLogin } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        oauthLogin(token, user);
        navigate(user.role === 'retailer' ? '/dashboard' : '/shop');
      } catch (e) {
        console.error('Failed to parse OAuth user', e);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, oauthLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-blue-500" size={40} />
        <p className="text-slate-600 font-medium">Completing secure sign in...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
