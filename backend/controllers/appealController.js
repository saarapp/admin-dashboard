// ============================================
// controllers/appealController.js - التحكم بـ الطعون
// ============================================

const Appeal = require('../models/Appeal');
const Record = require('../models/Record');
const Captain = require('../models/Captain');
const Notification = require('../models/Notification');
const whatsappService = require('../services/whatsappService');

class AppealController {
  // جلب جميع الطعون
  static async getAllAppeals(req, res) {
    try {
      const appeals = await Appeal.getAll();

      res.json({
        status: 'success',
        data: appeals
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب طعن واحد
  static async getAppealById(req, res) {
    try {
      const { id } = req.params;
      const appeal = await Appeal.getById(id);

      res.json({
        status: 'success',
        data: appeal
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب الطعون حسب الحالة
  static async getAppealsByStatus(req, res) {
    try {
      const { status } = req.query;

      let appeals;
      if (status && ['pending', 'approved', 'rejected'].includes(status)) {
        appeals = await Appeal.getByStatus(status);
      } else {
        appeals = await Appeal.getAll();
      }

      res.json({
        status: 'success',
        data: appeals
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إحصائيات الطعون
  static async getAppealStats(req, res) {
    try {
      const stats = await Appeal.getStats();

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

  // قبول الطعن (استرداد المبلغ + رسالة اعتذار)
  static async approveAppeal(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // جلب الطعن
      const appeal = await Appeal.getById(id);

      if (!appeal) {
        return res.status(404).json({
          status: 'error',
          message: 'الطعن غير موجود'
        });
      }

      if (appeal.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'تم معالجة هذا الطعن مسبقاً'
        });
      }

      // قبول الطعن
      await Appeal.approve(id, userId);

      // إنشاء سجل تعويض (إرجاع المبلغ)
      if (appeal.records?.amount) {
        await Record.create({
          captain_id: appeal.captain_id,
          record_type: 'compensation',
          amount: appeal.records.amount,
          reason: 'استرداد بسبب قبول الطعن',
          created_by: userId,
          notes: `طعن مقبول - رقم الطعن: ${id}`
        });
      }

      // إرسال رسالة قبول الطعن
const message = `مرحباً عزيزي ${appeal.captains?.name}

✅ تم قبول الطعن المقدم من قبلك.

تمت مراجعة طلبك، وقد تم اتخاذ الإجراءات التالية:
• فك الحظر عن حسابك (إن وجد).
• استرداد المبلغ المخصوم (إن وجد).

نعتذر عن أي إزعاج، ونتمنى لك التوفيق.

فريق صار - قسم المتابعه و الحسابات`;

      AppealController.sendAppealMessage(appeal.captain_phone, message)
        .then(() => console.log('✅ تم إرسال رسالة قبول الطعن'))
        .catch((err) => console.error('خطأ في إرسال رسالة الطعن:', err.message));

      res.json({
        status: 'success',
        message: 'تم قبول الطعن واسترداد المبلغ وإرسال رسالة اعتذار'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // رفض الطعن (رسالة رفض)
  static async rejectAppeal(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // جلب الطعن
      const appeal = await Appeal.getById(id);

      if (!appeal) {
        return res.status(404).json({
          status: 'error',
          message: 'الطعن غير موجود'
        });
      }

      if (appeal.status !== 'pending') {
        return res.status(400).json({
          status: 'error',
          message: 'تم معالجة هذا الطعن مسبقاً'
        });
      }

      // رفض الطعن
      await Appeal.reject(id, userId);

     // إرسال رسالة رفض
const message = `مرحباً عزيزي ${appeal.captains?.name}

❌ نعتذر لإبلاغك بأنه تم رفض الطعن المقدم من قبلك.

بعد مراجعة الطلب، تقرر تثبيت الإجراء المتخذ بحق حسابك، ويُعد هذا القرار نهائياً.

شكراً لتفهمك.

فريق صار - قسم المتابعه و الحسابات`;

      AppealController.sendAppealMessage(appeal.captain_phone, message)
        .then(() => console.log('✅ تم إرسال رسالة رفض الطعن'))
        .catch((err) => console.error('خطأ في إرسال رسالة الطعن:', err.message));

      res.json({
        status: 'success',
        message: 'تم رفض الطعن وإرسال رسالة للكابتن'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // معالجة رسائل الواتساب الواردة (كلمة "طعن")
  static async handleIncomingAppeal(phoneNumber, messageBody) {
    try {
      // التحقق من أن الرسالة هي "طعن"
      if (!messageBody.trim().includes('طعن')) return false;

      // تنسيق الرقم
      let formattedPhone = phoneNumber.replace('@c.us', '').replace(/[+\s\-()]/g, '');

      // تنسيق الرقم الوارد
      if (formattedPhone.startsWith('00')) formattedPhone = formattedPhone.substring(2);
      if (formattedPhone.startsWith('0')) formattedPhone = '964' + formattedPhone.substring(1);
      if (!formattedPhone.startsWith('964')) formattedPhone = '964' + formattedPhone;

      // البحث عن الكابتن
      const captains = await Captain.getAll();
      const captain = captains.find(c => {
        let captainPhone = c.phone_number.replace(/[+\s\-()]/g, '');
        if (captainPhone.startsWith('00')) captainPhone = captainPhone.substring(2);
        if (captainPhone.startsWith('0')) captainPhone = '964' + captainPhone.substring(1);
        if (!captainPhone.startsWith('964')) captainPhone = '964' + captainPhone;
        return captainPhone === formattedPhone;
      });

      if (!captain) {
        console.log('❌ لم يتم العثور على الكابتن:', formattedPhone);
        console.log('الأرقام الموجودة:', captains.map(c => c.phone_number));
        return false;
      }

      console.log('✅ تم العثور على الكابتن:', captain.name, captain.phone_number);

      if (!captain) {
        console.log('❌ لم يتم العثور على الكابتن:', formattedPhone);
        return false;
      }

      const Ban = require('../models/Ban');

      // أولاً: البحث عن حظر نشط يقبل الطعن
      const activeBans = await Ban.getActiveByCaptain(captain.id);
      const activeBan = activeBans.find(b => {
        if (!b.appeal_allowed) return false;
        if (!b.appeal_deadline) return true;
        return new Date(b.appeal_deadline) > new Date();
      });

      // ثانياً: البحث عن خصم خلال 24 ساعة
      const records = await Record.getByCaptain(captain.id);
      const yesterday = new Date();
      yesterday.setHours(yesterday.getHours() - 24);

      const recentDeduction = records.find(r => 
        r.record_type === 'deduction' && 
        new Date(r.created_at) > yesterday
      );

      // إذا لا يوجد حظر ولا خصم
if (!activeBan && !recentDeduction) {
  const noRecordMsg = 'مرحباً عزيزي،\n\n'
    + 'لا يوجد حالياً خصم أو حظر يمكنك تقديم طعن بشأنه، أو أن مدة تقديم الطعن قد انتهت.\n\n'
    + 'فريق صار - قسم الحسابات';
    
  await whatsappService.sendMessageWithLoadBalance(formattedPhone, noRecordMsg);
  return true;
}


      // تحديد نوع الطعن (حظر أو خصم)
      var appealRecordId = null;
      var appealType = '';

      if (activeBan) {
        // طعن على الحظر
        appealRecordId = activeBan.id;
        appealType = 'ban';

        // التحقق من عدم وجود طعن سابق
        const existingAppeal = await Appeal.getByRecord(activeBan.id);
        if (existingAppeal) {
          const alreadyMsg = 'لقد قمت بتقديم طعن مسبقاً على هذا الحظر. سنعلمك بمجرد اتخاذ القرار.';
          await whatsappService.sendMessageWithLoadBalance(formattedPhone, alreadyMsg);
          return true;
        }
      } else {
        // طعن على الخصم
        appealRecordId = recentDeduction.id;
        appealType = 'deduction';

        // التحقق من عدم وجود طعن سابق
        const existingAppeal = await Appeal.getByRecord(recentDeduction.id);
        if (existingAppeal) {
          const alreadyMsg = 'لقد قمت بتقديم طعن مسبقاً على هذا الخصم. سنعلمك بمجرد اتخاذ القرار.';
          await whatsappService.sendMessageWithLoadBalance(formattedPhone, alreadyMsg);
          return true;
        }
      }

      // إنشاء الطعن
      var expiresAt = new Date();
      if (activeBan) {
        // مهلة الطعن حسب الحظر (48 ساعة أو 3 أيام)
        if (activeBan.duration_days <= 7) {
          expiresAt.setHours(expiresAt.getHours() + 48);
        } else {
          expiresAt.setDate(expiresAt.getDate() + 3);
        }
      } else {
        expiresAt.setHours(expiresAt.getHours() + 24);
      }

     var appealData = {
        captain_id: captain.id,
        captain_phone: formattedPhone,
        appeal_message: messageBody + (appealType === 'ban' ? ' (طعن على حظر)' : ' (طعن على خصم)'),
        appeal_type: appealType,
        status: 'pending',
        expires_at: expiresAt
      };

      if (appealType === 'ban') {
        appealData.ban_id = appealRecordId;
      } else {
        appealData.record_id = appealRecordId;
      }

      await Appeal.create(appealData);

      // إرسال رسالة تأكيد
      const confirmMsg = 'تم تحويل طلبك إلى القسم المختص.\n\nنرجو عدم إرسال رسائل إضافية.\n\nسنعلمك بمجرد اتخاذ القرار.';
      await whatsappService.sendMessageWithLoadBalance(formattedPhone, confirmMsg);

      console.log(`✅ تم تسجيل طعن من الكابتن: ${captain.name}`);
      return true;
    } catch (error) {
      console.error('خطأ في معالجة الطعن:', error);
      return false;
    }
  }

  // إرسال رسالة الطعن (دالة مساعدة)
  static async sendAppealMessage(phoneNumber, message) {
    await whatsappService.sendMessageWithLoadBalance(phoneNumber, message);
  }
}

module.exports = AppealController;