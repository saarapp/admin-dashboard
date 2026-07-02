// ============================================
// server.js - الملف الرئيسي للخادم
// ============================================

const express = require('express');
const cors = require('cors');
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
// استيراد الـ Middlewares
const ErrorHandler = require('./middlewares/errorHandler');

// ============================================
// إعدادات الخادم
// ============================================

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares عام
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// اختبار الاتصال
// ============================================

app.get('/api/health', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact' });

    if (error) {
      return res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed',
        error: error.message 
      });
    }

    res.json({ 
      status: 'ok', 
      message: 'Server is running',
      timestamp: new Date()
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

app.use('/api/auth', authRoutes);
app.use('/api/captains', captainRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/appeals', appealRoutes);
app.use('/api/reports', reportRoutes);
// ============================================
// معالج المسارات غير الموجودة
// ============================================

app.use(ErrorHandler.notFound);

// ============================================
// معالج الأخطاء العام
// ============================================

app.use(ErrorHandler.handleError);

// ============================================
// تشغيل الخادم
// ============================================

app.listen(PORT, async () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ الخادم يعمل على: http://localhost:${PORT}`);
  console.log(`${'='.repeat(50)}`);
  console.log(`\n📍 المسارات المتاحة:`);
  console.log(`  🔐 POST   /api/auth/login`);
  console.log(`  🔐 GET    /api/auth/verify`);
  console.log(`  👨 GET    /api/captains`);
  console.log(`  👨 POST   /api/captains`);
  console.log(`  📋 GET    /api/records`);
  console.log(`  📋 POST   /api/records`);
  console.log(`  📢 GET    /api/notifications`);
  console.log(`  ⚙️  GET    /api/settings`);
  console.log(`\n🔗 اختبر الاتصال: http://localhost:${PORT}/api/health\n`);

  // استعادة جلسات الواتساب تلقائياً
  const whatsappService = require('./services/whatsappService');
  await whatsappService.restoreSessions();
});
module.exports = app;