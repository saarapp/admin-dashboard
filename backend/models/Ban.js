// ============================================
// models/Ban.js - نموذج الحظر
// ============================================

const supabase = require('../config/supabase');

class Ban {
  // جلب جميع المحظورين
  static async getAll() {
    const { data, error } = await supabase
      .from('bans')
      .select('*, created_by_user:users!bans_created_by_fkey(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب المحظورين النشطين فقط
  static async getActive() {
    const { data, error } = await supabase
      .from('bans')
      .select('*, created_by_user:users!bans_created_by_fkey(full_name)')
      .eq('status', 'active')
      .order('ban_end', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // جلب حظر واحد
  static async getById(id) {
    const { data, error } = await supabase
      .from('bans')
      .select('*, created_by_user:users!bans_created_by_fkey(full_name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // جلب حظر الكابتن النشط
  static async getActiveByCaptain(captainId) {
    const { data, error } = await supabase
      .from('bans')
      .select('*')
      .eq('captain_id', captainId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) return [];
    return data;
  }

  // إنشاء حظر
  static async create(banData) {
    const { data, error } = await supabase
      .from('bans')
      .insert([banData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث حظر
  static async update(id, banData) {
    const { data, error } = await supabase
      .from('bans')
      .update(banData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // فك الحظر
  static async lift(id, userId) {
    return this.update(id, {
      status: 'lifted',
      lifted_by: userId,
      lifted_at: new Date()
    });
  }

  // تحديث المنتهية تلقائياً
  static async updateExpired() {
    const { data, error } = await supabase
      .from('bans')
      .update({ status: 'expired' })
      .eq('status', 'active')
      .lt('ban_end', new Date().toISOString())
      .select();
    
    if (error) throw error;
    return data;
  }

  // إحصائيات
  static async getStats() {
    const { data, error } = await supabase
      .from('bans')
      .select('status');
    
    if (error) throw error;

    var stats = { active: 0, lifted: 0, expired: 0 };
    data.forEach(function(b) {
      stats[b.status] = (stats[b.status] || 0) + 1;
    });

    return stats;
  }
}

module.exports = Ban;