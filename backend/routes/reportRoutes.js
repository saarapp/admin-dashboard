// ============================================
// routes/reportRoutes.js - مسارات التقارير
// ============================================

const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع المسارات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);

// تقرير يومي
router.get('/daily', ReportController.getDailyReport);

// تقرير شهري
router.get('/monthly', ReportController.getMonthlyReport);

module.exports = router;