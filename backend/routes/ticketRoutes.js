// ============================================
// routes/ticketRoutes.js - مسارات التكتات
// ============================================

const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع المسارات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);

// جلب تكتاتي
router.get('/my', TicketController.getMyTickets);

// إحصائيات
router.get('/stats', TicketController.getTicketStats);

// جلب جميع التكتات (مدير فقط)
router.get('/', AuthMiddleware.requireAdmin, TicketController.getAllTickets);

// جلب تكت واحد
router.get('/:id', TicketController.getTicketById);

// إنشاء تكت
router.post('/', TicketController.createTicket);

// مراجعة التكت (مدير فقط)
router.put('/:id/review', AuthMiddleware.requireAdmin, TicketController.reviewTicket);

// تحويل للوكيل (مدير فقط)
router.put('/:id/deputy', AuthMiddleware.requireAdmin, TicketController.sendToDeputy);

// رد الوكيل
router.put('/:id/deputy-response', TicketController.deputyResponse);

// قبول (مدير فقط)
router.put('/:id/approve', AuthMiddleware.requireAdmin, TicketController.approveTicket);

// رفض (مدير فقط)
router.put('/:id/reject', AuthMiddleware.requireAdmin, TicketController.rejectTicket);

module.exports = router;