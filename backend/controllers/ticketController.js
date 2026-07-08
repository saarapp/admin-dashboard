// ============================================
// controllers/ticketController.js - التحكم بـ التكتات
// ============================================

const Ticket = require('../models/Ticket');
const User = require('../models/User');
const whatsappService = require('../services/whatsappService');

class TicketController {
  // جلب جميع التكتات
  static async getAllTickets(req, res) {
    try {
      const { status } = req.query;
      let tickets;

      if (status) {
        tickets = await Ticket.getByStatus(status);
      } else {
        tickets = await Ticket.getAll();
      }

      res.json({
        status: 'success',
        data: tickets
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
// جلب التكتات المحولة للوكيل
  static async getDeputyTickets(req, res) {
    try {
      const userId = req.user.id;
      const supabase = require('../config/supabase');

      const { data, error } = await supabase
        .from('tickets')
        .select('*, created_by_user:users!tickets_created_by_fkey(full_name, city), responded_by_user:users!tickets_responded_by_fkey(full_name), deputy:users!tickets_deputy_id_fkey(full_name)')
        .eq('deputy_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      res.json({
        status: 'success',
        data: data
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
  // جلب تكتات الموظف الحالي
  static async getMyTickets(req, res) {
    try {
      const userId = req.user.id;
      const tickets = await Ticket.getByUser(userId);

      res.json({
        status: 'success',
        data: tickets
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب تكت واحد
  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Ticket.getById(id);

      res.json({
        status: 'success',
        data: ticket
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إنشاء تكت جديد
  static async createTicket(req, res) {
    try {
      const { captain_name, captain_phone, case_type, description, priority } = req.body;
      const userId = req.user.id;

      if (!captain_name || !captain_phone || !case_type || !description) {
        return res.status(400).json({
          status: 'error',
          message: 'جميع الحقول مطلوبة'
        });
      }

      const ticket = await Ticket.create({
        created_by: userId,
        captain_name,
        captain_phone,
        case_type,
        description,
        priority: priority || 'normal',
        status: 'pending'
      });

      res.json({
        status: 'success',
        message: 'تم إنشاء التكت بنجاح',
        data: ticket
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // المدير يراجع التكت
  static async reviewTicket(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await Ticket.update(id, {
        status: 'under_review',
        responded_by: userId
      });

      res.json({
        status: 'success',
        message: 'تم بدء مراجعة التكت'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

 // تحويل للوكيل
  static async sendToDeputy(req, res) {
    try {
      const { id } = req.params;
      const { deputy_id } = req.body;
      const userId = req.user.id;

      if (!deputy_id) {
        return res.status(400).json({
          status: 'error',
          message: 'معرف الوكيل مطلوب'
        });
      }

      const ticket = await Ticket.getById(id);

      await Ticket.update(id, {
        status: 'deputy_review',
        deputy_id
      });

      // إرسال إشعار داخلي للوكيل
      const InternalMessage = require('../models/InternalMessage');
      await InternalMessage.create({
        sender_id: userId,
        receiver_id: deputy_id,
        message: '🎫 تم تحويل تكت إليك للمراجعة\n\n📋 تكت رقم: #' + ticket.ticket_number + '\n👤 الكابتن: ' + ticket.captain_name + '\n📱 الرقم: ' + ticket.captain_phone + '\n📝 الحالة: ' + ticket.description,
        ticket_id: id
      });

      res.json({
        status: 'success',
        message: 'تم تحويل التكت للوكيل وإرسال إشعار'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // رد الوكيل
  static async deputyResponse(req, res) {
    try {
      const { id } = req.params;
      const { deputy_response } = req.body;

      if (!deputy_response) {
        return res.status(400).json({
          status: 'error',
          message: 'رد الوكيل مطلوب'
        });
      }

      await Ticket.update(id, {
        deputy_response,
        deputy_responded_at: new Date(),
        status: 'under_review'
      });

      res.json({
        status: 'success',
        message: 'تم إرسال رد الوكيل'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // قبول التكت
  static async approveTicket(req, res) {
    try {
      const { id } = req.params;
      const { admin_response } = req.body;
      const userId = req.user.id;

      const ticket = await Ticket.getById(id);

      await Ticket.update(id, {
        status: 'approved',
        admin_response: admin_response || 'تم القبول',
        responded_by: userId,
        responded_at: new Date()
      });

      // إرسال رسالة واتساب للكابتن
const approveMsg = `مرحباً عزيزي ${ticket.captain_name}

✅ تم قبول طلبك.

📋 رد الإدارة:
${admin_response || 'تم قبول الطلب.'}

نتمنى منك الالتزام بتعليمات وسياسات تطبيق صار، والالتزام بالتسعيرة المحددة داخل التطبيق وتقديم أفضل خدمة للزبائن، وذلك لتجنب أي مخالفات أو إجراءات قد تؤثر على حسابك مستقبلاً.

شكراً لتعاونك.

فريق صار`;


      TicketController.sendTicketMessage(ticket.captain_phone, approveMsg);

      res.json({
        status: 'success',
        message: 'تم قبول التكت وإرسال رسالة للكابتن'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // رفض التكت
  static async rejectTicket(req, res) {
    try {
      const { id } = req.params;
      const { admin_response } = req.body;
      const userId = req.user.id;

      const ticket = await Ticket.getById(id);

      await Ticket.update(id, {
        status: 'rejected',
        admin_response: admin_response || 'تم الرفض',
        responded_by: userId,
        responded_at: new Date()
      });

      // إرسال رسالة واتساب للكابتن
const rejectMsg = `مرحباً عزيزي ${ticket.captain_name}

❌ نعتذر، تم رفض طلبك.

📋 رد الإدارة:
${admin_response || 'تم رفض الطلب.'}

يرجى الالتزام بتعليمات وسياسات تطبيق صار، والالتزام بالتسعيرة المحددة داخل التطبيق وتقديم أفضل خدمة للزبائن، وذلك لتجنب تكرار المخالفات مستقبلاً.

هذا القرار نهائي.

شكراً لتفهمك.

فريق صار`;

      TicketController.sendTicketMessage(ticket.captain_phone, rejectMsg);

      res.json({
        status: 'success',
        message: 'تم رفض التكت وإرسال رسالة للكابتن'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إحصائيات التكتات
  static async getTicketStats(req, res) {
    try {
      const stats = await Ticket.getStats();

      res.json({
        status: 'success',
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إرسال رسالة واتساب (دالة مساعدة)
  static sendTicketMessage(phoneNumber, message) {
    whatsappService.sendMessageWithLoadBalance(phoneNumber, message)
      .then(() => console.log('✅ تم إرسال رسالة التكت'))
      .catch((err) => console.error('خطأ في إرسال رسالة التكت:', err.message));
  }
}

module.exports = TicketController;