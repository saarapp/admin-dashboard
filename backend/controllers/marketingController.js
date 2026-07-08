// ============================================
// controllers/marketingController.js - التحكم بـ التسويق
// ============================================

const marketingService = require('../services/marketingService');
const Captain = require('../models/Captain');
const fs = require('fs');
const path = require('path');

class MarketingController {
  // إرسال رسالة لكل الكابتنات
  static async sendToAllCaptains(req, res) {
    try {
      const { message, totalHours } = req.body;

      if (!message) {
        return res.status(400).json({
          status: 'error',
          message: 'الرسالة مطلوبة'
        });
      }

      // جلب كل الكابتنات
      const captains = await Captain.getAll();

      if (captains.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'لا يوجد كابتنات'
        });
      }

      const phoneNumbers = captains.map(c => c.phone_number);

      // إنشاء الحملة
      const campaign = marketingService.createCampaign(
        'رسالة لجميع الكابتنات',
        message,
        phoneNumbers,
        totalHours || 12
      );

      // تشغيل الحملة بالخلفية
      marketingService.runCampaign(campaign.id)
        .then(() => console.log(`✅ اكتملت الحملة: ${campaign.id}`))
        .catch((err) => console.error(`❌ خطأ في الحملة: ${err.message}`));

      res.json({
        status: 'success',
        message: `تم بدء إرسال الرسالة لـ ${phoneNumbers.length} كابتن`,
        data: {
          campaignId: campaign.id,
          totalNumbers: phoneNumbers.length,
          estimatedHours: totalHours || 12
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إرسال رسالة من ملف CSV
  static async sendFromCSV(req, res) {
    try {
      const { numbers, message, totalHours } = req.body;

      if (!numbers || !message) {
        return res.status(400).json({
          status: 'error',
          message: 'الأرقام والرسالة مطلوبة'
        });
      }

      // إنشاء الحملة
      const campaign = marketingService.createCampaign(
        'حملة من ملف CSV',
        message,
        numbers,
        totalHours || 12
      );

      // تشغيل الحملة بالخلفية
      marketingService.runCampaign(campaign.id)
        .then(() => console.log(`✅ اكتملت الحملة: ${campaign.id}`))
        .catch((err) => console.error(`❌ خطأ في الحملة: ${err.message}`));

      res.json({
        status: 'success',
        message: `تم بدء إرسال الرسالة لـ ${numbers.length} رقم`,
        data: {
          campaignId: campaign.id,
          totalNumbers: numbers.length,
          estimatedHours: totalHours || 12
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // فحص الأرقام (بيها واتساب أو لا)
  static async checkNumbers(req, res) {
    try {
      const { numbers } = req.body;

      if (!numbers || numbers.length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'الأرقام مطلوبة'
        });
      }

      const results = await marketingService.checkWhatsappNumbers(numbers);

      res.json({
        status: 'success',
        data: {
          total: numbers.length,
          hasWhatsapp: results.hasWhatsapp.length,
          noWhatsapp: results.noWhatsapp.length,
          numbers: results
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب جميع الحملات
  static async getAllCampaigns(req, res) {
    try {
      const campaigns = marketingService.getAllCampaigns();

      res.json({
        status: 'success',
        data: campaigns
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // جلب حملة واحدة
  static async getCampaign(req, res) {
    try {
      const { id } = req.params;
      const campaign = marketingService.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({
          status: 'error',
          message: 'الحملة غير موجودة'
        });
      }

      res.json({
        status: 'success',
        data: campaign
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  // إيقاف حملة
  static async stopCampaign(req, res) {
    try {
      const { id } = req.params;
      const stopped = marketingService.stopCampaign(id);

      if (stopped) {
        res.json({
          status: 'success',
          message: 'تم إيقاف الحملة'
        });
      } else {
        res.status(400).json({
          status: 'error',
          message: 'الحملة غير قابلة للإيقاف'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
}

module.exports = MarketingController;