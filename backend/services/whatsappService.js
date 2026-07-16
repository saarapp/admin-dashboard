// ============================================
// services/whatsappService.js - خدمة الواتساب المطورة 🚀
// ============================================

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsappService {
  constructor() {
    this.clients = {};
    this.qrCodes = {};
    this.statuses = {};
  }

  // إنشاء جلسة واتساب جديدة
  async createSession(sessionId, phoneNumber) {
    if (this.clients[sessionId]) {
      return { status: 'exists', message: 'الجلسة موجودة بالفعل' };
    }

    this.statuses[sessionId] = 'initializing';

    // استخدام المجلد المؤقت للسيستم أونلاين لتفادي مشاكل الصلاحيات Permissions
    const path = require('path');
    const authPath = process.env.NODE_ENV === 'production' 
      ? path.join('/tmp', '.wwebjs_auth') 
      : path.join(__dirname, '..', '.wwebjs_auth');

    const client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: sessionId,
        dataPath: authPath
      }),
      // إضافة كاش ويب متوافق ومستقر لعام 2026 لتفادي الطرد الفوري للجلسات القديمة
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1014580213-alpha.html'
      },
      puppeteer: {
        headless: true,
        // 👈 دمج المسار الحقيقي المستقر لجوجل كروم بالسيرفر بدلاً من الكروميوم المكسور
        executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/google-chrome' : undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-extensions'
        ]
      }
    });

    // عند ظهور QR Code
    client.on('qr', async (qr) => {
      console.log(`📱 QR Code للجلسة ${sessionId}`);
      this.statuses[sessionId] = 'waiting_qr';

      try {
        const qrImage = await qrcode.toDataURL(qr);
        this.qrCodes[sessionId] = qrImage;
      } catch (err) {
        console.error('خطأ في توليد QR:', err);
      }
    });
    
    // عند الاتصال بنجاح
    client.on('ready', () => {
      console.log(`✅ الجلسة ${sessionId} متصلة بنجاح!`);
      this.statuses[sessionId] = 'connected';
      this.qrCodes[sessionId] = null;
    });

    // الاستماع للرسائل الواردة
    client.on('message', async (msg) => {
      try {
        let phoneNumber = '';

        // جلب الرقم الحقيقي
        try {
          const contact = await msg.getContact();
          phoneNumber = contact.id?.user || contact.number || '';
        } catch (e) {}

        // إذا ما نجح، جرّب من الـ chat
        if (!phoneNumber || phoneNumber.length > 15) {
          try {
            const chat = await msg.getChat();
            phoneNumber = chat.id?.user || '';
          } catch (e) {}
        }

        // إذا ما نجح، جرّب من msg مباشرة
        if (!phoneNumber || phoneNumber.length > 15) {
          phoneNumber = msg.from.replace('@c.us', '').replace('@lid', '').replace(/@.*/, '');
        }

        // تجاهل الرسائل من المجموعات
        if (msg.from.includes('@g.us')) return;

        console.log(`📩 رسالة واردة من: ${phoneNumber} - ${msg.body}`);
        
        const AppealController = require('../controllers/appealController');
        await AppealController.handleIncomingAppeal(phoneNumber, msg.body);
      } catch (error) {
        console.error('خطأ في معالجة الرسالة الواردة:', error);
      }
    });

    // عند الفصل
    client.on('disconnected', (reason) => {
      console.log(`❌ الجلسة ${sessionId} انفصلت:`, reason);
      this.statuses[sessionId] = 'disconnected';
      delete this.clients[sessionId];
    });

    // عند فشل المصادقة
    client.on('auth_failure', (msg) => {
      console.error(`❌ فشل المصادقة للجلسة ${sessionId}:`, msg);
      this.statuses[sessionId] = 'auth_failure';
    });

    // حفظ الـ client
    this.clients[sessionId] = client;

    // بدء الاتصال
    try {
      await client.initialize();
    } catch (error) {
      console.error(`❌ خطأ مفصل في تهيئة الجلسة ${sessionId}:`, error);
      this.statuses[sessionId] = 'error';
      this.qrCodes[sessionId] = `ERROR_DETAILS: ${error.message}`;
      return { status: 'error', message: error.message, stack: error.stack };
    }

    return { status: 'initializing', message: 'جاري التهيئة...' };
  }
  

  // جلب QR Code
  getQRCode(sessionId) {
    return this.qrCodes[sessionId] || null;
  }

  // جلب حالة الجلسة
  getStatus(sessionId) {
    return this.statuses[sessionId] || 'not_found';
  }

  // جلب جميع الجلسات
  getAllSessions() {
    const sessions = {};
    Object.keys(this.statuses).forEach(id => {
      sessions[id] = {
        status: this.statuses[id],
        hasQR: !!this.qrCodes[id]
      };
    });
    return sessions;
  }

  // تنسيق الرقم (يقبل أي صيغة)
  formatPhoneNumber(phoneNumber) {
    let number = phoneNumber.replace(/[+\s\-()]/g, '');

    if (number.startsWith('00')) {
      number = number.substring(2);
    }

    if (number.startsWith('0')) {
      number = '964' + number.substring(1);
    }

    if (!number.startsWith('964')) {
      number = '964' + number;
    }

    return number;
  }

  // تأخير
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🛡️ إرسال رسالة مع دمج كافة خدع وحيل مكافحة الحظر مالتك القديمة بالكامل
  async sendMessage(sessionId, phoneNumber, message) {
    const client = this.clients[sessionId];

    if (!client) {
      throw new Error('الجلسة غير موجودة');
    }

    if (this.statuses[sessionId] !== 'connected') {
      throw new Error('الجلسة غير متصلة');
    }

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      // 1. تأخير عشوائي قبل البدء (1-3 ثواني)
      const initialDelay = Math.floor(Math.random() * 2000) + 1000;
      await this.delay(initialDelay);

      // 2. محاكاة "مشاهدة المحادثة"
      const chat = await client.getChatById(chatId);

      // 3. تأخير قصير (1-2 ثانية) كأنه يقرأ
      await this.delay(Math.floor(Math.random() * 1000) + 1000);

      // 4. محاكاة "جاري الكتابة..."
      await chat.sendStateTyping();

      // 5. تأخير حسب طول الرسالة (كأنه يكتب فعلاً)
      const typingTime = Math.min(message.length * 50, 8000) + Math.floor(Math.random() * 2000) + 2000;
      await this.delay(typingTime);

      // 6. إرسال الرسالة الحقيقي
      const response = await client.sendMessage(chatId, message);

      // 7. إيقاف "جاري الكتابة"
      await chat.clearState();

      // 8. تأخير بعد الإرسال (2-4 ثواني)
      const afterDelay = Math.floor(Math.random() * 2000) + 2000;
      await this.delay(afterDelay);

      console.log(`✅ تم إرسال رسالة للرقم ${formattedNumber} (كتابة: ${typingTime}ms)`);

      return {
        status: 'sent',
        messageId: response.id._serialized,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ فشل إرسال الرسالة للرقم ${phoneNumber}:`, error);
      throw error;
    }
  }

  // جلب قائمة المعرفات للجلسات المتصلة فعلياً
  getActiveSessions() {
    return Object.keys(this.clients).filter(
      id => this.statuses[id] === 'connected'
    );
  }

  // فحص هل الجلسة متصلة بالاسم
  isSessionConnected(sessionId) {
    return this.statuses[sessionId] === 'connected';
  }

  // اختيار أفضل جلسة (توزيع الحمل)
  selectBestSession() {
    const connectedSessions = this.getActiveSessions();

    if (connectedSessions.length === 0) {
      return null;
    }

    // اختيار عشوائي بين الجلسات المتصلة لتقليل الضغط
    const randomIndex = Math.floor(Math.random() * connectedSessions.length);
    return connectedSessions[randomIndex];
  }

  // إرسال رسالة مع توزيع الحمل
  async sendMessageWithLoadBalance(phoneNumber, message) {
    const sessionId = this.selectBestSession();

    if (!sessionId) {
      throw new Error('لا توجد جلسات واتساب متصلة حالياً لتوزيع الحمل');
    }

    return await this.sendMessage(sessionId, phoneNumber, message);
  }

  // إغلاق جلسة
  async closeSession(sessionId) {
    const client = this.clients[sessionId];

    if (client) {
      try {
        await client.destroy();
      } catch (error) {
        console.error('خطأ في إغلاق الجلسة:', error);
      }

      delete this.clients[sessionId];
      delete this.qrCodes[sessionId];
      this.statuses[sessionId] = 'closed';
    }
  }

  // إغلاق جميع الجلسات
  async closeAllSessions() {
    for (const sessionId of Object.keys(this.clients)) {
      await this.closeSession(sessionId);
    }
  }

  // استعادة جميع الجلسات المحفوظة
  async restoreSessions() {
    const fs = require('fs');
    const path = require('path');
    const authDir = path.join(__dirname, '..', '.wwebjs_auth');

    if (!fs.existsSync(authDir)) return;

    const folders = fs.readdirSync(authDir).filter(f => f.startsWith('session-'));

    for (const folder of folders) {
      const sessionId = folder.replace('session-', '');
      console.log(`🔄 جاري استعادة جلسة: ${sessionId}`);
      await this.createSession(sessionId, sessionId);
    }
  }
}

// إنشاء instance واحد
const whatsappService = new WhatsappService();

module.exports = whatsappService;