import axios from 'axios';

// تحديد الرابط تلقائياً: إذا كنت لوكل يقرأ الـ localhost، وإذا أونلاين يقرأ سيرفر Render مع الـ /api
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API_URL = isLocalhost 
  ? 'http://localhost:5000/api' 
  : 'http://13.140.130.186:5000';

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