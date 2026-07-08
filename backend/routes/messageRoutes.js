// ============================================
// routes/messageRoutes.js - مسارات الدردشة الداخلية
// ============================================

const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/messageController');
const AuthMiddleware = require('../middlewares/authMiddleware');

// جميع المسارات تحتاج مصادقة
router.use(AuthMiddleware.verifyToken);

// جلب محادثاتي
router.get('/conversations', MessageController.getMyConversations);

// عدد غير المقروءة
router.get('/unread', MessageController.getUnreadCount);

// جلب المستخدمين المتاحين
router.get('/users', MessageController.getAvailableUsers);

// جلب رسائل التكت
router.get('/ticket/:ticketId', MessageController.getTicketMessages);

// جلب المحادثة مع شخص
router.get('/:otherUserId', MessageController.getConversation);

// إرسال رسالة
router.post('/', MessageController.sendMessage);

module.exports = router;