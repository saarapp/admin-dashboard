// ============================================
// controllers/captainController.js - التحكم بـ الكابتنات
// ============================================

const Captain = require('../models/Captain');
const Record = require('../models/Record');

class CaptainController {
  // جلب جميع الكابتنات
  static async getAllCaptains(req, res) {
    try {
      const captains = await Captain.getAll();

      res.json({
        status: 'success',
        data: captains
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب كابتن واحد
  static async getCaptainById(req, res) {
    try {
      const { id } = req.params;
      const captain = await Captain.getById(id);

      res.json({
        status: 'success',
        data: captain
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // البحث عن كابتن بـ الاسم
  static async searchCaptain(req, res) {
    try {
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({
          status: 'error',
          message: 'اسم الكابتن مطلوب'
        });
      }

      const captains = await Captain.searchByName(name);

      res.json({
        status: 'success',
        data: captains
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إضافة كابتن جديد
  static async addCaptain(req, res) {
    try {
      const { name, phone_number, id_number } = req.body;

      if (!name || !phone_number) {
        return res.status(400).json({
          status: 'error',
          message: 'الاسم ورقم الهاتف مطلوبان'
        });
      }

      const newCaptain = await Captain.create({
        name,
        phone_number,
        id_number: id_number || null,
        status: 'active'
      });

      res.json({
        status: 'success',
        message: 'تم إضافة الكابتن بنجاح',
        data: newCaptain
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // تحديث بيانات الكابتن
  static async updateCaptain(req, res) {
    try {
      const { id } = req.params;
      const { name, phone_number, id_number, status } = req.body;

      const updatedCaptain = await Captain.update(id, {
        name,
        phone_number,
        id_number,
        status
      });

      res.json({
        status: 'success',
        message: 'تم تحديث بيانات الكابتن',
        data: updatedCaptain
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب سجل الكابتن الكامل
  static async getCaptainRecord(req, res) {
    try {
      const { id } = req.params;

      // الحصول على بيانات الكابتن
      const captain = await Captain.getById(id);

      // جلب السجلات
      const records = await Captain.getRecords(id);

      // الحصول على الإحصائيات
      const stats = await Record.getCaptainStats(id);

      // الحصول على الرصيد
      const balance = await Captain.getBalance(id);

      res.json({
        status: 'success',
        data: {
          captain,
          records,
          stats,
          balance
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // حذف كابتن
  static async deleteCaptain(req, res) {
    try {
      const { id } = req.params;

      await Captain.delete(id);

      res.json({
        status: 'success',
        message: 'تم حذف الكابتن بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = CaptainController;