// ============================================
// routes/appealRoutes.js - مسارات الطعون
// ============================================

const express = require('express');
const router = express.Router();
const AppealController = require('../controllers/appealController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع المسارات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);

// جلب جميع الطعون
router.get('/', AppealController.getAppealsByStatus);

// جلب إحصائيات الطعون
router.get('/stats', AppealController.getAppealStats);

// جلب طعن واحد
router.get('/:id', AppealController.getAppealById);

// قبول الطعن (استرداد + اعتذار)
router.put('/:id/approve', AppealController.approveAppeal);

// رفض الطعن
router.put('/:id/reject', AppealController.rejectAppeal);

module.exports = router;