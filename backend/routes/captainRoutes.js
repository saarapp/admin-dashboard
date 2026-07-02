// ============================================
// routes/captainRoutes.js - مسارات الكابتنات
// ============================================

const express = require('express');
const router = express.Router();
const CaptainController = require('../controllers/captainController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع مسارات الكابتنات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.requireAccountant);

// جلب جميع الكابتنات
router.get('/', CaptainController.getAllCaptains);

// البحث عن كابتن
router.get('/search', CaptainController.searchCaptain);

// جلب سجل الكابتن الكامل
router.get('/:id/record', CaptainController.getCaptainRecord);

// جلب كابتن واحد
router.get('/:id', CaptainController.getCaptainById);

// إضافة كابتن جديد (مدير فقط)
router.post('/', AuthMiddleware.requireAdmin, CaptainController.addCaptain);

// تحديث الكابتن (مدير فقط)
router.put('/:id', AuthMiddleware.requireAdmin, CaptainController.updateCaptain);

// حذف الكابتن (مدير فقط)
router.delete('/:id', AuthMiddleware.requireAdmin, CaptainController.deleteCaptain);

module.exports = router;