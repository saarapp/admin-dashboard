// ============================================
// models/Captain.js - نموذج الكابتن
// ============================================

const supabase = require('../config/supabase');

class Captain {
  // جلب جميع الكابتنات
  static async getAll() {
    const { data, error } = await supabase
      .from('captains')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب كابتن واحد
  static async getById(id) {
    const { data, error } = await supabase
      .from('captains')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // البحث عن كابتن برقم الهاتف
  static async getByPhone(phoneNumber) {
    const { data, error } = await supabase
      .from('captains')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (error) throw error;
    return data;
  }

  // البحث عن كابتن بـ الاسم
  static async searchByName(name) {
    const { data, error } = await supabase
      .from('captains')
      .select('*')
      .ilike('name', `%${name}%`);
    
    if (error) throw error;
    return data;
  }

  // إنشاء كابتن جديد
  static async create(captainData) {
    const { data, error } = await supabase
      .from('captains')
      .insert([captainData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث كابتن
  static async update(id, captainData) {
    const { data, error } = await supabase
      .from('captains')
      .update(captainData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // حذف كابتن
  static async delete(id) {
    const { data, error } = await supabase
      .from('captains')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  // جلب سجل الكابتن (إنذارات + خصومات + تعويضات)
  static async getRecords(captainId) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .eq('captain_id', captainId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // حساب الرصيد (إجمالي الخصومات - التعويضات)
  static async getBalance(captainId) {
    const { data, error } = await supabase
      .from('records')
      .select('record_type, amount')
      .eq('captain_id', captainId);
    
    if (error) throw error;
    
    let balance = 0;
    data.forEach(record => {
      if (record.record_type === 'deduction') {
        balance -= record.amount || 0;
      } else if (record.record_type === 'compensation') {
        balance += record.amount || 0;
      }
    });
    
    return balance;
  }
}

module.exports = Captain;