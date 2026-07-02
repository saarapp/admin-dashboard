// ============================================
// controllers/settingsController.js - التحكم بـ الإعدادات
// ============================================

const MessageTemplate = require('../models/MessageTemplate');
const WhatsappNumber = require('../models/WhatsappNumber');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

class SettingsController {
  // ============================================
  // إدارة الرسائل المخصصة
  // ============================================

  // جلب جميع الرسائل
  static async getMessageTemplates(req, res) {
    try {
      const templates = await MessageTemplate.getAll();

      res.json({
        status: 'success',
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب رسالة واحدة
  static async getMessageTemplate(req, res) {
    try {
      const { id } = req.params;
      const template = await MessageTemplate.getById(id);

      res.json({
        status: 'success',
        data: template
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب رسالة حسب النوع
  static async getMessageByType(req, res) {
    try {
      const { type } = req.params;

      const template = await MessageTemplate.getByType(type);

      res.json({
        status: 'success',
        data: template
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إضافة رسالة جديدة
  static async addMessageTemplate(req, res) {
    try {
      const { message_type, title, message_content } = req.body;
      const userId = req.user.id;

      if (!message_type || !title || !message_content) {
        return res.status(400).json({
          status: 'error',
          message: 'نوع الرسالة والعنوان والمحتوى مطلوبان'
        });
      }

      if (!['warning', 'deduction', 'compensation'].includes(message_type)) {
        return res.status(400).json({
          status: 'error',
          message: 'نوع الرسالة غير صحيح'
        });
      }

      const newTemplate = await MessageTemplate.create({
        message_type,
        title,
        message_content,
        variables: ['captain_name', 'amount', 'reason', 'date'],
        created_by: userId
      });

      res.json({
        status: 'success',
        message: 'تم إضافة الرسالة بنجاح',
        data: newTemplate
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تحديث رسالة
  static async updateMessageTemplate(req, res) {
    try {
      const { id } = req.params;
      const { title, message_content } = req.body;

      const updatedTemplate = await MessageTemplate.update(id, {
        title,
        message_content
      });

      res.json({
        status: 'success',
        message: 'تم تحديث الرسالة بنجاح',
        data: updatedTemplate
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // حذف رسالة
  static async deleteMessageTemplate(req, res) {
    try {
      const { id } = req.params;

      await MessageTemplate.delete(id);

      res.json({
        status: 'success',
        message: 'تم حذف الرسالة بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب الرسائل حسب النوع
  static async getMessagesByType(req, res) {
    try {
      const { type } = req.params;
      const templates = await MessageTemplate.getByType(type);

      res.json({
        status: 'success',
        data: templates
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

// ============================================
  // إدارة أرقام الواتساب
  // ============================================

  // جلب جميع أرقام الواتساب
  static async getWhatsappNumbers(req, res) {
    try {
      const numbers = await WhatsappNumber.getAll();

      res.json({
        status: 'success',
        data: numbers
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
  // جلب الأرقام النشطة فقط
  static async getActiveWhatsappNumbers(req, res) {
    try {
      const numbers = await WhatsappNumber.getActive();

      res.json({
        status: 'success',
        data: numbers
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إضافة رقم واتساب جديد
  static async addWhatsappNumber(req, res) {
    try {
      const { phone_number, api_key } = req.body;

      if (!phone_number) {
        return res.status(400).json({
          status: 'error',
          message: 'رقم الهاتف مطلوب'
        });
      }

      const newNumber = await WhatsappNumber.create({
        phone_number,
        api_key: api_key || null,
        is_active: true,
        load_balance: 0,
        total_sent: 0
      });

      res.json({
        status: 'success',
        message: 'تم إضافة رقم الواتساب بنجاح',
        data: newNumber
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تحديث رقم واتساب
  static async updateWhatsappNumber(req, res) {
    try {
      const { id } = req.params;
      const { api_key, is_active } = req.body;

      const updatedNumber = await WhatsappNumber.update(id, {
        api_key,
        is_active
      });

      res.json({
        status: 'success',
        message: 'تم تحديث رقم الواتساب',
        data: updatedNumber
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تفعيل/تعطيل رقم واتساب
  static async toggleWhatsappNumber(req, res) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      let updatedNumber;
      if (is_active) {
        updatedNumber = await WhatsappNumber.activate(id);
      } else {
        updatedNumber = await WhatsappNumber.deactivate(id);
      }

      res.json({
        status: 'success',
        message: is_active ? 'تم تفعيل الرقم' : 'تم تعطيل الرقم',
        data: updatedNumber
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // حذف رقم واتساب
  static async deleteWhatsappNumber(req, res) {
    try {
      const { id } = req.params;

      await WhatsappNumber.delete(id);

      res.json({
        status: 'success',
        message: 'تم حذف رقم الواتساب بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // ============================================
  // إدارة الموظفين
  // ============================================

  // جلب جميع الموظفين
  static async getAllUsers(req, res) {
    try {
      const users = await User.getAll();

      // إخفاء كلمات المرور
      const usersWithoutPasswords = users.map(user => {
        delete user.password_hash;
        return user;
      });

      res.json({
        status: 'success',
        data: usersWithoutPasswords
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إضافة موظف جديد
  static async addUser(req, res) {
    try {
      const { email, password, full_name, role } = req.body;

      if (!email || !password || !full_name || !role) {
        return res.status(400).json({
          status: 'error',
          message: 'جميع الحقول مطلوبة'
        });
      }

      if (!['admin', 'accountant'].includes(role)) {
        return res.status(400).json({
          status: 'error',
          message: 'الدور غير صحيح'
        });
      }

      // تشفير كلمة المرور
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        email,
        password_hash: passwordHash,
        full_name,
        role,
        is_active: true
      });

      delete newUser.password_hash;

      res.json({
        status: 'success',
        message: 'تم إضافة الموظف بنجاح',
        data: newUser
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تحديث بيانات الموظف
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { full_name, role, is_active } = req.body;

      const updatedUser = await User.update(id, {
        full_name,
        role,
        is_active
      });

      delete updatedUser.password_hash;

      res.json({
        status: 'success',
        message: 'تم تحديث بيانات الموظف',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // حذف موظف
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      await User.delete(id);

      res.json({
        status: 'success',
        message: 'تم حذف الموظف بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = SettingsController;