// ============================================
// models/Record.js - نموذج السجلات
// ============================================

const supabase = require('../config/supabase');

class Record {
  // جلب جميع السجلات
  static async getAll() {
    const { data, error } = await supabase
      .from('records')
      .select('*, captains(name, phone_number), users(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب سجل واحد
  static async getById(id) {
    const { data, error } = await supabase
      .from('records')
      .select('*, captains(name, phone_number), users(full_name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // جلب سجلات الكابتن الواحد
  static async getByCaptain(captainId) {
    const { data, error } = await supabase
      .from('records')
      .select('*, captains(name, phone_number), users(full_name)')
      .eq('captain_id', captainId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب السجلات حسب النوع (warning, deduction, compensation)
  static async getByType(recordType) {
    const { data, error } = await supabase
      .from('records')
      .select('*, captains(name, phone_number), users(full_name)')
      .eq('record_type', recordType)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // إنشاء سجل جديد
  static async create(recordData) {
    const { data, error } = await supabase
      .from('records')
      .insert([recordData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث سجل
  static async update(id, recordData) {
    const { data, error } = await supabase
      .from('records')
      .update(recordData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // حذف سجل
  static async delete(id) {
    const { data, error } = await supabase
      .from('records')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  // إحصائيات الكابتن الواحد
  static async getCaptainStats(captainId) {
    const { data, error } = await supabase
      .from('records')
      .select('record_type, amount')
      .eq('captain_id', captainId);
    
    if (error) throw error;

    let stats = {
      warnings: 0,
      totalDeductions: 0,
      totalCompensations: 0,
      balance: 0
    };

    data.forEach(record => {
      if (record.record_type === 'warning') {
        stats.warnings += 1;
      } else if (record.record_type === 'deduction') {
        stats.totalDeductions += record.amount || 0;
      } else if (record.record_type === 'compensation') {
        stats.totalCompensations += record.amount || 0;
      }
    });

    stats.balance = stats.totalCompensations - stats.totalDeductions;
    return stats;
  }

  // إحصائيات عامة
  static async getGlobalStats() {
    const { data, error } = await supabase
      .from('records')
      .select('record_type, amount');
    
    if (error) throw error;

    let stats = {
      totalWarnings: 0,
      totalDeductions: 0,
      totalCompensations: 0
    };

    data.forEach(record => {
      if (record.record_type === 'warning') {
        stats.totalWarnings += 1;
      } else if (record.record_type === 'deduction') {
        stats.totalDeductions += record.amount || 0;
      } else if (record.record_type === 'compensation') {
        stats.totalCompensations += record.amount || 0;
      }
    });

    return stats;
  }
}

module.exports = Record;