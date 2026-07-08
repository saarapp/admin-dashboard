import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showUsers, setShowUsers] = useState(false);
  const [searchUser, setSearchUser] = useState('');
  const messagesEndRef = useRef(null);
  const intervalRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(function() {
    fetchConversations();
    fetchUsers();
    fetchUnread();
    return function() {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(function() {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(function() {
        fetchMessages(selectedUser.id);
        fetchUnread();
      }, 5000);
    }
    return function() {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [selectedUser]);

  useEffect(function() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function fetchConversations() {
    api.get('/messages/conversations').then(function(res) {
      setConversations(res.data.data);
    }).catch(function() {});
  }

  function fetchUsers() {
    api.get('/messages/users').then(function(res) {
      setUsers(res.data.data);
    }).catch(function() {});
  }

  function fetchUnread() {
    api.get('/messages/unread').then(function(res) {
      setUnread(res.data.data.unread);
    }).catch(function() {});
  }

  function fetchMessages(userId) {
    api.get('/messages/' + userId).then(function(res) {
      setMessages(res.data.data);
      fetchUnread();
      fetchConversations();
    }).catch(function() {});
  }

  function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;
    setLoading(true);
    api.post('/messages', {
      receiver_id: selectedUser.id,
      message: newMessage
    }).then(function() {
      setNewMessage('');
      fetchMessages(selectedUser.id);
      fetchConversations();
    }).catch(function() {}).finally(function() {
      setLoading(false);
    });
  }

  function selectConversation(conv) {
    setSelectedUser({ id: conv.userId, full_name: conv.userName });
    setShowUsers(false);
  }

  function startNewChat(user) {
    setSelectedUser(user);
    setShowUsers(false);
    setSearchUser('');
  }

  function getRandomColor(name) {
    var colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'];
    var index = 0;
    if (name) {
      for (var i = 0; i < name.length; i++) {
        index += name.charCodeAt(i);
      }
    }
    return colors[index % colors.length];
  }

  function formatTime(dateStr) {
    var date = new Date(dateStr);
    var now = new Date();
    var diff = now - date;
    var minutes = Math.floor(diff / 60000);
    var hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return minutes + ' د';
    if (hours < 24) return hours + ' س';
    return date.toLocaleDateString('ar-IQ');
  }

  var filteredUsers = users.filter(function(u) {
    if (!searchUser) return true;
    return u.full_name.includes(searchUser);
  });

  return (
    <div style={styles.container}>
      <div style={styles.chatLayout}>
        {/* القائمة الجانبية */}
        <div style={styles.sidebar}>
          {/* رأس القائمة */}
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarTitleRow}>
              <h3 style={styles.sidebarTitle}>المحادثات</h3>
              {unread > 0 && <span style={styles.totalUnread}>{unread}</span>}
            </div>
            <button onClick={function() { setShowUsers(!showUsers); }} style={styles.newChatBtn}>
              {showUsers ? '✕' : '＋'}
            </button>
          </div>

          {/* البحث */}
          {showUsers && (
            <div style={styles.searchBox}>
              <input
                type="text"
                value={searchUser}
                onChange={function(e) { setSearchUser(e.target.value); }}
                placeholder="ابحث عن موظف..."
                style={styles.searchInput}
              />
            </div>
          )}

          {/* قائمة المستخدمين */}
          {showUsers && (
            <div style={styles.usersList}>
              {filteredUsers.length === 0 ? (
                <p style={styles.emptyText}>لا يوجد نتائج</p>
              ) : (
                filteredUsers.map(function(user) {
                  return (
                    <div key={user.id} onClick={function() { startNewChat(user); }} style={styles.userItem}>
                      <div style={{...styles.avatar, backgroundColor: getRandomColor(user.full_name)}}>
                        {user.full_name.charAt(0)}
                      </div>
                      <div style={styles.userDetails}>
                        <span style={styles.userNameText}>{user.full_name}</span>
                        <span style={styles.userMeta}>
                          {user.role === 'admin' ? '🔑 مدير' : '👤 موظف'}
                          {user.city ? ' • ' + user.city : ''}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* المحادثات */}
          {!showUsers && (
            <div style={styles.convList}>
              {conversations.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>💬</span>
                  <p style={styles.emptyText}>لا توجد محادثات</p>
                  <p style={styles.emptyHint}>اضغط ＋ لبدء محادثة جديدة</p>
                </div>
              ) : (
                conversations.map(function(conv, index) {
                  var isActive = selectedUser?.id === conv.userId;
                  return (
                    <div key={index} onClick={function() { selectConversation(conv); }}
                      style={{...styles.convItem, ...(isActive ? styles.convItemActive : {})}}>
                      <div style={{...styles.avatar, backgroundColor: getRandomColor(conv.userName)}}>
                        {conv.userName?.charAt(0) || '?'}
                      </div>
                      <div style={styles.convDetails}>
                        <div style={styles.convTopRow}>
                          <span style={{...styles.convName, ...(isActive ? {color: 'white'} : {})}}>{conv.userName}</span>
                          <span style={{...styles.convTime, ...(isActive ? {color: 'rgba(255,255,255,0.7)'} : {})}}>
                            {formatTime(conv.lastMessageAt)}
                          </span>
                        </div>
                        <div style={styles.convBottomRow}>
                          <span style={{...styles.convLastMsg, ...(isActive ? {color: 'rgba(255,255,255,0.8)'} : {})}}>
                            {conv.lastMessage?.substring(0, 35)}
                            {conv.lastMessage?.length > 35 ? '...' : ''}
                          </span>
                          {conv.unread > 0 && (
                            <span style={styles.convUnread}>{conv.unread}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* منطقة المحادثة */}
        <div style={styles.chatArea}>
          {selectedUser ? (
            <div style={styles.chatContent}>
              {/* رأس المحادثة */}
              <div style={styles.chatHeader}>
                <div style={styles.chatHeaderLeft}>
                  <div style={{...styles.avatarMd, backgroundColor: getRandomColor(selectedUser.full_name)}}>
                    {selectedUser.full_name?.charAt(0)}
                  </div>
                  <div>
                    <span style={styles.chatHeaderName}>{selectedUser.full_name}</span>
                    <span style={styles.chatHeaderStatus}>متصل</span>
                  </div>
                </div>
              </div>

              {/* الرسائل */}
              <div style={styles.messagesArea}>
                {messages.length === 0 ? (
                  <div style={styles.emptyChat}>
                    <span style={styles.emptyChatIcon}>👋</span>
                    <p style={styles.emptyChatText}>ابدأ المحادثة مع {selectedUser.full_name}</p>
                  </div>
                ) : (
                  messages.map(function(msg) {
                    var isMine = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} style={{
                        ...styles.msgRow,
                        justifyContent: isMine ? 'flex-end' : 'flex-start'
                      }}>
                        {!isMine && (
                          <div style={{...styles.avatarSm, backgroundColor: getRandomColor(msg.sender?.full_name)}}>
                            {msg.sender?.full_name?.charAt(0)}
                          </div>
                        )}
                        <div style={{
                          ...styles.msgBubble,
                          ...(isMine ? styles.msgMine : styles.msgOther)
                        }}>
                          {!isMine && <span style={styles.msgSender}>{msg.sender?.full_name}</span>}
                          <p style={styles.msgText}>{msg.message}</p>
                          <span style={{
                            ...styles.msgTime,
                            color: isMine ? 'rgba(255,255,255,0.6)' : '#aaa'
                          }}>
                            {new Date(msg.created_at).toLocaleTimeString('ar-IQ', { hour: '2-digit', minute: '2-digit' })}
                            {isMine && ' ✓✓'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* إرسال رسالة */}
              <div style={styles.inputArea}>
                <form onSubmit={handleSendMessage} style={styles.inputForm}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={function(e) { setNewMessage(e.target.value); }}
                    placeholder="اكتب رسالتك هنا..."
                    style={styles.msgInput}
                  />
                  <button type="submit" disabled={loading || !newMessage.trim()} style={{
                    ...styles.sendBtn,
                    opacity: !newMessage.trim() ? 0.5 : 1
                  }}>
                    <span style={styles.sendIcon}>➤</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div style={styles.noChat}>
              <div style={styles.noChatContent}>
                <span style={styles.noChatIcon}>💬</span>
                <h3 style={styles.noChatTitle}>مرحباً بك في الدردشة</h3>
                <p style={styles.noChatDesc}>اختر محادثة من القائمة أو ابدأ محادثة جديدة</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

var styles = {
  container: { padding: '0', direction: 'rtl', height: 'calc(100vh - 73px)' },
  chatLayout: { display: 'flex', height: '100%', overflow: 'hidden' },

  // القائمة الجانبية
  sidebar: { width: '320px', backgroundColor: 'white', borderLeft: '1px solid #e9ecef', display: 'flex', flexDirection: 'column' },
  sidebarHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #f0f0f0' },
  sidebarTitleRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  sidebarTitle: { fontSize: '20px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  totalUnread: { backgroundColor: '#667eea', color: 'white', borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '700' },
  newChatBtn: { width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  // البحث
  searchBox: { padding: '12px 20px', borderBottom: '1px solid #f0f0f0' },
  searchInput: { width: '100%', padding: '10px 15px', border: '2px solid #e9ecef', borderRadius: '25px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },

  // المستخدمين
  usersList: { flex: 1, overflowY: 'auto', padding: '8px' },
  userItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 15px', cursor: 'pointer', borderRadius: '12px', marginBottom: '4px', transition: 'background 0.2s' },
  userDetails: { display: 'flex', flexDirection: 'column' },
  userNameText: { fontSize: '14px', fontWeight: '600', color: '#333' },
  userMeta: { fontSize: '11px', color: '#999', marginTop: '2px' },

  // المحادثات
  convList: { flex: 1, overflowY: 'auto' },
  convItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', cursor: 'pointer', borderBottom: '1px solid #f8f8f8', transition: 'all 0.2s' },
  convItemActive: { background: 'linear-gradient(135deg, #667eea, #764ba2)', borderRadius: '0' },
  convDetails: { flex: 1, overflow: 'hidden' },
  convTopRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  convName: { fontSize: '14px', fontWeight: '600', color: '#333' },
  convTime: { fontSize: '11px', color: '#bbb' },
  convBottomRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  convLastMsg: { fontSize: '12px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 },
  convUnread: { backgroundColor: '#667eea', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0 },

  // حالة فارغة
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '40px' },
  emptyIcon: { fontSize: '50px', marginBottom: '15px' },
  emptyText: { color: '#999', fontSize: '15px', marginBottom: '5px' },
  emptyHint: { color: '#ccc', fontSize: '12px' },

  // الأفاتار
  avatar: { width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '18px', flexShrink: 0 },
  avatarMd: { width: '42px', height: '42px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0 },
  avatarSm: { width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '600', fontSize: '13px', flexShrink: 0 },

  // منطقة المحادثة
  chatArea: { flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f0f2f5' },
  chatContent: { display: 'flex', flexDirection: 'column', height: '100%' },

  // رأس المحادثة
  chatHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', backgroundColor: 'white', borderBottom: '1px solid #e9ecef' },
  chatHeaderLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  chatHeaderName: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e', display: 'block' },
  chatHeaderStatus: { fontSize: '12px', color: '#28a745' },

  // الرسائل
  messagesArea: { flex: 1, overflowY: 'auto', padding: '20px 25px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23e0e0e0\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' },
  emptyChat: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' },
  emptyChatIcon: { fontSize: '60px', marginBottom: '15px' },
  emptyChatText: { color: '#999', fontSize: '16px' },

  // فقاعات الرسائل
  msgRow: { display: 'flex', alignItems: 'flex-end', gap: '8px' },
  msgBubble: { maxWidth: '65%', padding: '12px 16px', borderRadius: '18px', position: 'relative' },
  msgMine: { background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', borderBottomLeft: '18px', borderBottomRight: '4px' },
  msgOther: { backgroundColor: 'white', color: '#333', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', borderBottomRight: '18px', borderBottomLeft: '4px' },
  msgSender: { fontSize: '11px', fontWeight: '700', color: '#667eea', display: 'block', marginBottom: '3px' },
  msgText: { margin: 0, fontSize: '14px', lineHeight: '1.6', wordBreak: 'break-word' },
  msgTime: { fontSize: '10px', display: 'block', textAlign: 'left', marginTop: '5px' },

  // إرسال رسالة
  inputArea: { padding: '15px 25px', backgroundColor: 'white', borderTop: '1px solid #e9ecef' },
  inputForm: { display: 'flex', gap: '12px', alignItems: 'center' },
  msgInput: { flex: 1, padding: '14px 20px', border: '2px solid #e9ecef', borderRadius: '25px', fontSize: '14px', outline: 'none', backgroundColor: '#f8f9fa', transition: 'border 0.3s' },
  sendBtn: { width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' },
  sendIcon: { color: 'white', fontSize: '20px', transform: 'rotate(180deg)' },

  // لا محادثة
  noChat: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' },
  noChatContent: { textAlign: 'center' },
  noChatIcon: { fontSize: '80px', display: 'block', marginBottom: '20px' },
  noChatTitle: { fontSize: '24px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px' },
  noChatDesc: { fontSize: '15px', color: '#999' }
};

export default ChatPage;