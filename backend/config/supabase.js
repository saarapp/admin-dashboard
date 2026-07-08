// ============================================
// config/supabase.js - إعدادات الاتصال المصلحة
// ============================================

const { createClient } = require('@supabase/supabase-js');
const ws = require('ws'); // استيراد حزمة الـ WebSocket التي أضفناها للـ dependencies

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      persistSession: false
    },
    realtime: {
      transport: ws // تمرير الـ ws لإصلاح مشكلة دعم الشبكة أونلاين في السيرفر
    }
  }
);

module.exports = supabase;