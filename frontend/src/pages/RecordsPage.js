// ============================================
// pages/RecordsPage.js - صفحة الغرامات والتعويضات
// ============================================

import React, { useState, useEffect } from 'react';
import api from '../services/api';

function RecordsPage() {
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [recordType, setRecordType] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [recentRecords, setRecentRecords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(() => {
    fetchRecentRecords();
  }, []);

  // جلب الرسائل المخصصة حسب النوع
  const fetchTemplates = async (type) => {
    try {
      const response = await api.get(`/settings/messages/type/${type}`);
      setTemplates(response.data.data);
      setSelectedTemplate('');
    } catch (error) {
      setTemplates([]);
      console.error('خطأ في جلب الرسائل:', error);
    }
  };

  // عند تغيير نوع السجل
  const handleTypeChange = (type) => {
    setRecordType(type);
    fetchTemplates(type);
  };

  // البحث عن كابتن أثناء الكتابة
  const handleNameChange = async (value) => {
    setCaptainName(value);

    if (value.length >= 2) {
      try {
        const response = await api.get(`/captains/search?name=${value}`);
        setSuggestions(response.data.data);
      } catch (error) {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  // اختيار كابتن من الاقتراحات
  const selectSuggestion = (captain) => {
    setCaptainName(captain.name);
    setCaptainPhone(captain.phone_number);
    setSuggestions([]);
  };

  // جلب آخر السجلات
  const fetchRecentRecords = async () => {
    try {
      const response = await api.get('/records');
      setRecentRecords(response.data.data.slice(0, 10));
    } catch (error) {
      console.error('خطأ في جلب السجلات:', error);
    }
  };

  // إرسال السجل
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // أولاً: البحث عن الكابتن أو إنشاؤه
      let captainId;

      try {
        const searchResponse = await api.get(`/captains/search?name=${captainName}`);
        const existingCaptain = searchResponse.data.data.find(
          c => c.phone_number === captainPhone
        );

        if (existingCaptain) {
          captainId = existingCaptain.id;
        } else {
          const createResponse = await api.post('/captains', {
            name: captainName,
            phone_number: captainPhone
          });
          captainId = createResponse.data.data.id;
        }
      } catch (err) {
        const createResponse = await api.post('/captains', {
          name: captainName,
          phone_number: captainPhone
        });
        captainId = createResponse.data.data.id;
      }

      // ثانياً: إنشاء السجل
      const data = {
        captain_id: captainId,
        record_type: recordType,
        amount: amount ? parseFloat(amount) : null,
        reason,
        notes,
        template_id: selectedTemplate || null
      };

      await api.post('/records', data);

      setMessage('تم التسجيل بنجاح! ✅');

      // إعادة تعيين النموذج
      setCaptainName('');
      setCaptainPhone('');
      setRecordType('');
      setAmount('');
      setReason('');
      setNotes('');
      setSuggestions([]);
      setTemplates([]);
      setSelectedTemplate('');

      // تحديث السجلات
      fetchRecentRecords();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // ترجمة نوع السجل
  const getTypeLabel = (type) => {
    switch (type) {
      case 'warning': return 'إنذار';
      case 'deduction': return 'خصم';
      case 'compensation': return 'تعويض';
      default: return type;
    }
  };

  // لون نوع السجل
  const getTypeColor = (type) => {
    switch (type) {
      case 'warning': return '#ffc107';
      case 'deduction': return '#dc3545';
      case 'compensation': return '#28a745';
      default: return '#666';
    }
  };

  return (
    <div style={styles.container}>
      <h2>تسجيل غرامة / تعويض / إنذار</h2>

      {/* رسائل النجاح والخطأ */}
      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* النموذج */}
      <div style={styles.formCard}>
        <form onSubmit={handleSubmit}>
          {/* اسم الكابتن */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>اسم الكابتن:</label>
            <div style={styles.autocomplete}>
              <input
                type="text"
                value={captainName}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                style={styles.input}
                placeholder="اكتب اسم الكابتن..."
              />
              {suggestions.length > 0 && (
                <div style={styles.suggestions}>
                  {suggestions.map((captain) => (
                    <div
                      key={captain.id}
                      style={styles.suggestionItem}
                      onClick={() => selectSuggestion(captain)}
                    >
                      <strong>{captain.name}</strong>
                      <span style={styles.suggestionPhone}>{captain.phone_number}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* رقم الهاتف */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>رقم الهاتف:</label>
            <input
              type="text"
              value={captainPhone}
              onChange={(e) => setCaptainPhone(e.target.value)}
              required
              style={styles.input}
              placeholder="مثال: 9647801234567"
            />
          </div>

          {/* نوع السجل */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>النوع:</label>
            <div style={styles.typeButtons}>
              <button
                type="button"
                onClick={() => handleTypeChange('warning')}
                style={{
                  ...styles.typeBtn,
                  backgroundColor: recordType === 'warning' ? '#ffc107' : '#f8f9fa',
                  color: recordType === 'warning' ? 'white' : '#333'
                }}
              >
                ⚠️ إنذار
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('deduction')}
                style={{
                  ...styles.typeBtn,
                  backgroundColor: recordType === 'deduction' ? '#dc3545' : '#f8f9fa',
                  color: recordType === 'deduction' ? 'white' : '#333'
                }}
              >
                ➖ خصم
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('compensation')}
                style={{
                  ...styles.typeBtn,
                  backgroundColor: recordType === 'compensation' ? '#28a745' : '#f8f9fa',
                  color: recordType === 'compensation' ? 'white' : '#333'
                }}
              >
                ➕ تعويض
              </button>
            </div>
          </div>

          {/* اختيار الرسالة المخصصة */}
          {recordType && templates.length > 0 && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>اختر الرسالة:</label>
              <div style={styles.templatesList}>
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    style={{
                      ...styles.templateItem,
                      border: selectedTemplate === template.id
                        ? `2px solid ${getTypeColor(recordType)}`
                        : '2px solid #eee',
                      backgroundColor: selectedTemplate === template.id
                        ? '#f8f9fa'
                        : 'white'
                    }}
                  >
                    <div style={styles.templateTitle}>
                      {selectedTemplate === template.id && '✅ '}
                      {template.title}
                    </div>
                    <div style={styles.templatePreview}>
                      {template.message_content.substring(0, 80)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* لا توجد رسائل */}
          {recordType && templates.length === 0 && (
            <div style={styles.noTemplates}>
              ⚠️ لا توجد رسائل مخصصة لهذا النوع. أضفها من الإعدادات أولاً.
            </div>
          )}

          {/* المبلغ (فقط للخصم والتعويض) */}
          {(recordType === 'deduction' || recordType === 'compensation') && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>المبلغ:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                style={styles.input}
                placeholder="ادخل المبلغ"
              />
            </div>
          )}

          {/* زر الإرسال */}
          <button
            type="submit"
            disabled={loading || !captainName || !captainPhone || !recordType || !selectedTemplate}
            style={{
              ...styles.submitBtn,
              opacity: loading || !captainName || !captainPhone || !recordType || !selectedTemplate ? 0.6 : 1
            }}
          >
            {loading ? 'جاري التسجيل...' : 'تسجيل'}
          </button>
        </form>
      </div>

      {/* آخر السجلات */}
      <div style={styles.recentCard}>
        <h3>آخر السجلات</h3>
        {recentRecords.length === 0 ? (
          <p>لا توجد سجلات بعد</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>الكابتن</th>
                <th style={styles.th}>النوع</th>
                <th style={styles.th}>المبلغ</th>
                <th style={styles.th}>السبب</th>
                <th style={styles.th}>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map((record) => (
                <tr key={record.id}>
                  <td style={styles.td}>{record.captains?.name || '-'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getTypeColor(record.record_type)
                    }}>
                      {getTypeLabel(record.record_type)}
                    </span>
                  </td>
                  <td style={styles.td}>{record.amount || '-'}</td>
                  <td style={styles.td}>{record.reason || '-'}</td>
                  <td style={styles.td}>
                    {new Date(record.created_at).toLocaleDateString('ar-IQ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    direction: 'rtl'
  },
  formCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginTop: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
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
  textarea: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px',
    minHeight: '80px',
    boxSizing: 'border-box'
  },
  autocomplete: {
    position: 'relative'
  },
  suggestions: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    border: '1px solid #ddd',
    borderRadius: '0 0 5px 5px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    zIndex: 10,
    maxHeight: '200px',
    overflowY: 'auto'
  },
  suggestionItem: {
    padding: '10px 15px',
    cursor: 'pointer',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  suggestionPhone: {
    color: '#666',
    fontSize: '13px'
  },
  typeButtons: {
    display: 'flex',
    gap: '10px'
  },
  typeBtn: {
    flex: 1,
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  templatesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  templateItem: {
    padding: '15px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },
  templateTitle: {
    fontWeight: 'bold',
    fontSize: '15px',
    color: '#333',
    marginBottom: '5px'
  },
  templatePreview: {
    fontSize: '13px',
    color: '#666'
  },
  noTemplates: {
    padding: '15px',
    backgroundColor: '#fff3cd',
    color: '#856404',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: 'bold'
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
  recentCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginTop: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
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
  }
};

export default RecordsPage;