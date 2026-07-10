// ============================================
// controllers/whatsappController.js - التحكم بـ الواتساب
// ============================================

const whatsappService = require('../services/whatsappService');

class WhatsappController {
  // إنشاء جلسة جديدة
  static async createSession(req, res) {
    try {
      const { sessionId, phoneNumber } = req.body;

      if (!sessionId || !phoneNumber) {
        return res.status(400).json({
          status: 'error',
          message: 'معرف الجلسة ورقم الهاتف مطلوبان'
        });
      }

      const result = await whatsappService.createSession(sessionId, phoneNumber);

      res.json({
        status: 'success',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب QR Code
  static async getQRCode(req, res) {
    try {
      const { sessionId } = req.params;
      const qrCode = whatsappService.getQRCode(sessionId);
      const status = whatsappService.getStatus(sessionId);

      res.json({
        status: 'success',
        data: {
          sessionStatus: status,
          qrCode: qrCode
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب حالة الجلسة
  static async getSessionStatus(req, res) {
    try {
      const { sessionId } = req.params;
      const status = whatsappService.getStatus(sessionId);

      res.json({
        status: 'success',
        data: { sessionStatus: status }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب جميع الجلسات
  static async getAllSessions(req, res) {
    try {
      const sessions = whatsappService.getAllSessions();

      res.json({
        status: 'success',
        data: sessions
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
      const { sessionId, phoneNumber, message } = req.body;

      if (!phoneNumber || !message) {
        return res.status(400).json({
          status: 'error',
          message: 'رقم الهاتف والرسالة مطلوبان'
        });
      }

      let result;

      if (sessionId) {
        result = await whatsappService.sendMessage(sessionId, phoneNumber, message);
      } else {
        result = await whatsappService.sendMessageWithLoadBalance(phoneNumber, message);
      }

      res.json({
        status: 'success',
        message: 'تم إرسال الرسالة بنجاح',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إرسال رسالة اختبارية
  static async sendTestMessage(req, res) {
    try {
      let { sessionId, phoneNumber } = req.body;

      if (!phoneNumber) {
        return res.status(400).json({
          status: 'error',
          message: 'رقم الهاتف مطلوب'
        });
      }

      // 👈 الحل السحري: إذا الجلسة المرسلة مو شغالة، نجيب أول جلسة متصلة وشغالة هسة بالسيرفر تلقائياً
      if (!sessionId || !whatsappService.isSessionConnected(sessionId)) {
        const activeSessions = whatsappService.getActiveSessions ? whatsappService.getActiveSessions() : [];
        if (activeSessions && activeSessions.length > 0) {
          sessionId = activeSessions[0]; // أخذ أول جلسة شغالة بالخلفية
        }
      }

      const result = await whatsappService.sendMessage(
        sessionId,
        phoneNumber,
        '✅ رسالة اختبارية من لوحة التحكم - نظام تكسي صار يعمل بنجاح تام! 🚀'
      );

      res.json({
        status: 'success',
        message: 'تم إرسال الرسالة الاختبارية بنجاح',
        data: result
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إغلاق جلسة
  static async closeSession(req, res) {
    try {
      const { sessionId } = req.params;

      await whatsappService.closeSession(sessionId);

      res.json({
        status: 'success',
        message: 'تم إغلاق الجلسة بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = WhatsappController;