// ============================================
// pages/WhatsappPage.js - صفحة إدارة الواتساب
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function WhatsappPage() {
  const [sessions, setSessions] = useState({});
  const [newSession, setNewSession] = useState({ sessionId: '', phoneNumber: '' });
  const [qrCode, setQrCode] = useState(null);
  const [activeSession, setActiveSession] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [testSession, setTestSession] = useState('');
  const intervalRef = useRef(null);

  // 1. جلب جميع الجلسات عند تحميل الصفحة
  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/whatsapp/sessions', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSessions(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الجلسات:', error);
    }
  };

  // 2. إنشاء جلسة جديدة (خارج الـ useEffect)
  const handleCreateSession = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    setQrCode(null);

    try {
      const token = localStorage.getItem('token');
      await api.post('/whatsapp/session', {
        sessionId: newSession.sessionId,
        phoneNumber: newSession.phoneNumber
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setMessage('جاري تهيئة الجلسة... انتظر ظهور QR Code');
      setActiveSession(newSession.sessionId);

      // بدء مراقبة QR Code
      startQRPolling(newSession.sessionId);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في الاتصال بالسيرفر');
    } finally {
      setLoading(false);
    }
  };

  // 3. مراقبة QR Code (خارج الـ useEffect)
  const startQRPolling = (sessionId) => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/whatsapp/session/${sessionId}/qr`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = response.data.data;

        if (data.sessionStatus === 'connected') {
          setQrCode(null);
          setMessage('✅ تم الاتصال بنجاح!');
          clearInterval(intervalRef.current);
          fetchSessions();
        } else if (data.qrCode) {
          setQrCode(data.qrCode);
          setMessage('📱 امسح QR Code من تطبيق الواتساب');
        }
      } catch (error) {
        console.error('خطأ في جلب QR:', error);
      }
    }, 3000);
  };

  // إرسال رسالة اختبارية
  const handleSendTest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await api.post('/whatsapp/send-test', {
        sessionId: testSession,
        phoneNumber: testPhone
      });

      setMessage('✅ تم إرسال الرسالة الاختبارية بنجاح!');
      setTestPhone('');
    } catch (err) {
      setError(err.response?.data?.message || 'فشل إرسال الرسالة');
    } finally {
      setLoading(false);
    }
  };

  // إغلاق جلسة
  const handleCloseSession = async (sessionId) => {
    if (!window.confirm('هل أنت متأكد من إغلاق هذه الجلسة؟')) return;

    try {
      await api.delete(`/whatsapp/session/${sessionId}`);
      setMessage('تم إغلاق الجلسة! ✅');
      fetchSessions();
    } catch (error) {
      setError('خطأ في إغلاق الجلسة');
    }
  };

  // ترجمة الحالة
  const getStatusLabel = (status) => {
    switch (status) {
      case 'connected': return 'متصل ✅';
      case 'waiting_qr': return 'بانتظار المسح 📱';
      case 'initializing': return 'جاري التهيئة ⏳';
      case 'disconnected': return 'منفصل ❌';
      case 'auth_failure': return 'فشل المصادقة ❌';
      case 'closed': return 'مغلق 🔒';
      case 'error': return 'خطأ ⚠️';
      default: return status;
    }
  };

  // لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return '#28a745';
      case 'waiting_qr': return '#ffc107';
      case 'initializing': return '#17a2b8';
      case 'disconnected': return '#dc3545';
      case 'auth_failure': return '#dc3545';
      case 'closed': return '#6c757d';
      case 'error': return '#dc3545';
      default: return '#666';
    }
  };

  // الجلسات المتصلة
  const connectedSessions = Object.keys(sessions).filter(
    id => sessions[id].status === 'connected'
  );

  return (
    <div style={styles.container}>
      <h2>إدارة الواتساب</h2>

      {/* رسائل */}
      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* إحصائيات سريعة */}
      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, borderRight: '4px solid #28a745' }}>
          <h4>متصل</h4>
          <p style={styles.statNumber}>
            {Object.values(sessions).filter(s => s.status === 'connected').length}
          </p>
        </div>
        <div style={{ ...styles.statCard, borderRight: '4px solid #ffc107' }}>
          <h4>بانتظار المسح</h4>
          <p style={styles.statNumber}>
            {Object.values(sessions).filter(s => s.status === 'waiting_qr').length}
          </p>
        </div>
        <div style={{ ...styles.statCard, borderRight: '4px solid #dc3545' }}>
          <h4>منفصل</h4>
          <p style={styles.statNumber}>
            {Object.values(sessions).filter(s => s.status === 'disconnected').length}
          </p>
        </div>
      </div>

      {/* إنشاء جلسة جديدة */}
      <div style={styles.card}>
        <h3>ربط رقم واتساب جديد</h3>
        <form onSubmit={handleCreateSession} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>اسم الجلسة:</label>
              <input
                type="text"
                value={newSession.sessionId}
                onChange={(e) => setNewSession({ ...newSession, sessionId: e.target.value })}
                required
                style={styles.input}
                placeholder="مثال: phone1"
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>رقم الهاتف:</label>
              <input
                type="text"
                value={newSession.phoneNumber}
                onChange={(e) => setNewSession({ ...newSession, phoneNumber: e.target.value })}
                required
                style={styles.input}
                placeholder="مثال: 9647801234567"
              />
            </div>
            <button type="submit" disabled={loading} style={styles.connectBtn}>
              {loading ? 'جاري الربط...' : '🔗 ربط'}
            </button>
          </div>
        </form>

        {/* عرض QR Code */}
        {qrCode && (
          <div style={styles.qrContainer}>
            <h4>امسح هذا الكود من تطبيق الواتساب:</h4>
            <p style={styles.qrHint}>
              افتح الواتساب ← النقاط الثلاث ← الأجهزة المرتبطة ← ربط جهاز
            </p>
            <img src={qrCode} alt="QR Code" style={styles.qrImage} />
          </div>
        )}
      </div>

      {/* الجلسات الحالية */}
      <div style={styles.card}>
        <h3>الأرقام المربوطة</h3>
        {Object.keys(sessions).length === 0 ? (
          <p style={styles.noData}>لا توجد أرقام مربوطة بعد</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>اسم الجلسة</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(sessions).map((sessionId) => (
                <tr key={sessionId}>
                  <td style={styles.td}>{sessionId}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(sessions[sessionId].status)
                    }}>
                      {getStatusLabel(sessions[sessionId].status)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {sessions[sessionId].status === 'waiting_qr' && (
                      <button
                        onClick={() => {
                          setActiveSession(sessionId);
                          startQRPolling(sessionId);
                        }}
                        style={{ ...styles.actionBtn, backgroundColor: '#17a2b8' }}
                      >
                        عرض QR
                      </button>
                    )}
                    <button
                      onClick={() => handleCloseSession(sessionId)}
                      style={{ ...styles.actionBtn, backgroundColor: '#dc3545' }}
                    >
                      إغلاق
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* إرسال رسالة اختبارية */}
      {connectedSessions.length > 0 && (
        <div style={styles.card}>
          <h3>إرسال رسالة اختبارية</h3>
          <form onSubmit={handleSendTest} style={styles.form}>
            <div style={styles.formRow}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>الجلسة:</label>
                <select
                  value={testSession}
                  onChange={(e) => setTestSession(e.target.value)}
                  required
                  style={styles.select}
                >
                  <option value="">-- اختر --</option>
                  {connectedSessions.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>رقم المستلم:</label>
                <input
                  type="text"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  required
                  style={styles.input}
                  placeholder="9647801234567"
                />
              </div>
              <button type="submit" disabled={loading} style={styles.testBtn}>
                {loading ? 'جاري الإرسال...' : '📨 إرسال اختبار'}
              </button>
            </div>
          </form>
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginTop: '20px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: '5px 0 0 0'
  },
  card: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginTop: '20px'
  },
  form: {
    marginTop: '15px'
  },
  formRow: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end',
    flexWrap: 'wrap'
  },
  inputGroup: {
    flex: 1,
    minWidth: '200px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333',
    fontSize: '14px'
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
  connectBtn: {
    padding: '10px 25px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    height: '42px'
  },
  testBtn: {
    padding: '10px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    height: '42px'
  },
  qrContainer: {
    textAlign: 'center',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px'
  },
  qrHint: {
    color: '#666',
    fontSize: '13px',
    marginBottom: '15px'
  },
  qrImage: {
    maxWidth: '300px',
    border: '5px solid white',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'right',
    borderBottom: '2px solid #ddd',
    color: '#333'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #eee',
    textAlign: 'right'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '15px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  actionBtn: {
    padding: '5px 12px',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
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

export default WhatsappPage;