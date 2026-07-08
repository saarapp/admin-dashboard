// ============================================
// controllers/banController.js - التحكم بـ الحظر
// ============================================

const Ban = require('../models/Ban');
const Captain = require('../models/Captain');
const whatsappService = require('../services/whatsappService');

class BanController {
  // جلب جميع المحظورين
  static async getAllBans(req, res) {
    try {
      var status = req.query.status;

      // تحديث المنتهية أولاً
      await Ban.updateExpired();

      var bans;
      if (status === 'active') {
        bans = await Ban.getActive();
      } else {
        bans = await Ban.getAll();
      }

      // حساب الوقت المتبقي لكل حظر
      bans = bans.map(function(ban) {
        var now = new Date();
        var end = new Date(ban.ban_end);
        var remaining = end - now;

        ban.remaining_ms = remaining > 0 ? remaining : 0;
        ban.remaining_days = remaining > 0 ? Math.ceil(remaining / (1000 * 60 * 60 * 24)) : 0;
        ban.remaining_hours = remaining > 0 ? Math.ceil(remaining / (1000 * 60 * 60)) : 0;
        ban.is_expired = remaining <= 0;

        return ban;
      });

      res.json({
        status: 'success',
        data: bans
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب حظر واحد
  static async getBanById(req, res) {
    try {
      var id = req.params.id;
      var ban = await Ban.getById(id);

      res.json({
        status: 'success',
        data: ban
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إنشاء حظر جديد
  static async createBan(req, res) {
    try {
      var { captain_id, captain_name, captain_phone, reason, duration_days } = req.body;
      var userId = req.user.id;

      if (!captain_id || !captain_name || !captain_phone || !duration_days) {
        return res.status(400).json({
          status: 'error',
          message: 'جميع الحقول مطلوبة'
        });
      }

      // حساب تاريخ النهاية
      var banEnd = new Date();
      banEnd.setDate(banEnd.getDate() + parseInt(duration_days));

      // حساب مهلة الطعن (48 ساعة أو 3 أيام حسب المدة)
      var appealDeadline = new Date();
      if (duration_days <= 7) {
        appealDeadline.setHours(appealDeadline.getHours() + 48);
      } else {
        appealDeadline.setDate(appealDeadline.getDate() + 3);
      }

      var ban = await Ban.create({
        captain_id: captain_id,
        captain_name: captain_name,
        captain_phone: captain_phone,
        reason: reason || 'مخالفة',
        duration_days: parseInt(duration_days),
        ban_end: banEnd,
        status: 'active',
        appeal_allowed: true,
        appeal_deadline: appealDeadline,
        created_by: userId
      });

      // تحديث حالة الكابتن
      await Captain.update(captain_id, { status: 'inactive' });

      // إرسال رسالة واتساب
      var durationText = '';
      if (duration_days == 3) durationText = '3 أيام';
      else if (duration_days == 7) durationText = 'أسبوع';
      else if (duration_days == 30) durationText = 'شهر';
      else durationText = duration_days + ' يوم';

      var appealText = '';
      if (duration_days <= 7) {
        appealText = '\n\nيمكنك تقديم طعن خلال 48 ساعة بإرسال كلمة "طعن"';
      } else {
        appealText = '\n\nيمكنك تقديم طعن خلال 3 أيام بإرسال كلمة "طعن"';
      }

      // إرسال رسالة واتساب
var banMessage = 'مرحباً عزيزي ' + captain_name + '\n\n'
  + '🚫 تم حظر حسابك في تطبيق صار.\n'
  + '📅 مدة الحظر: ' + durationText + '\n'
  + '📝 سبب الحظر: ' + (reason || 'مخالفة') + '\n'
  + '⏰ ينتهي الحظر بتاريخ: ' + banEnd.toLocaleDateString('ar-IQ')
  + appealText
  + '\n\n'
  + 'فريق صار - قسم الحسابات';

// تسجيل الإشعار
      var Notification = require('../models/Notification');
      var notification = await Notification.create({
        record_id: ban.id,
        captain_phone: captain_phone,
        message_content: banMessage,
        message_type: 'warning',
        status: 'pending'
      });

      // إرسال الرسالة
      whatsappService.sendMessageWithLoadBalance(captain_phone, banMessage)
        .then(function() {
          console.log('✅ تم إرسال رسالة الحظر');
          Notification.updateStatus(notification.id, 'sent', new Date());
        })
        .catch(function(err) {
          console.error('خطأ في إرسال رسالة الحظر:', err.message);
          Notification.updateError(notification.id, err.message);
        });

      res.json({
        status: 'success',
        message: 'تم حظر الكابتن وإرسال رسالة',
        data: ban
      });

    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // فك الحظر
  static async liftBan(req, res) {
    try {
      var id = req.params.id;
      var userId = req.user.id;

      var ban = await Ban.getById(id);

      if (!ban) {
        return res.status(404).json({
          status: 'error',
          message: 'الحظر غير موجود'
        });
      }

      // فك الحظر
      await Ban.lift(id, userId);

      // تحديث حالة الكابتن
      await Captain.update(ban.captain_id, { status: 'active' });

      // إرسال رسالة واتساب
var liftMessage = 'مرحباً عزيزي ' + ban.captain_name + '\n\n'
  + '🎉 مبروك، تم فك حظر حسابك من تطبيق صار.\n'
  + 'يمكنك الآن مواصلة استخدام التطبيق بكل سهولة.\n\n'
  + 'مع تمنياتنا لك بالتوفيق.\n'
  + 'فريق صار - قسم الحسابات';

      // تسجيل الإشعار
      var Notification = require('../models/Notification');
      var notification = await Notification.create({
        record_id: ban.id,
        captain_phone: ban.captain_phone,
        message_content: liftMessage,
        message_type: 'compensation',
        status: 'pending'
      });

      // إرسال الرسالة
      whatsappService.sendMessageWithLoadBalance(ban.captain_phone, liftMessage)
        .then(function() {
          console.log('✅ تم إرسال رسالة فك الحظر');
          Notification.updateStatus(notification.id, 'sent', new Date());
        })
        .catch(function(err) {
          console.error('خطأ في إرسال رسالة فك الحظر:', err.message);
          Notification.updateError(notification.id, err.message);
        });

      res.json({
        status: 'success',
        message: 'تم فك الحظر وإرسال رسالة للكابتن'
      });
      
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إحصائيات
  static async getBanStats(req, res) {
    try {
      await Ban.updateExpired();
      var stats = await Ban.getStats();

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

  // جلب حظر الكابتن
  static async getCaptainBans(req, res) {
    try {
      var captainId = req.params.captainId;
      var bans = await Ban.getActiveByCaptain(captainId);

      res.json({
        status: 'success',
        data: bans
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إرسال رسالة (دالة مساعدة)
  static sendBanMessage(phoneNumber, message) {
    whatsappService.sendMessageWithLoadBalance(phoneNumber, message)
      .then(function() { console.log('✅ تم إرسال رسالة الحظر'); })
      .catch(function(err) { console.error('خطأ في إرسال رسالة الحظر:', err.message); });
  }
}

module.exports = BanController;