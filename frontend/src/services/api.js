import axios from 'axios';
import axios from 'axios';

// قراءة الرابط من متغيرات البيئة وإضافة /api بالنهاية
const API_URL = isLocalhost 
  ? 'http://localhost:5000/api' 
  : 'http://13.140.130.186/api'; // 👈 شلنا البورت 5000 لأن الـ Nginx صار يوجهه تلقائياً
  
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;