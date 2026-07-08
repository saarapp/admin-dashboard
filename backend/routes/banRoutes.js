// ============================================
// routes/banRoutes.js - مسارات الحظر
// ============================================

const express = require('express');
const router = express.Router();
const BanController = require('../controllers/banController');
const AuthMiddleware = require('../middlewares/authMiddleware');

router.use(AuthMiddleware.verifyToken);

// إحصائيات
router.get('/stats', BanController.getBanStats);

// جلب جميع المحظورين
router.get('/', BanController.getAllBans);

// جلب حظر الكابتن
router.get('/captain/:captainId', BanController.getCaptainBans);

// جلب حظر واحد
router.get('/:id', BanController.getBanById);

// إنشاء حظر
router.post('/', BanController.createBan);

// فك الحظر
router.put('/:id/lift', BanController.liftBan);

module.exports = router;