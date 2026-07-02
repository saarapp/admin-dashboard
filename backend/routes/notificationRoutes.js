// ============================================
// routes/notificationRoutes.js - مسارات الإشعارات
// ============================================

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع مسارات الإشعارات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);
router.use(AuthMiddleware.requireAccountant);

// جلب جميع الإشعارات
router.get('/', NotificationController.getAllNotifications);

// جلب الإشعارات حسب الحالة
router.get('/status', NotificationController.getNotificationsByStatus);

// جلب إحصائيات الإشعارات
router.get('/stats', NotificationController.getNotificationStats);

// جلب إشعارات الكابتن
router.get('/captain/:captainPhone', NotificationController.getCaptainNotifications);

// جلب إشعارات السجل
router.get('/record/:recordId', NotificationController.getRecordNotifications);

// جلب إشعار واحد
router.get('/:id', NotificationController.getNotificationById);

// تحديث حالة الإشعار
router.put('/:id/status', NotificationController.updateNotificationStatus);

// تحديث رسالة خطأ
router.put('/:id/error', NotificationController.updateNotificationError);

// حذف إشعار
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;