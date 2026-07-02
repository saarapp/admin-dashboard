// ============================================
// routes/authRoutes.js - مسارات المصادقة
// ============================================

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// تسجيل الدخول
router.post('/login', AuthController.login);

// التحقق من الـ Token
router.get('/verify', AuthMiddleware.verifyToken, AuthController.verify);

module.exports = router;