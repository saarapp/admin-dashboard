// ============================================
// controllers/messageController.js - التحكم بـ الدردشة الداخلية
// ============================================

const InternalMessage = require('../models/InternalMessage');
const User = require('../models/User');

class MessageController {
  // جلب محادثات المستخدم الحالي
  static async getMyConversations(req, res) {
    try {
      const userId = req.user.id;
      const conversations = await InternalMessage.getUserConversations(userId);

      res.json({
        status: 'success',
        data: conversations
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب المحادثة مع شخص معين
  static async getConversation(req, res) {
    try {
      const userId = req.user.id;
      const { otherUserId } = req.params;

      const messages = await InternalMessage.getConversation(userId, otherUserId);

      // تحديد الرسائل كمقروءة
      await InternalMessage.markAsRead(otherUserId, userId);

      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب رسائل التكت
  static async getTicketMessages(req, res) {
    try {
      const { ticketId } = req.params;
      const messages = await InternalMessage.getByTicket(ticketId);

      res.json({
        status: 'success',
        data: messages
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إرسال رسالة
  static async sendMessage(req, res) {
    try {
      const userId = req.user.id;
      const { receiver_id, message, ticket_id } = req.body;

      if (!receiver_id || !message) {
        return res.status(400).json({
          status: 'error',
          message: 'المستلم والرسالة مطلوبان'
        });
      }

      const newMessage = await InternalMessage.create({
        sender_id: userId,
        receiver_id,
        message,
        ticket_id: ticket_id || null
      });

      res.json({
        status: 'success',
        message: 'تم إرسال الرسالة',
        data: newMessage
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // عدد الرسائل غير المقروءة
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;
      const count = await InternalMessage.getUnreadCount(userId);

      res.json({
        status: 'success',
        data: { unread: count }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب جميع المستخدمين (للدردشة)
  static async getAvailableUsers(req, res) {
    try {
      const userId = req.user.id;
      const users = await User.getAll();

      const availableUsers = users
        .filter(u => u.id !== userId && u.is_active)
        .map(u => ({
          id: u.id,
          full_name: u.full_name,
          role: u.role,
          city: u.city
        }));

      res.json({
        status: 'success',
        data: availableUsers
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = MessageController;