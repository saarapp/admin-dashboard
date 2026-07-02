// ============================================
// models/WhatsappNumber.js - نموذج أرقام الواتساب
// ============================================

const supabase = require('../config/supabase');

class WhatsappNumber {
  // جلب جميع الأرقام
  static async getAll() {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب الأرقام النشطة فقط
  static async getActive() {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('is_active', true)
      .order('load_balance', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // جلب رقم واحد
  static async getById(id) {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // البحث برقم الهاتف
  static async getByPhone(phoneNumber) {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (error) throw error;
    return data;
  }

  // إضافة رقم واتساب جديد
  static async create(numberData) {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .insert([numberData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث رقم
  static async update(id, numberData) {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .update(numberData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تفعيل رقم
  static async activate(id) {
    return this.update(id, { is_active: true });
  }

  // تعطيل رقم
  static async deactivate(id) {
    return this.update(id, { is_active: false });
  }

  // تحديث عدد الرسائل المرسلة
  static async incrementSent(id) {
    const { data: number } = await this.getById(id);
    return this.update(id, { 
      total_sent: (number.total_sent || 0) + 1,
      last_used_at: new Date()
    });
  }

  // تحديث توازن الحمل (اختيار الرقم الأقل حمل)
  static async incrementLoadBalance(id) {
    const { data: number } = await this.getById(id);
    return this.update(id, { 
      load_balance: (number.load_balance || 0) + 1 
    });
  }

  // إعادة تعيين توازن الحمل
  static async resetLoadBalance(id) {
    return this.update(id, { load_balance: 0 });
  }

  // حذف رقم
  static async delete(id) {
    const { data, error } = await supabase
      .from('whatsapp_numbers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  // اختيار أفضل رقم للإرسال (الأقل حمل)
  static async selectBestNumber() {
    const activeNumbers = await this.getActive();
    
    if (activeNumbers.length === 0) {
      throw new Error('لا توجد أرقام واتساب نشطة');
    }

    return activeNumbers[0];
  }
}

module.exports = WhatsappNumber;