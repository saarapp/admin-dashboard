// ============================================
// services/whatsappService.js - النسخة النهائية المستقرة
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

    const path = require('path');
    const authPath = process.env.NODE_ENV === 'production' 
      ? path.join('/tmp', 'wwebjs_auth_sessions') 
      : path.join(__dirname, '..', 'wwebjs_auth_sessions');

    const client = new Client({
      authStrategy: new LocalAuth({ 
        clientId: sessionId,
        dataPath: authPath
      }),
      authTimeoutMs: 120000, 
      qrMaxImages: 0,
      takeoverOnConflict: false,
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
          // 🛠️ منع عزل الصفحات والعوالم الافتراضية لمنع خطأ IsolatedWorld نهائياً أونلاين:
          '--disable-features=IsolateOrigins,site-per-process',
          '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
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
        
        if (client.pupPage) {
          await client.pupPage.evaluate(() => {
            console.log('Refreshing connection matrix...');
          }).catch(() => {});
        }
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

    client.on('authenticated', () => {
      console.log(`🔒 تم التوثيق المبدئي للجلسة ${sessionId}`);
      this.statuses[sessionId] = 'authenticated';
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

    client.on('disconnected', (reason) => {
      console.log(`❌ الجلسة ${sessionId} انفصلت:`, reason);
      this.statuses[sessionId] = 'disconnected';
      delete this.clients[sessionId];
    });

    this.clients[sessionId] = client;

    try {
      await client.initialize();
    } catch (error) {
      console.error(`❌ خطأ مفصل في تهيئة الجلسة ${sessionId}:`, error);
      this.statuses[sessionId] = 'error';
      return { status: 'error', message: error.message };
    }

    return { status: 'initializing', message: 'جاري التهيئة...' };
  }
  
  getQRCode(sessionId) {
    return this.qrCodes[sessionId] || null;
  }

  getStatus(sessionId) {
    return this.statuses[sessionId] || 'not_found';
  }

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

  formatPhoneNumber(phoneNumber) {
    let number = phoneNumber.replace(/[+\s\-()]/g, '');
    if (number.startsWith('00')) number = number.substring(2);
    if (number.startsWith('0')) number = '964' + number.substring(1);
    if (!number.startsWith('964')) number = '964' + number;
    return number;
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // إرسال رسالة متوافقة 100% مع بيئة الإنتاج المعزولة لـ Railway
  async sendMessage(sessionId, phoneNumber, message) {
    const client = this.clients[sessionId];
    if (!client) throw new Error('الجلسة غير موجودة');
    if (this.statuses[sessionId] !== 'connected') throw new Error('الجلسة غير متصلة');

    try {
      const formattedNumber = this.formatPhoneNumber(phoneNumber);
      const chatId = `${formattedNumber}@c.us`;

      console.log(`🚀 دفع الرسالة الفورية للرقم القياسي: ${chatId}`);
      
      // التأخير البشري المستقر
      await this.delay(1500);

      // الإرسال الفوري عبر بروتوكول الحزمة المحدث، والذي يعبر الـ IsolatedWorld تلقائياً
      const response = await client.sendMessage(chatId, message);
      
      console.log(`✅ تم خروج الرسالة بنجاح مذهل من السيرفر للرقم ${formattedNumber}`);
      return {
        status: 'sent',
        messageId: response.id?._serialized || 'sent_' + Date.now(),
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`❌ فشل إرسال الرسالة للرقم ${phoneNumber}:`, error.message);
      throw error;
    }
  }

  // اختيار أفضل جلسة متصلة للـ Load Balance
  selectBestSession() {
    const connectedSessions = Object.keys(this.clients).filter(
      id => this.statuses[id] === 'connected'
    );
    if (connectedSessions.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * connectedSessions.length);
    return connectedSessions[randomIndex];
  }

  // الدالة المطلوبة لتوزيع الحمل وإرسال الرسائل الصادرة للزبائن والسائقين
  async sendMessageWithLoadBalance(phoneNumber, message) {
    const sessionId = this.selectBestSession();
    if (!sessionId) throw new Error('لا توجد جلسات واتساب متصلة حالياً لتوزيع الحمل');
    return await this.sendMessage(sessionId, phoneNumber, message);
  }

  async closeSession(sessionId) {
    const client = this.clients[sessionId];
    if (client) {
      try { await client.destroy(); } catch (e) {}
      delete this.clients[sessionId];
      delete this.qrCodes[sessionId];
      this.statuses[sessionId] = 'closed';
    }
  }

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