// ============================================
// routes/whatsappRoutes.js - مسارات الواتساب
// ============================================

const express = require('express');
const router = express.Router();
const WhatsappController = require('../controllers/whatsappController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع المسارات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);

// إنشاء جلسة جديدة (مدير فقط)
router.post('/session', AuthMiddleware.requireAdmin, WhatsappController.createSession);

// جلب QR Code
router.get('/session/:sessionId/qr', WhatsappController.getQRCode);

// جلب حالة الجلسة
router.get('/session/:sessionId/status', WhatsappController.getSessionStatus);

// جلب جميع الجلسات
router.get('/sessions', WhatsappController.getAllSessions);

// إرسال رسالة
router.post('/send', WhatsappController.sendMessage);

// إرسال رسالة اختبارية
router.post('/send-test', WhatsappController.sendTestMessage);

// إغلاق جلسة (مدير فقط)
router.delete('/session/:sessionId', AuthMiddleware.requireAdmin, WhatsappController.closeSession);

module.exports = router;