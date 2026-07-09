// ============================================
// server.js - الملف الرئيسي (Production Ready - Fixed CORS)
// ============================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();
const supabase = require('./config/supabase');

// استيراد الـ Routes
const authRoutes = require('./routes/authRoutes');
const captainRoutes = require('./routes/captainRoutes');
const recordRoutes = require('./routes/recordRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const appealRoutes = require('./routes/appealRoutes');
const reportRoutes = require('./routes/reportRoutes');
const marketingRoutes = require('./routes/marketingRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const messageRoutes = require('./routes/messageRoutes');
const banRoutes = require('./routes/banRoutes');

// استيراد الـ Middlewares
const ErrorHandler = require('./middlewares/errorHandler');

// ============================================
// إعدادات الخادم
// ============================================

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8080; // افتراضي 8080 ليتوافق مع ريلوي

// ============================================
// الحماية والأداء
// ============================================

// حماية HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// ضغط الاستجابات (تسريع التحميل)
app.use(compression());

// تسجيل الطلبات
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// حد الطلبات (منع الهجمات)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 500, // حد أقصى 500 طلب
  message: {
    status: 'error',
    message: 'كثرة الطلبات! حاول بعد 15 دقيقة'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// حد تسجيل الدخول (حماية من brute force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    status: 'error',
    message: 'كثرة محاولات تسجيل الدخول! حاول بعد 15 دقيقة'
  }
});

// حد الواتساب
const whatsappLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة
  max: 200,
  message: {
    status: 'error',
    message: 'تم تجاوز حد إرسال الرسائل!'
  }
});

// ============================================
// ============================================
// Middlewares العامة (حل CORS النهائي والمجرب للإنتاج)
// ============================================

app.use(cors({
  origin: [
    'https://admin-dashboard-git-main-saar1.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:8080'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// إجبار السيرفر على الرد مباشرة بالموافقة على طلبات الـ Preflight قبل دخول الـ Routes
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// تطبيق حد الطلبات على API
app.use('/api/', apiLimiter);

// ============================================
// اختبار الاتصال
// ============================================

app.get('/api/health', async (req, res) => {
  try {
    const startTime = Date.now();

    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' });

    const dbTime = Date.now() - startTime;

    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        error: error.message
      });
    }

    const memUsage = process.memoryUsage();

    res.json({
      status: 'ok',
      message: 'Server is running',
      timestamp: new Date(),
      uptime: Math.floor(process.uptime()) + ' seconds',
      dbResponseTime: dbTime + 'ms',
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ============================================
// ربط الـ Routes
// ============================================

app.use('/api/auth', loginLimiter, authRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/whatsapp', whatsappLimiter, whatsappRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/marketing', marketingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/bans', banRoutes);

// ============================================
// معالج المسارات غير الموجودة
// ============================================

app.use(ErrorHandler.notFound);

// ============================================
// معالج الأخطاء العام
// ============================================

app.use(ErrorHandler.handleError);

// ============================================
// معالج الأخطاء غير المتوقعة
// ============================================

process.on('uncaughtException', (err) => {
  console.error('❌ خطأ غير متوقع:', err.message);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ وعد مرفوض:', reason);
});

// ============================================
// تشغيل الخادم
// ============================================

app.listen(PORT, async () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ الخادم يعمل على: http://localhost:${PORT}`);
  console.log(`🌍 البيئة: ${process.env.NODE_ENV || 'development'}`);
  console.log(`${'='.repeat(50)}`);
  
  // استعادة جلسات الواتساب تلقائياً
  try {
    const whatsappService = require('./services/whatsappService');
    await whatsappService.restoreSessions();
  } catch (e) {
    console.error('⚠️ فشل استعادة جلسات الواتساب عند الإقلاع:', e.message);
  }
});

module.exports = app;