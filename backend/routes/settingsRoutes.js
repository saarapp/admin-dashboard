// ============================================
// routes/settingsRoutes.js - مسارات الإعدادات
// ============================================

const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/settingsController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع مسارات الإعدادات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);

// ============================================
// الرسائل المخصصة
// ============================================

// جلب جميع الرسائل
router.get('/messages', SettingsController.getMessageTemplates);

// جلب الرسائل حسب النوع
router.get('/messages/type/:type', SettingsController.getMessagesByType);

// جلب رسالة واحدة
router.get('/messages/:id', SettingsController.getMessageTemplate);

// إضافة رسالة جديدة (مدير فقط)
router.post('/messages', AuthMiddleware.requireAdmin, SettingsController.addMessageTemplate);

// تحديث رسالة (مدير فقط)
router.put('/messages/:id', AuthMiddleware.requireAdmin, SettingsController.updateMessageTemplate);

// حذف رسالة (مدير فقط)
router.delete('/messages/:id', AuthMiddleware.requireAdmin, SettingsController.deleteMessageTemplate);
// ============================================
// أرقام الواتساب
// ============================================

// جلب جميع الأرقام (مدير فقط)
router.get('/whatsapp', AuthMiddleware.requireAdmin, SettingsController.getWhatsappNumbers);

// جلب الأرقام النشطة
router.get('/whatsapp/active', SettingsController.getActiveWhatsappNumbers);

// إضافة رقم جديد (مدير فقط)
router.post('/whatsapp', AuthMiddleware.requireAdmin, SettingsController.addWhatsappNumber);

// تحديث رقم (مدير فقط)
router.put('/whatsapp/:id', AuthMiddleware.requireAdmin, SettingsController.updateWhatsappNumber);

// تفعيل/تعطيل رقم (مدير فقط)
router.patch('/whatsapp/:id/toggle', AuthMiddleware.requireAdmin, SettingsController.toggleWhatsappNumber);

// حذف رقم (مدير فقط)
router.delete('/whatsapp/:id', AuthMiddleware.requireAdmin, SettingsController.deleteWhatsappNumber);

// ============================================
// الموظفين
// ============================================

// جلب جميع الموظفين (مدير فقط)
router.get('/users', AuthMiddleware.requireAdmin, SettingsController.getAllUsers);

// إضافة موظف جديد (مدير فقط)
router.post('/users', AuthMiddleware.requireAdmin, SettingsController.addUser);

// تحديث الموظف (مدير فقط)
router.put('/users/:id', AuthMiddleware.requireAdmin, SettingsController.updateUser);

// حذف موظف (مدير فقط)
router.delete('/users/:id', AuthMiddleware.requireAdmin, SettingsController.deleteUser);

module.exports = router;