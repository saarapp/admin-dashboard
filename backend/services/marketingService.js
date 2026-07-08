// ============================================
// services/marketingService.js - خدمة التسويق
// ============================================

const whatsappService = require('./whatsappService');

class MarketingService {
  constructor() {
    this.campaigns = {};
    this.campaignCounter = 0;
  }

  // تنويع الرسالة لتفادي الحظر
  varyMessage(message, index) {
    const variations = ['.', '‎', '‏', '​', ' '];
    const dots = ['。', '．', '·'];
    const randomVar = variations[Math.floor(Math.random() * variations.length)];
    const randomDot = dots[Math.floor(Math.random() * dots.length)];

    // إضافة حرف غير مرئي عشوائي
    if (index % 3 === 0) {
      return message + randomVar;
    } else if (index % 3 === 1) {
      return message + '\n' + randomDot;
    } else {
      return message + randomVar + randomVar;
    }
  }

  // فحص الأرقام (بيها واتساب أو لا)
  async checkWhatsappNumbers(phoneNumbers) {
    const sessionId = whatsappService.selectBestSession();
    if (!sessionId) throw new Error('لا توجد جلسات واتساب متصلة');

    const client = whatsappService.clients[sessionId];
    const results = { hasWhatsapp: [], noWhatsapp: [] };

    for (const phone of phoneNumbers) {
      try {
        const formatted = whatsappService.formatPhoneNumber(phone);
        const numberId = await client.getNumberId(`${formatted}@c.us`);

        if (numberId) {
          results.hasWhatsapp.push(phone);
        } else {
          results.noWhatsapp.push(phone);
        }
      } catch (error) {
        results.noWhatsapp.push(phone);
      }

      // تأخير بين كل فحص
      await whatsappService.delay(500);
    }

    return results;
  }

  // إنشاء حملة تسويقية
  createCampaign(name, message, phoneNumbers, totalHours = 12) {
    this.campaignCounter += 1;
    const campaignId = `campaign_${this.campaignCounter}_${Date.now()}`;

    const campaign = {
      id: campaignId,
      name,
      message,
      phoneNumbers,
      totalNumbers: phoneNumbers.length,
      totalHours,
      sent: 0,
      failed: 0,
      remaining: phoneNumbers.length,
      status: 'pending',
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
      errors: []
    };

    this.campaigns[campaignId] = campaign;
    return campaign;
  }

  // تشغيل الحملة (إرسال على دفعات)
  async runCampaign(campaignId) {
    const campaign = this.campaigns[campaignId];
    if (!campaign) throw new Error('الحملة غير موجودة');

    campaign.status = 'running';
    campaign.startedAt = new Date();

    const numbers = campaign.phoneNumbers;
    const totalNumbers = numbers.length;
    const totalMs = campaign.totalHours * 60 * 60 * 1000;
    const delayBetween = Math.floor(totalMs / totalNumbers);

    // جلب عدد الأرقام المربوطة
    const sessions = Object.keys(whatsappService.clients).filter(
      id => whatsappService.statuses[id] === 'connected'
    );

    if (sessions.length === 0) {
      campaign.status = 'failed';
      campaign.errors.push('لا توجد جلسات واتساب متصلة');
      return;
    }

    console.log(`🚀 بدء الحملة: ${campaign.name}`);
    console.log(`📱 عدد الأرقام: ${totalNumbers}`);
    console.log(`⏱️ المدة: ${campaign.totalHours} ساعة`);
    console.log(`⏳ التأخير بين كل رسالة: ${Math.floor(delayBetween / 1000)} ثانية`);
    console.log(`📞 عدد أرقام الواتساب: ${sessions.length}`);

    let sessionIndex = 0;

    for (let i = 0; i < numbers.length; i++) {
      // التحقق من إيقاف الحملة
      if (campaign.status === 'stopped') {
        console.log('⛔ تم إيقاف الحملة');
        break;
      }

      const phone = numbers[i];
      const sessionId = sessions[sessionIndex % sessions.length];
      const variedMessage = this.varyMessage(campaign.message, i);

      try {
        const formatted = whatsappService.formatPhoneNumber(phone);
        await whatsappService.sendMessage(sessionId, formatted, variedMessage);

        campaign.sent += 1;
        campaign.remaining -= 1;
        console.log(`✅ [${campaign.sent}/${totalNumbers}] تم الإرسال لـ ${formatted}`);
      } catch (error) {
        campaign.failed += 1;
        campaign.remaining -= 1;
        campaign.errors.push({ phone, error: error.message });
        console.error(`❌ [${campaign.sent + campaign.failed}/${totalNumbers}] فشل الإرسال لـ ${phone}: ${error.message}`);
      }

      // التبديل بين الأرقام
      sessionIndex += 1;

      // تأخير بين الرسائل
      if (i < numbers.length - 1) {
        const randomExtra = Math.floor(Math.random() * 10000);
        await whatsappService.delay(delayBetween + randomExtra);
      }
    }

    campaign.status = campaign.status === 'stopped' ? 'stopped' : 'completed';
    campaign.completedAt = new Date();

    console.log(`\n📊 نتائج الحملة "${campaign.name}":`);
    console.log(`✅ مرسلة: ${campaign.sent}`);
    console.log(`❌ فاشلة: ${campaign.failed}`);
    console.log(`📱 المجموع: ${totalNumbers}`);
  }

  // إيقاف حملة
  stopCampaign(campaignId) {
    const campaign = this.campaigns[campaignId];
    if (campaign && campaign.status === 'running') {
      campaign.status = 'stopped';
      return true;
    }
    return false;
  }

  // جلب حملة
  getCampaign(campaignId) {
    return this.campaigns[campaignId] || null;
  }

  // جلب جميع الحملات
  getAllCampaigns() {
    return Object.values(this.campaigns).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
}

const marketingService = new MarketingService();
module.exports = marketingService;