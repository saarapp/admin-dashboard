// ============================================
// models/Appeal.js - نموذج الطعون
// ============================================

const supabase = require('../config/supabase');

class Appeal {
  // جلب جميع الطعون
  static async getAll() {
    const { data, error } = await supabase
      .from('appeals')
      .select('*, captains(name, phone_number), records(record_type, amount, reason)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب طعن واحد
  static async getById(id) {
    const { data, error } = await supabase
      .from('appeals')
      .select('*, captains(name, phone_number), records(record_type, amount, reason)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // جلب الطعون حسب الحالة
  static async getByStatus(status) {
    const { data, error } = await supabase
      .from('appeals')
      .select('*, captains(name, phone_number), records(record_type, amount, reason)')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب طعون الكابتن
  static async getByCaptain(captainId) {
    const { data, error } = await supabase
      .from('appeals')
      .select('*, records(record_type, amount, reason)')
      .eq('captain_id', captainId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب الطعن حسب السجل
  static async getByRecord(recordId) {
    const { data, error } = await supabase
      .from('appeals')
      .select('*')
      .eq('record_id', recordId)
      .single();
    
    if (error) return null;
    return data;
  }

  // جلب آخر طعن للكابتن (خلال 24 ساعة)
  static async getRecentByCaptainPhone(captainPhone) {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const { data, error } = await supabase
      .from('appeals')
      .select('*, records(record_type, amount, reason)')
      .eq('captain_phone', captainPhone)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
  }

  // إنشاء طعن جديد
  static async create(appealData) {
    const { data, error } = await supabase
      .from('appeals')
      .insert([appealData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث طعن (قبول أو رفض)
  static async update(id, appealData) {
    const { data, error } = await supabase
      .from('appeals')
      .update(appealData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // قبول الطعن
  static async approve(id, userId) {
    return this.update(id, {
      status: 'approved',
      responded_by: userId,
      responded_at: new Date()
    });
  }

  // رفض الطعن
  static async reject(id, userId) {
    return this.update(id, {
      status: 'rejected',
      responded_by: userId,
      responded_at: new Date()
    });
  }

  // إحصائيات الطعون
  static async getStats() {
    const { data, error } = await supabase
      .from('appeals')
      .select('status');
    
    if (error) throw error;

    let stats = { pending: 0, approved: 0, rejected: 0 };
    data.forEach(appeal => {
      stats[appeal.status] += 1;
    });

    return stats;
  }
}

module.exports = Appeal;