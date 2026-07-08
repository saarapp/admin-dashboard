// ============================================
// models/InternalMessage.js - نموذج الرسائل الداخلية
// ============================================

const supabase = require('../config/supabase');

class InternalMessage {
  // جلب المحادثة بين شخصين
  static async getConversation(userId1, userId2) {
    const { data, error } = await supabase
      .from('internal_messages')
      .select('*, sender:users!internal_messages_sender_id_fkey(full_name), receiver:users!internal_messages_receiver_id_fkey(full_name)')
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // جلب رسائل التكت
  static async getByTicket(ticketId) {
    const { data, error } = await supabase
      .from('internal_messages')
      .select('*, sender:users!internal_messages_sender_id_fkey(full_name)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  // جلب جميع المحادثات للمستخدم (آخر رسالة من كل محادثة)
  static async getUserConversations(userId) {
    const { data, error } = await supabase
      .from('internal_messages')
      .select('*, sender:users!internal_messages_sender_id_fkey(full_name), receiver:users!internal_messages_receiver_id_fkey(full_name)')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // تجميع آخر رسالة من كل محادثة
    const conversations = {};
    data.forEach(msg => {
      const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      if (!conversations[otherUserId]) {
        conversations[otherUserId] = {
          userId: otherUserId,
          userName: msg.sender_id === userId ? msg.receiver?.full_name : msg.sender?.full_name,
          lastMessage: msg.message,
          lastMessageAt: msg.created_at,
          unread: 0
        };
      }
      if (msg.receiver_id === userId && !msg.is_read) {
        conversations[otherUserId].unread += 1;
      }
    });

    return Object.values(conversations);
  }

  // عدد الرسائل غير المقروءة
  static async getUnreadCount(userId) {
    const { data, error } = await supabase
      .from('internal_messages')
      .select('id')
      .eq('receiver_id', userId)
      .eq('is_read', false);
    
    if (error) throw error;
    return data.length;
  }

  // إرسال رسالة
  static async create(messageData) {
    const { data, error } = await supabase
      .from('internal_messages')
      .insert([messageData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // تحديد الرسائل كمقروءة
  static async markAsRead(senderId, receiverId) {
    const { data, error } = await supabase
      .from('internal_messages')
      .update({ is_read: true })
      .eq('sender_id', senderId)
      .eq('receiver_id', receiverId)
      .eq('is_read', false)
      .select();
    
    if (error) throw error;
    return data;
  }

  // حذف رسالة
  static async delete(id) {
    const { data, error } = await supabase
      .from('internal_messages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }
}

module.exports = InternalMessage;