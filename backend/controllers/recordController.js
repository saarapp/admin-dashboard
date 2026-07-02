// ============================================
// controllers/recordController.js - التحكم بـ السجلات
// ============================================

const Record = require('../models/Record');
const Captain = require('../models/Captain');
const MessageTemplate = require('../models/MessageTemplate');
const Notification = require('../models/Notification');
const WhatsappNumber = require('../models/WhatsappNumber');
const whatsappService = require('../services/whatsappService');// هنا يتم استدعاء خدمة الواتساب الخاصة بك
class RecordController {
  // جلب جميع السجلات
  static async getAllRecords(req, res) {
    try {
      const records = await Record.getAll();

      res.json({
        status: 'success',
        data: records
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب سجل واحد
  static async getRecordById(req, res) {
    try {
      const { id } = req.params;
      const record = await Record.getById(id);

      res.json({
        status: 'success',
        data: record
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب سجلات الكابتن الواحد
  static async getCaptainRecords(req, res) {
    try {
      const { captainId } = req.params;
      const records = await Record.getByCaptain(captainId);

      res.json({
        status: 'success',
        data: records
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب السجلات حسب النوع
  static async getRecordsByType(req, res) {
    try {
      const { type } = req.query;

      if (!type || !['warning', 'deduction', 'compensation'].includes(type)) {
        return res.status(400).json({
          status: 'error',
          message: 'نوع السجل غير صحيح'
        });
      }

      const records = await Record.getByType(type);

      res.json({
        status: 'success',
        data: records
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إنشاء سجل جديد (إنذار/خصم/تعويض)
  static async createRecord(req, res) {
    try {
      const { captain_id, record_type, amount, reason, notes, template_id } = req.body;
      const userId = req.user.id; // من Middleware للمصادقة

      // التحقق من المدخلات
      if (!captain_id || !record_type) {
        return res.status(400).json({
          status: 'error',
          message: 'معرف الكابتن ونوع السجل مطلوبان'
        });
      }

      if (!['warning', 'deduction', 'compensation'].includes(record_type)) {
        return res.status(400).json({
          status: 'error',
          message: 'نوع السجل غير صحيح'
        });
      }

      // إذا كان خصم أو تعويض يجب أن يكون هناك مبلغ
      if (['deduction', 'compensation'].includes(record_type) && !amount) {
        return res.status(400).json({
          status: 'error',
          message: 'المبلغ مطلوب للخصم والتعويض'
        });
      }

      // التحقق من وجود الكابتن
      const captain = await Captain.getById(captain_id);
      if (!captain) {
        return res.status(404).json({
          status: 'error',
          message: 'الكابتن غير موجود'
        });
      }

      // إنشاء السجل
      const newRecord = await Record.create({
        captain_id,
        record_type,
        amount: amount || null,
        reason: reason || null,
        created_by: userId,
        notes: notes || null
      });

     // إرسال الرسالة بالخلفية (بدون انتظار)
      RecordController.sendWhatsappMessage(newRecord, captain, record_type, template_id)
        .then(() => console.log('✅ تم إرسال الرسالة بنجاح'))
        .catch((err) => console.error('خطأ في إرسال الواتساب:', err.message));

      res.json({
        status: 'success',
        message: 'تم إنشاء السجل بنجاح',
        data: newRecord
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تحديث سجل
  static async updateRecord(req, res) {
    try {
      const { id } = req.params;
      const { amount, reason, notes } = req.body;

      const updatedRecord = await Record.update(id, {
        amount,
        reason,
        notes
      });

      res.json({
        status: 'success',
        message: 'تم تحديث السجل',
        data: updatedRecord
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // حذف سجل
  static async deleteRecord(req, res) {
    try {
      const { id } = req.params;

      await Record.delete(id);

      res.json({
        status: 'success',
        message: 'تم حذف السجل بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إحصائيات عامة
  static async getStats(req, res) {
    try {
      const stats = await Record.getGlobalStats();

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

  // إرسال رسالة الواتساب (دالة داخلية)
  static async sendWhatsappMessage(record, captain, recordType, templateId) {
    try {
      let messageData;

      // إذا اختار رسالة محددة
      if (templateId) {
        messageData = await MessageTemplate.getProcessedMessageById(templateId, {
          captain_name: captain.name,
          amount: record.amount || '',
          reason: record.reason || '',
          date: new Date().toLocaleDateString('ar-IQ')
        });
      } else {
        messageData = await MessageTemplate.getProcessedMessage(recordType, {
          captain_name: captain.name,
          amount: record.amount || '',
          reason: record.reason || '',
          date: new Date().toLocaleDateString('ar-IQ')
        });
      }

      // إنشاء إشعار
      const notification = await Notification.create({
        record_id: record.id,
        captain_phone: captain.phone_number,
        message_content: messageData.messageContent,
        message_type: recordType,
        status: 'pending'
      });

      // إرسال عن طريق الواتساب
      await whatsappService.sendMessageWithLoadBalance(
        captain.phone_number,
        messageData.messageContent
      );

      // تحديث حالة الإشعار
      await Notification.updateStatus(
        notification.id, 
        'sent', 
        new Date()
      );

      return notification;
    } catch (error) {
      console.error('خطأ في إرسال الواتساب:', error);
      throw error;
    }
  }
  }
 
module.exports = RecordController;