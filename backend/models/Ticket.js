// ============================================
// models/Ticket.js - نموذج التكتات
// ============================================

const supabase = require('../config/supabase');

class Ticket {
  // جلب جميع التكتات
  static async getAll() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, created_by_user:users!tickets_created_by_fkey(full_name, city), responded_by_user:users!tickets_responded_by_fkey(full_name), deputy:users!tickets_deputy_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب تكت واحد
  static async getById(id) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, created_by_user:users!tickets_created_by_fkey(full_name, city), responded_by_user:users!tickets_responded_by_fkey(full_name), deputy:users!tickets_deputy_id_fkey(full_name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // جلب تكتات الموظف
  static async getByUser(userId) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, responded_by_user:users!tickets_responded_by_fkey(full_name), deputy:users!tickets_deputy_id_fkey(full_name)')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب التكتات حسب الحالة
  static async getByStatus(status) {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, created_by_user:users!tickets_created_by_fkey(full_name, city), responded_by_user:users!tickets_responded_by_fkey(full_name), deputy:users!tickets_deputy_id_fkey(full_name)')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // إنشاء تكت
  static async create(ticketData) {
    const { data, error } = await supabase
      .from('tickets')
      .insert([ticketData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث تكت
  static async update(id, ticketData) {
    const { data, error } = await supabase
      .from('tickets')
      .update({ ...ticketData, updated_at: new Date() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // حذف تكت
  static async delete(id) {
    const { data, error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  // إحصائيات
  static async getStats() {
    const { data, error } = await supabase
      .from('tickets')
      .select('status');
    
    if (error) throw error;

    let stats = { pending: 0, under_review: 0, deputy_review: 0, approved: 0, rejected: 0 };
    data.forEach(t => {
      stats[t.status] = (stats[t.status] || 0) + 1;
    });

    return stats;
  }
}

module.exports = Ticket;