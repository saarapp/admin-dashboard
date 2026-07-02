// ============================================
// models/MessageTemplate.js - نموذج الرسائل المخصصة
// ============================================

const supabase = require('../config/supabase');

class MessageTemplate {
  // جلب جميع الرسائل
  static async getAll() {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*, users(full_name)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // جلب رسالة واحدة
  static async getById(id) {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*, users(full_name)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // جلب جميع الرسائل حسب النوع (متعددة)
  static async getByType(messageType) {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .eq('message_type', messageType)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // إنشاء رسالة جديدة
  static async create(templateData) {
    const { data, error } = await supabase
      .from('message_templates')
      .insert([templateData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديث رسالة
  static async update(id, templateData) {
    const { data, error } = await supabase
      .from('message_templates')
      .update(templateData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // حذف رسالة
  static async delete(id) {
    const { data, error } = await supabase
      .from('message_templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  // استبدال المتغيرات في الرسالة
  static replaceVariables(message, variables) {
    let finalMessage = message;

    Object.keys(variables).forEach(key => {
      const placeholder = `{${key}}`;
      finalMessage = finalMessage.replace(
        new RegExp(placeholder, 'g'),
        variables[key]
      );
    });

    return finalMessage;
  }

  // جلب رسالة كاملة مع استبدال المتغيرات (بالـ ID)
  static async getProcessedMessageById(templateId, variables) {
    const template = await this.getById(templateId);
    
    if (!template) {
      throw new Error('الرسالة غير موجودة');
    }

    const processedMessage = this.replaceVariables(
      template.message_content,
      variables
    );

    return {
      templateId: template.id,
      messageContent: processedMessage,
      variables: template.variables
    };
  }

  // جلب رسالة كاملة مع استبدال المتغيرات (بالنوع - أول رسالة)
  static async getProcessedMessage(messageType, variables) {
    const templates = await this.getByType(messageType);
    
    if (!templates || templates.length === 0) {
      throw new Error(`لا توجد رسالة للنوع: ${messageType}`);
    }

    const template = templates[0];

    const processedMessage = this.replaceVariables(
      template.message_content,
      variables
    );

    return {
      templateId: template.id,
      messageContent: processedMessage,
      variables: template.variables
    };
  }
}

module.exports = MessageTemplate;