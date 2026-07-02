// ============================================
// pages/SettingsPage.js - صفحة الإعدادات
// ============================================

import React, { useState, useEffect } from 'react';
import api from '../services/api';

function SettingsPage() {
  const [activeTab, setActiveTab] = useState('messages');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [templates, setTemplates] = useState([]);
  const [editTemplate, setEditTemplate] = useState({
    message_type: '',
    title: '',
    message_content: '',
    editId: null
  });

  const [whatsappNumbers, setWhatsappNumbers] = useState([]);
  const [newNumber, setNewNumber] = useState({ phone_number: '', api_key: '' });

  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'accountant'
  });

  useEffect(() => {
    fetchTemplates();
    fetchWhatsappNumbers();
    fetchUsers();
  }, []);

  // ============================================
  // دوال الرسائل المخصصة
  // ============================================

  const fetchTemplates = async () => {
    try {
      const response = await api.get('/settings/messages');
      setTemplates(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الرسائل:', error);
    }
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (editTemplate.editId) {
        await api.put(`/settings/messages/${editTemplate.editId}`, {
          title: editTemplate.title,
          message_content: editTemplate.message_content
        });
        setMessage('تم تحديث الرسالة بنجاح! ✅');
      } else {
        await api.post('/settings/messages', {
          message_type: editTemplate.message_type,
          title: editTemplate.title,
          message_content: editTemplate.message_content
        });
        setMessage('تم إضافة الرسالة بنجاح! ✅');
      }

      setEditTemplate({ message_type: '', title: '', message_content: '', editId: null });
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTemplate = (template) => {
    setEditTemplate({
      message_type: template.message_type,
      title: template.title || '',
      message_content: template.message_content,
      editId: template.id
    });
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;

    try {
      await api.delete(`/settings/messages/${id}`);
      setMessage('تم حذف الرسالة! ✅');
      fetchTemplates();
    } catch (error) {
      setError('خطأ في حذف الرسالة');
    }
  };

  // ============================================
  // دوال أرقام الواتساب
  // ============================================

  const fetchWhatsappNumbers = async () => {
    try {
      const response = await api.get('/settings/whatsapp');
      setWhatsappNumbers(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الأرقام:', error);
    }
  };

  const handleAddNumber = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/settings/whatsapp', newNumber);
      setMessage('تم إضافة الرقم بنجاح! ✅');
      setNewNumber({ phone_number: '', api_key: '' });
      fetchWhatsappNumbers();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNumber = async (id, isActive) => {
    try {
      await api.patch(`/settings/whatsapp/${id}/toggle`, { is_active: !isActive });
      fetchWhatsappNumbers();
    } catch (error) {
      console.error('خطأ في تغيير الحالة:', error);
    }
  };

  const handleDeleteNumber = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الرقم؟')) return;

    try {
      await api.delete(`/settings/whatsapp/${id}`);
      setMessage('تم حذف الرقم! ✅');
      fetchWhatsappNumbers();
    } catch (error) {
      setError('خطأ في حذف الرقم');
    }
  };

  // ============================================
  // دوال الموظفين
  // ============================================

  const fetchUsers = async () => {
    try {
      const response = await api.get('/settings/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الموظفين:', error);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/settings/users', newUser);
      setMessage('تم إضافة الموظف بنجاح! ✅');
      setNewUser({ email: '', password: '', full_name: '', role: 'accountant' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;

    try {
      await api.delete(`/settings/users/${id}`);
      setMessage('تم حذف الموظف! ✅');
      fetchUsers();
    } catch (error) {
      setError('خطأ في حذف الموظف');
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'warning': return 'إنذار';
      case 'deduction': return 'خصم';
      case 'compensation': return 'تعويض';
      default: return type;
    }
  };

  return (
    <div style={styles.container}>
      <h2>الإعدادات</h2>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('messages')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'messages' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'messages' ? 'white' : '#333'
          }}
        >
          📝 الرسائل المخصصة
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'whatsapp' ? '#28a745' : '#f8f9fa',
            color: activeTab === 'whatsapp' ? 'white' : '#333'
          }}
        >
          📱 أرقام الواتساب
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'users' ? '#6f42c1' : '#f8f9fa',
            color: activeTab === 'users' ? 'white' : '#333'
          }}
        >
          👥 الموظفين
        </button>
      </div>

      {/* تبويب الرسائل المخصصة */}
      {activeTab === 'messages' && (
        <div style={styles.tabContent}>
          <h3>الرسائل المخصصة</h3>
          <p style={styles.hint}>
            المتغيرات المتاحة: {'{captain_name}'} - {'{amount}'} - {'{reason}'} - {'{date}'}
          </p>

          <form onSubmit={handleSaveTemplate} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>نوع الرسالة:</label>
              <select
                value={editTemplate.message_type}
                onChange={(e) => setEditTemplate({ ...editTemplate, message_type: e.target.value })}
                required
                disabled={!!editTemplate.editId}
                style={styles.select}
              >
                <option value="">-- اختر النوع --</option>
                <option value="warning">إنذار</option>
                <option value="deduction">خصم</option>
                <option value="compensation">تعويض</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>عنوان الرسالة:</label>
              <input
                type="text"
                value={editTemplate.title}
                onChange={(e) => setEditTemplate({ ...editTemplate, title: e.target.value })}
                required
                style={styles.input}
                placeholder="مثال: خصم تأخير، خصم غياب، إنذار أول..."
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>محتوى الرسالة:</label>
              <textarea
                value={editTemplate.message_content}
                onChange={(e) => setEditTemplate({ ...editTemplate, message_content: e.target.value })}
                required
                style={styles.textarea}
                placeholder="مثال: السلام عليكم {captain_name}، تم خصم مبلغ {amount} بسبب {reason} بتاريخ {date}"
                rows={4}
              />
            </div>

            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? 'جاري الحفظ...' : editTemplate.editId ? 'تحديث الرسالة' : 'إضافة رسالة'}
            </button>

            {editTemplate.editId && (
              <button
                type="button"
                onClick={() => setEditTemplate({ message_type: '', title: '', message_content: '', editId: null })}
                style={{ ...styles.saveBtn, backgroundColor: '#6c757d', marginTop: '10px' }}
              >
                إلغاء التعديل
              </button>
            )}
          </form>

          <div style={styles.listCard}>
            <h4>الرسائل الحالية:</h4>
            {templates.length === 0 ? (
              <p style={styles.noData}>لا توجد رسائل بعد</p>
            ) : (
              templates.map((template) => (
                <div key={template.id} style={styles.templateItem}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.templateHeader}>
                      <span style={styles.templateType}>
                        {getTypeLabel(template.message_type)}
                      </span>
                      <span style={styles.templateTitleText}>
                        {template.title || 'بدون عنوان'}
                      </span>
                    </div>
                    <p style={styles.templateContent}>{template.message_content}</p>
                  </div>
                  <div style={styles.templateActions}>
                    <button
                      onClick={() => handleEditTemplate(template)}
                      style={styles.editBtn}
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      style={{ ...styles.editBtn, backgroundColor: '#dc3545' }}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* تبويب أرقام الواتساب */}
      {activeTab === 'whatsapp' && (
        <div style={styles.tabContent}>
          <h3>إدارة أرقام الواتساب</h3>
          <p style={styles.hint}>أضف أرقام متعددة لتوزيع الحمل وتجنب الحظر</p>

          <form onSubmit={handleAddNumber} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>رقم الواتساب:</label>
              <input
                type="text"
                value={newNumber.phone_number}
                onChange={(e) => setNewNumber({ ...newNumber, phone_number: e.target.value })}
                required
                style={styles.input}
                placeholder="مثال: 9647801234567"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>API Key (اختياري):</label>
              <input
                type="text"
                value={newNumber.api_key}
                onChange={(e) => setNewNumber({ ...newNumber, api_key: e.target.value })}
                style={styles.input}
                placeholder="مفتاح API الخاص بالرقم"
              />
            </div>

            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? 'جاري الإضافة...' : 'إضافة رقم'}
            </button>
          </form>

          <div style={styles.listCard}>
            <h4>الأرقام الحالية:</h4>
            {whatsappNumbers.length === 0 ? (
              <p style={styles.noData}>لا توجد أرقام بعد</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>الرقم</th>
                    <th style={styles.th}>الحالة</th>
                    <th style={styles.th}>الرسائل المرسلة</th>
                    <th style={styles.th}>آخر استخدام</th>
                    <th style={styles.th}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {whatsappNumbers.map((number) => (
                    <tr key={number.id}>
                      <td style={styles.td}>{number.phone_number}</td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: number.is_active ? '#28a745' : '#dc3545'
                        }}>
                          {number.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td style={styles.td}>{number.total_sent || 0}</td>
                      <td style={styles.td}>
                        {number.last_used_at
                          ? new Date(number.last_used_at).toLocaleDateString('ar-IQ')
                          : 'لم يستخدم'}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleToggleNumber(number.id, number.is_active)}
                          style={{
                            ...styles.actionBtn,
                            backgroundColor: number.is_active ? '#ffc107' : '#28a745'
                          }}
                        >
                          {number.is_active ? 'تعطيل' : 'تفعيل'}
                        </button>
                        <button
                          onClick={() => handleDeleteNumber(number.id)}
                          style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* تبويب الموظفين */}
      {activeTab === 'users' && (
        <div style={styles.tabContent}>
          <h3>إدارة الموظفين</h3>

          <form onSubmit={handleAddUser} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>الاسم الكامل:</label>
              <input
                type="text"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                required
                style={styles.input}
                placeholder="اسم الموظف"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>البريد الإلكتروني:</label>
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
                style={styles.input}
                placeholder="example@company.com"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>كلمة المرور:</label>
              <input
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                style={styles.input}
                placeholder="كلمة مرور قوية"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>الدور:</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                required
                style={styles.select}
              >
                <option value="accountant">محاسب</option>
                <option value="admin">مدير</option>
              </select>
            </div>

            <button type="submit" disabled={loading} style={styles.saveBtn}>
              {loading ? 'جاري الإضافة...' : 'إضافة موظف'}
            </button>
          </form>

          <div style={styles.listCard}>
            <h4>الموظفين الحاليين:</h4>
            {users.length === 0 ? (
              <p style={styles.noData}>لا يوجد موظفين</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>الاسم</th>
                    <th style={styles.th}>البريد</th>
                    <th style={styles.th}>الدور</th>
                    <th style={styles.th}>الحالة</th>
                    <th style={styles.th}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={styles.td}>{user.full_name}</td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>
                        {user.role === 'admin' ? 'مدير' : 'محاسب'}
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: user.is_active ? '#28a745' : '#dc3545'
                        }}>
                          {user.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    direction: 'rtl'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  tab: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  tabContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '0 0 10px 10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  hint: {
    color: '#666',
    fontSize: '13px',
    backgroundColor: '#f8f9fa',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px'
  },
  form: {
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  saveBtn: {
    padding: '10px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  listCard: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px'
  },
  templateItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: 'white',
    borderRadius: '5px',
    marginBottom: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  templateHeader: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    marginBottom: '5px'
  },
  templateType: {
    fontWeight: 'bold',
    color: '#007bff'
  },
  templateTitleText: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px'
  },
  templateContent: {
    color: '#666',
    fontSize: '13px',
    marginTop: '5px'
  },
  templateActions: {
    display: 'flex',
    gap: '5px',
    flexDirection: 'column'
  },
  editBtn: {
    padding: '6px 15px',
    backgroundColor: '#ffc107',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  },
  th: {
    backgroundColor: '#e9ecef',
    padding: '10px',
    textAlign: 'right',
    borderBottom: '2px solid #ddd',
    fontSize: '13px'
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #eee',
    textAlign: 'right',
    fontSize: '13px'
  },
  badge: {
    padding: '3px 8px',
    borderRadius: '15px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  actionBtn: {
    padding: '4px 10px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '11px',
    marginLeft: '5px'
  },
  success: {
    backgroundColor: '#d4edda',
    color: '#155724',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '10px',
    textAlign: 'center'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '10px',
    textAlign: 'center'
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: '20px'
  }
};

export default SettingsPage;