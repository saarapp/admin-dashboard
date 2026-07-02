// ============================================
// models/User.js - نموذج المستخدم
// ============================================

const supabase = require('../config/supabase');

class User {
  // جلب جميع المستخدمين
  static async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  // جلب مستخدم واحد
  static async getById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // البحث عن مستخدم بـ البريد
  static async getByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) throw error;
    return data;
  }

  // إنشاء مستخدم جديد
  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث مستخدم
  static async update(id, userData) {
    const { data, error } = await supabase
      .from('users')
      .update(userData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // حذف مستخدم
  static async delete(id) {
    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }
}

module.exports = User;