// ============================================
// controllers/notificationController.js - التحكم بـ الإشعارات
// ============================================

const Notification = require('../models/Notification');

class NotificationController {
  // جلب جميع الإشعارات
  static async getAllNotifications(req, res) {
    try {
      const notifications = await Notification.getAll();

      res.json({
        status: 'success',
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب إشعار واحد
  static async getNotificationById(req, res) {
    try {
      const { id } = req.params;
      const notification = await Notification.getById(id);

      res.json({
        status: 'success',
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب إشعارات السجل الواحد
  static async getRecordNotifications(req, res) {
    try {
      const { recordId } = req.params;
      const notifications = await Notification.getByRecord(recordId);

      res.json({
        status: 'success',
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب الإشعارات حسب الحالة
  static async getNotificationsByStatus(req, res) {
    try {
      const { status } = req.query;

      if (!status || !['pending', 'sent', 'failed', 'delivered'].includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'حالة الإشعار غير صحيحة'
        });
      }

      const notifications = await Notification.getByStatus(status);

      res.json({
        status: 'success',
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب إشعارات الكابتن الواحد
  static async getCaptainNotifications(req, res) {
    try {
      const { captainPhone } = req.params;
      const notifications = await Notification.getByCaptainPhone(captainPhone);

      res.json({
        status: 'success',
        data: notifications
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تحديث حالة الإشعار
  static async updateNotificationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'sent', 'failed', 'delivered'].includes(status)) {
        return res.status(400).json({
          status: 'error',
          message: 'حالة الإشعار غير صحيحة'
        });
      }

      const updatedNotification = await Notification.updateStatus(
        id,
        status,
        new Date()
      );

      res.json({
        status: 'success',
        message: 'تم تحديث حالة الإشعار',
        data: updatedNotification
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تحديث الإشعار برسالة خطأ
  static async updateNotificationError(req, res) {
    try {
      const { id } = req.params;
      const { errorMessage } = req.body;

      const updatedNotification = await Notification.updateError(id, errorMessage);

      res.json({
        status: 'success',
        message: 'تم تحديث رسالة الخطأ',
        data: updatedNotification
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // حذف إشعار
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      await Notification.delete(id);

      res.json({
        status: 'success',
        message: 'تم حذف الإشعار بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إحصائيات الإشعارات
  static async getNotificationStats(req, res) {
    try {
      const stats = await Notification.getStats();

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
}

module.exports = NotificationController;