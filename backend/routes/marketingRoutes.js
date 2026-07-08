// ============================================
// routes/marketingRoutes.js - مسارات التسويق
// ============================================

const express = require('express');
const router = express.Router();
const MarketingController = require('../controllers/marketingController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع المسارات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.requireAdmin);

// إرسال لكل الكابتنات
router.post('/send-all', MarketingController.sendToAllCaptains);

// إرسال من ملف CSV
router.post('/send-csv', MarketingController.sendFromCSV);

// فحص الأرقام
router.post('/check-numbers', MarketingController.checkNumbers);

// جلب جميع الحملات
router.get('/campaigns', MarketingController.getAllCampaigns);

// جلب حملة واحدة
router.get('/campaigns/:id', MarketingController.getCampaign);

// إيقاف حملة
router.put('/campaigns/:id/stop', MarketingController.stopCampaign);

module.exports = router;