// ============================================
// server.js - الملف الرئيسي (Production Ready)
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
const PORT = process.env.PORT || 5000;

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
// Middlewares العامة
// ============================================

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}));

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
  console.log(`\n📍 المسارات المتاحة:`);
  console.log(`  🔐 POST   /api/auth/login`);
  console.log(`  👨 GET    /api/captains`);
  console.log(`  📋 GET    /api/records`);
  console.log(`  📢 GET    /api/notifications`);
  console.log(`  ⚙️  GET    /api/settings`);
  console.log(`  📱 GET    /api/whatsapp`);
  console.log(`  ⚖️  GET    /api/appeals`);
  console.log(`  📊 GET    /api/reports`);
  console.log(`  📢 GET    /api/marketing`);
  console.log(`  🎫 GET    /api/tickets`);
  console.log(`  💬 GET    /api/messages`);
  console.log(`\n🔗 اختبر الاتصال: http://localhost:${PORT}/api/health\n`);

  // استعادة جلسات الواتساب تلقائياً
  const whatsappService = require('./services/whatsappService');
  await whatsappService.restoreSessions();
});

module.exports = app;