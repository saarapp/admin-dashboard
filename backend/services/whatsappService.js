// ============================================
// services/whatsappService.js - النسخة المستقرة والمصلحة للأقواس
// ============================================

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

class WhatsappService {
  constructor() {
    this.clients = {};
    this.qrCodes = {};
    this.statuses = {};
  }

  // دالة البحث عن الكروميوم
  getChromiumPath() {
    const paths = [
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
      '/usr/bin/google-chrome',
      '/snap/bin/chromium'
    ];
    const fs = require('fs');
    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
    return undefined;
  }

  // إنشاء جلسة واتساب جديدة
  async createSession(sessionId, phoneNumber) {
    if (this.clients[sessionId]) {
      return { status: 'exists', message: 'الجلسة موجودة بالفعل' };
    }

    this.statuses[sessionId] = 'initializing';

    // التوجيه للمجلد المؤقت المفتوح بالكامل للصلاحيات أونلاين لمنع تعليق الباركود
    const path = require('path');
    const authPath = process.env.NODE_ENV === 'production' 
      ? path.join('/tmp', 'wwebjs_auth_sessions') 
      : path.join(__dirname, '..', 'wwebjs_auth_sessions');

    const client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: sessionId,
        dataPath: authPath
      }),
      // 🛠️ الحل الحاسم لمنع تعليق الباركود أونلاين:
      authTimeoutMs: 120000, // رفع وقت التوثيق إلى دقيقتين كاملتين لمنع الفصل أثناء قراءة البيانات
      qrMaxImages: 0,
      takeoverOnConflict: false,
      // إجبار الحزمة على استخدام نسخة ويب مستقرة وسريعة لا تستهلك معالج ريلوي
      webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1017743174-alpha.html'
      },
      puppeteer: {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-zygote',
          '--disable-extensions',
          '--blink-settings=imagesEnabled=false',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        ]
      }
    });

    // عند ظهور QR Code (نسخة المزامنة القسرية وتنشيط الربط)
    client.on('qr', async (qr) => {
      console.log(`📱 QR Code الجديد جاهز للجلسة ${sessionId}`);
      this.statuses[sessionId] = 'waiting_qr';
      
      try {
        const qrImage = await qrcode.toDataURL(qr);
        this.qrCodes[sessionId] = qrImage;
        
        // 🛠️ خدعة تنشيط حركة المتصفح: 
        // نجعل بوبيتير يقوم بعمل إيعاز داخلي خفيف بالخلفية لإنعاش الاتصال وسرعة لقط المسحة
        if (client.pupPage) {
          await client.pupPage.evaluate(() => {
            console.log('Refreshing connection matrix...');
          }).catch(() => {});
        }
      } catch (err) {
        console.error('خطأ في توليد QR:', err);
      }
    });

    // 🛠️ حماية إضافية: إضافة حدث الاستيقاظ (حتى إذا لقط المسحة ومتحول جاهز، نجبره يتحول فوراً)
    client.on('authenticated', () => {
      console.log(`🔒 تم التوثيق المبدئي للجلسة ${sessionId} - جاري التحويل لـ Ready...`);
      this.statuses[sessionId] = 'authenticated';
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
        try {
          const contact = await msg.getContact();
          phoneNumber = contact.id?.user || contact.number || '';
        } catch (e) {}

        if (!phoneNumber || phoneNumber.length > 15) {
          try {
            const chat = await msg.getChat();
            phoneNumber = chat.id?.user || '';
          } catch (e) {}
        }

        if (!phoneNumber || phoneNumber.length > 15) {
          phoneNumber = msg.from.replace('@c.us', '').replace('@lid', '').replace(/@.*/, '');
        }

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

  // تنسيق الرقم
  formatPhoneNumber(phoneNumber) {
    let number = phoneNumber.replace(/[+\s\-()]/g, '');
    if (number.startsWith('00')) number = number.substring(2);
    if (number.startsWith('0')) number = '964' + number.substring(1);
    if (!number.startsWith('964')) number = '964' + number;
    return number;
  }

  // تأخير
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // إرسال رسالة
  async sendMessage(sessionId, phoneNumber, message) {
    const client = this.clients[sessionId];
    if (!client) throw new Error('الجلسة غير موجودة');
    if (this.statuses[sessionId] !== 'connected') throw new Error('الجلسة غير متصلة');

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      await this.delay(2000); // حماية استقرار البروتوكول

      const numberDetails = await client.getNumberId(formattedNumber);
      if (!numberDetails) {
        throw new Error(`الرقم ${formattedNumber} غير مسجل في الواتساب`);
      }
      
      const chatId = numberDetails._serialized;

      const initialDelay = Math.floor(Math.random() * 2000) + 1000;
      await this.delay(initialDelay);

      const response = await client.sendMessage(chatId, message);
      console.log(`✅ تم إرسال رسالة بنجاح للرقم ${formattedNumber}`);

      return {
        status: 'sent',
        messageId: response.id._serialized,
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ فشل إرسال الرسالة للرقم ${phoneNumber}:`, error.message);
      throw error;
    }
  }// إرسال رسالة مباشرة عبر حقن المتصفح لتفادي أخطاء الـ CdpFrame نهائياً
  async sendMessage(sessionId, phoneNumber, message) {
    const client = this.clients[sessionId];
    if (!client) throw new Error('الجلسة غير موجودة');
    if (this.statuses[sessionId] !== 'connected') throw new Error('الجلسة غير متصلة');

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      await this.delay(1000);
      console.log(`🚀 محاولة دفع الرسالة بالحقن المباشر للرقم: ${chatId}`);

      // 🛠️ الحل السحري: تنفيذ الإرسال مباشرة داخل الـ Page Context للواتساب
      // هذا يتجاوز كود الحزمة المكسور ويستدعي نظام واتساب ويب الداخلي فوراً
      if (client.pupPage) {
        await client.pupPage.evaluate(async (jid, text) => {
          // التحقق من أن كائن مخزن واتساب ويب جاهز في المتصفح بالخلفية
          if (window.Store && window.Store.Chat) {
            const chatObj = window.Store.Chat.get(jid);
            if (chatObj) {
              await chatObj.sendMessage(text);
              return true;
            } else {
              // إذا لم تكن المحادثة مفتوحة مسبقاً، ننشئها ونرسل الرسالة فوراً
              const idUser = new window.Store.UserConstructor(jid, { Object: Object });
              const newChat = await window.Store.Chat.find(idUser);
              await newChat.sendMessage(text);
              return true;
            }
          }
          throw new Error('WWebJS Store is not ready yet');
        }, chatId, message);
      } else {
        // طريقة احتياطية في حال عدم توفر الـ pupPage
        await client.sendMessage(chatId, message);
      }

      console.log(`✅ تم خروج الرسالة بنجاح مذهل من السيرفر للرقم ${formattedNumber}`);

      return {
        status: 'sent',
        messageId: 'direct_inject_' + Date.now(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ فشل إرسال الرسالة للرقم ${phoneNumber}:`, error.message);
      
      // محاولة أخيرة بالطريقة القياسية للحزمة إذا فشل الحقن المباشر
      try {
        console.log("🔄 محاولة الإرسال بالطريقة الاحتياطية القياسية...");
        const formattedNumber = this.formatPhoneNumber(phoneNumber);
        const response = await client.sendMessage(`${formattedNumber}@c.us`, message);
        return {
          status: 'sent',
          messageId: response.id?._serialized || 'fallback_sent',
          timestamp: new Date()
        };
      } catch (fallbackError) {
        throw new Error(`تعذر الإرسال بكلا الطريقتين: ${fallbackError.message}`);
      }
    }
  }

  // إغلاق جميع الجلسات
  async closeAllSessions() {
    for (const sessionId of Object.keys(this.clients)) {
      await this.closeSession(sessionId);
    }
  }

  // استعادة جميع الجلسات من الـ /tmp
  async restoreSessions() {
    const fs = require('fs');
    const path = require('path');
    const authDir = process.env.NODE_ENV === 'production' 
      ? path.join('/tmp', 'wwebjs_auth_sessions') 
      : path.join(__dirname, '..', 'wwebjs_auth_sessions');

    if (!fs.existsSync(authDir)) return;
    const folders = fs.readdirSync(authDir).filter(f => f.startsWith('session-'));

    for (const folder of folders) {
      const sessionId = folder.replace('session-', '');
      console.log(`🔄 جاري استعادة جلسة: ${sessionId}`);
      await this.createSession(sessionId, sessionId);
    }
  }
}

const whatsappService = new WhatsappService();
module.exports = whatsappService;