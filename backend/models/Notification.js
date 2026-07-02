// ============================================
// models/Notification.js - نموذج الإشعارات
// ============================================

const supabase = require('../config/supabase');

class Notification {
  // جلب جميع الإشعارات
  static async getAll() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب إشعار واحد
  static async getById(id) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // جلب إشعارات السجل الواحد
  static async getByRecord(recordId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('record_id', recordId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب إشعارات حسب الحالة (pending, sent, failed, delivered)
  static async getByStatus(status) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب إشعارات الكابتن الواحد
  static async getByCaptainPhone(captainPhone) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('captain_phone', captainPhone)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // إنشاء إشعار جديد
  static async create(notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notificationData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث الإشعار (تحديث الحالة بعد الإرسال)
  static async update(id, notificationData) {
    const { data, error } = await supabase
      .from('notifications')
      .update(notificationData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث الحالة فقط
  static async updateStatus(id, status, sentAt = null) {
    const updateData = { status, sent_at: sentAt };
    return this.update(id, updateData);
  }

  // تحديث الحالة مع رسالة خطأ
  static async updateError(id, errorMessage) {
    return this.update(id, { 
      status: 'failed', 
      error_message: errorMessage 
    });
  }

  // حذف إشعار
  static async delete(id) {
    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  // إحصائيات الإشعارات
  static async getStats() {
    const { data, error } = await supabase
      .from('notifications')
      .select('status');
    
    if (error) throw error;

    let stats = {
      pending: 0,
      sent: 0,
      failed: 0,
      delivered: 0
    };

    data.forEach(notification => {
      stats[notification.status] += 1;
    });

    return stats;
  }
}

module.exports = Notification;