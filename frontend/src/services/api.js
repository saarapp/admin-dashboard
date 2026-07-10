import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// 👈 أونلاين نخليه يضرب على نفس الدومين الآمن بدون بورت وبدون IP، وفيرسيل تحوله بالخلفية لـ Contabo
const API_URL = isLocalhost 
  ? 'http://localhost:5000/api' 
  : '/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// الحفاظ على حقن التوكن (Authorization) تلقائياً مع كل طلب لـ تكسي صار
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// التعامل مع انتهاء صلاحية التوكن وتوجيه المستخدم للـ Login
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