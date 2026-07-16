import axios from 'axios';

// Use VITE_API_URL if defined, otherwise fallback to '/api' for production, 
// or localhost:5000/api for local development if not served by same origin
const isProd = import.meta.env.PROD;
const baseURL = import.meta.env.VITE_API_URL || (isProd ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL,
});

export const getBaseUrl = () => isProd ? '' : 'http://localhost:5000';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
