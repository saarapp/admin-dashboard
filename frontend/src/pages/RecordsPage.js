import React, { useState, useEffect } from 'react';
import api from '../services/api';
import s from '../sharedStyles';

function RecordsPage() {
  const [captainName, setCaptainName] = useState('');
  const [captainPhone, setCaptainPhone] = useState('');
  const [captainId, setCaptainId] = useState('');
  const [captainStats, setCaptainStats] = useState(null);
  const [captainBans, setCaptainBans] = useState([]);
  const [recordType, setRecordType] = useState('');
  const [amount, setAmount] = useState('');
  const [banDuration, setBanDuration] = useState('3');
  const [banReason, setBanReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [recentRecords, setRecentRecords] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  useEffect(function() { fetchRecentRecords(); }, []);

  function fetchTemplates(type) {
    if (type === 'ban') return;
    api.get('/settings/messages/type/' + type).then(function(res) {
      setTemplates(res.data.data);
      setSelectedTemplate('');
    }).catch(function() { setTemplates([]); });
  }

  function handleTypeChange(type) {
    setRecordType(type);
    if (type !== 'ban') {
      fetchTemplates(type);
    } else {
      setTemplates([]);
      setSelectedTemplate('');
    }
  }

  function handleNameChange(value) {
    setCaptainName(value);
    setCaptainStats(null);
    setCaptainBans([]);
    setCaptainId('');
    if (value.length >= 2) {
      api.get('/captains/search?name=' + value).then(function(res) {
        setSuggestions(res.data.data);
      }).catch(function() { setSuggestions([]); });
    } else {
      setSuggestions([]);
    }
  }

  function handlePhoneChange(value) {
    setCaptainPhone(value);
    setCaptainStats(null);
    setCaptainBans([]);
    setCaptainId('');
    if (value.length >= 5) {
      api.get('/captains/search?name=' + value).then(function(res) {
        if (res.data.data.length > 0) {
          setSuggestions(res.data.data);
        }
      }).catch(function() {});
    }
  }

  function selectSuggestion(captain) {
    setCaptainName(captain.name);
    setCaptainPhone(captain.phone_number);
    setCaptainId(captain.id);
    setSuggestions([]);
    fetchCaptainDetails(captain.id);
  }

  function fetchCaptainDetails(id) {
    api.get('/captains/' + id + '/record').then(function(res) {
      setCaptainStats(res.data.data.stats);
    }).catch(function() {});

    api.get('/bans/captain/' + id).then(function(res) {
      setCaptainBans(res.data.data);
    }).catch(function() {});
  }

  function fetchRecentRecords() {
    api.get('/records').then(function(res) {
      setRecentRecords(res.data.data.slice(0, 10));
    }).catch(function() {});
  }

  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // إذا حظر
    if (recordType === 'ban') {
      handleBan();
      return;
    }

    var findOrCreate = api.get('/captains/search?name=' + captainName)
      .then(function(res) {
        var existing = res.data.data.find(function(c) { return c.phone_number === captainPhone; });
        if (existing) return existing.id;
        return api.post('/captains', { name: captainName, phone_number: captainPhone })
          .then(function(r) { return r.data.data.id; });
      })
      .catch(function() {
        return api.post('/captains', { name: captainName, phone_number: captainPhone })
          .then(function(r) { return r.data.data.id; });
      });

    findOrCreate.then(function(cId) {
      return api.post('/records', {
        captain_id: cId,
        record_type: recordType,
        amount: amount ? parseFloat(amount) : null,
        template_id: selectedTemplate || null
      });
    }).then(function() {
      setMessage('✅ تم التسجيل بنجاح!');
      resetForm();
      fetchRecentRecords();
    }).catch(function(err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    }).finally(function() { setLoading(false); });
  }

  function handleBan() {
    var findOrCreate = api.get('/captains/search?name=' + captainName)
      .then(function(res) {
        var existing = res.data.data.find(function(c) { return c.phone_number === captainPhone; });
        if (existing) return existing.id;
        return api.post('/captains', { name: captainName, phone_number: captainPhone })
          .then(function(r) { return r.data.data.id; });
      })
      .catch(function() {
        return api.post('/captains', { name: captainName, phone_number: captainPhone })
          .then(function(r) { return r.data.data.id; });
      });

    findOrCreate.then(function(cId) {
      return api.post('/bans', {
        captain_id: cId,
        captain_name: captainName,
        captain_phone: captainPhone,
        reason: banReason,
        duration_days: parseInt(banDuration)
      });
    }).then(function() {
      setMessage('✅ تم حظر الكابتن وإرسال رسالة!');
      resetForm();
    }).catch(function(err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    }).finally(function() { setLoading(false); });
  }

  function resetForm() {
    setCaptainName(''); setCaptainPhone(''); setCaptainId('');
    setCaptainStats(null); setCaptainBans([]);
    setRecordType(''); setAmount(''); setBanDuration('3'); setBanReason('');
    setSuggestions([]); setTemplates([]); setSelectedTemplate('');
  }

  function getTypeLabel(type) {
    if (type === 'warning') return 'إنذار';
    if (type === 'deduction') return 'خصم';
    if (type === 'compensation') return 'تعويض';
    return type;
  }

  function getTypeGradient(type) {
    if (type === 'warning') return 'linear-gradient(135deg, #ffc400, #ffab00)';
    if (type === 'deduction') return 'linear-gradient(135deg, #ff1744, #ff5252)';
    if (type === 'compensation') return 'linear-gradient(135deg, #00c853, #00e676)';
    return '#666';
  }

  return (
    <div style={s.pageContainer}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>📝 تسجيل غرامة / تعويض / إنذار / حظر</h2>
      </div>

      {message && <div style={s.success}>{message}</div>}
      {error && <div style={s.error}>{error}</div>}

      <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
        {/* النموذج */}
        <div style={{...s.card, flex: 2, minWidth: '350px'}}>
          <form onSubmit={handleSubmit}>
            {/* اسم الكابتن */}
            <div style={s.inputGroup}>
              <label style={s.label}>اسم الكابتن:</label>
              <div style={{position: 'relative'}}>
                <input type="text" value={captainName}
                  onChange={function(e) { handleNameChange(e.target.value); }}
                  required style={s.input} placeholder="اكتب اسم الكابتن..." />
                {suggestions.length > 0 && (
                  <div style={styles.suggestions}>
                    {suggestions.map(function(captain) {
                      return (
                        <div key={captain.id} onClick={function() { selectSuggestion(captain); }} style={styles.suggestionItem}>
                          <div>
                            <strong style={{color: '#1a1a2e'}}>{captain.name}</strong>
                            <span style={{display: 'block', fontSize: '12px', color: '#999'}}>{captain.phone_number}</span>
                          </div>
                          <span style={{color: '#667eea', fontSize: '13px'}}>اختيار ←</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* رقم الهاتف */}
            <div style={s.inputGroup}>
              <label style={s.label}>رقم الهاتف:</label>
              <input type="text" value={captainPhone}
                onChange={function(e) { handlePhoneChange(e.target.value); }}
                required style={s.input} placeholder="07xxxxxxxxx" />
            </div>

            {/* نوع السجل */}
            <div style={s.inputGroup}>
              <label style={s.label}>النوع:</label>
              <div style={styles.typeButtons}>
                <div onClick={function() { handleTypeChange('warning'); }}
                  style={{...styles.typeCard, border: recordType === 'warning' ? '3px solid #ffc400' : '3px solid #e9ecef',
                    background: recordType === 'warning' ? 'linear-gradient(135deg, #fff8e1, #fff3e0)' : 'white'}}>
                  <span style={{fontSize: '26px'}}>⚠️</span>
                  <span style={{fontWeight: '700', fontSize: '13px', color: recordType === 'warning' ? '#f57f17' : '#999'}}>إنذار</span>
                </div>
                <div onClick={function() { handleTypeChange('deduction'); }}
                  style={{...styles.typeCard, border: recordType === 'deduction' ? '3px solid #ff1744' : '3px solid #e9ecef',
                    background: recordType === 'deduction' ? 'linear-gradient(135deg, #ffebee, #fce4ec)' : 'white'}}>
                  <span style={{fontSize: '26px'}}>➖</span>
                  <span style={{fontWeight: '700', fontSize: '13px', color: recordType === 'deduction' ? '#c62828' : '#999'}}>خصم</span>
                </div>
                <div onClick={function() { handleTypeChange('compensation'); }}
                  style={{...styles.typeCard, border: recordType === 'compensation' ? '3px solid #00c853' : '3px solid #e9ecef',
                    background: recordType === 'compensation' ? 'linear-gradient(135deg, #e8f5e9, #f1f8e9)' : 'white'}}>
                  <span style={{fontSize: '26px'}}>➕</span>
                  <span style={{fontWeight: '700', fontSize: '13px', color: recordType === 'compensation' ? '#2e7d32' : '#999'}}>تعويض</span>
                </div>
                <div onClick={function() { handleTypeChange('ban'); }}
                  style={{...styles.typeCard, border: recordType === 'ban' ? '3px solid #ff1744' : '3px solid #e9ecef',
                    background: recordType === 'ban' ? 'linear-gradient(135deg, #fce4ec, #f8bbd0)' : 'white'}}>
                  <span style={{fontSize: '26px'}}>🚫</span>
                  <span style={{fontWeight: '700', fontSize: '13px', color: recordType === 'ban' ? '#b71c1c' : '#999'}}>حظر</span>
                </div>
              </div>
            </div>

            {/* خيارات الحظر */}
            {recordType === 'ban' && (
              <div>
                <div style={s.inputGroup}>
                  <label style={s.label}>مدة الحظر:</label>
                  <div style={styles.durationButtons}>
                    {[
                      {value: '3', label: '3 أيام'},
                      {value: '7', label: 'أسبوع'},
                      {value: '14', label: 'أسبوعين'},
                      {value: '30', label: 'شهر'}
                    ].map(function(d) {
                      return (
                        <button key={d.value} type="button" onClick={function() { setBanDuration(d.value); }}
                          style={{...styles.durationBtn,
                            backgroundColor: banDuration === d.value ? '#ff1744' : '#f8f9fa',
                            color: banDuration === d.value ? 'white' : '#333',
                            border: banDuration === d.value ? '2px solid #ff1744' : '2px solid #e9ecef'}}>
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div style={s.inputGroup}>
                  <label style={s.label}>سبب الحظر:</label>
                  <input type="text" value={banReason}
                    onChange={function(e) { setBanReason(e.target.value); }}
                    style={s.input} placeholder="سبب الحظر..." />
                </div>
              </div>
            )}

            {/* اختيار الرسالة */}
            {recordType && recordType !== 'ban' && templates.length > 0 && (
              <div style={s.inputGroup}>
                <label style={s.label}>اختر الرسالة:</label>
                <div style={styles.templatesList}>
                  {templates.map(function(template) {
                    var isSelected = selectedTemplate === template.id;
                    return (
                      <div key={template.id} onClick={function() { setSelectedTemplate(template.id); }}
                        style={{...styles.templateCard,
                          border: isSelected ? '2px solid #667eea' : '2px solid #e9ecef',
                          backgroundColor: isSelected ? '#f0f4ff' : 'white'}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                          {isSelected && <span style={{color: '#667eea', fontSize: '18px'}}>✓</span>}
                          <div>
                            <span style={{fontWeight: '700', color: '#1a1a2e', fontSize: '14px'}}>{template.title}</span>
                            <p style={{margin: '4px 0 0 0', fontSize: '12px', color: '#999'}}>
                              {template.message_content.substring(0, 60)}...
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {recordType && recordType !== 'ban' && templates.length === 0 && (
              <div style={{...s.hint, borderRightColor: '#ffc400', backgroundColor: '#fffde7'}}>
                ⚠️ لا توجد رسائل مخصصة لهذا النوع. أضفها من الإعدادات أولاً.
              </div>
            )}

            {/* المبلغ */}
            {(recordType === 'deduction' || recordType === 'compensation') && (
              <div style={s.inputGroup}>
                <label style={s.label}>المبلغ:</label>
                <input type="number" value={amount}
                  onChange={function(e) { setAmount(e.target.value); }}
                  required style={s.input} placeholder="ادخل المبلغ" />
              </div>
            )}

            {/* زر الإرسال */}
            <button type="submit"
              disabled={loading || !captainName || !captainPhone || !recordType || (recordType !== 'ban' && !selectedTemplate)}
              style={{...s.btnPrimary, ...s.btnFull,
                background: recordType === 'ban' ? 'linear-gradient(135deg, #ff1744, #d50000)' : s.btnPrimary.background,
                opacity: loading || !captainName || !captainPhone || !recordType ? 0.5 : 1}}>
              {loading ? 'جاري التسجيل...' : recordType === 'ban' ? '🚫 تنفيذ الحظر' : '✅ تسجيل'}
            </button>
          </form>
        </div>

        {/* تفاصيل الكابتن */}
        <div style={{flex: 1, minWidth: '280px'}}>
          {captainStats ? (
            <div style={s.card}>
              <h3 style={{...s.sectionTitle, marginTop: 0}}>👤 تفاصيل الكابتن</h3>
              <div style={styles.captainInfo}>
                <div style={styles.captainAvatar}>
                  {captainName.charAt(0)}
                </div>
                <div>
                  <h4 style={{margin: '0 0 4px 0', color: '#1a1a2e'}}>{captainName}</h4>
                  <span style={{fontSize: '13px', color: '#999'}}>{captainPhone}</span>
                </div>
              </div>

              <div style={styles.miniStats}>
                <div style={styles.miniStat}>
                  <span style={styles.miniIcon}>⚠️</span>
                  <div>
                    <span style={styles.miniLabel}>إنذارات</span>
                    <span style={styles.miniNumber}>{captainStats.warnings || 0}</span>
                  </div>
                </div>
                <div style={styles.miniStat}>
                  <span style={styles.miniIcon}>➖</span>
                  <div>
                    <span style={styles.miniLabel}>خصومات</span>
                    <span style={styles.miniNumber}>{captainStats.totalDeductions || 0}</span>
                  </div>
                </div>
                <div style={styles.miniStat}>
                  <span style={styles.miniIcon}>➕</span>
                  <div>
                    <span style={styles.miniLabel}>تعويضات</span>
                    <span style={styles.miniNumber}>{captainStats.totalCompensations || 0}</span>
                  </div>
                </div>
                <div style={{...styles.miniStat, borderRight: captainStats.balance >= 0 ? '4px solid #00c853' : '4px solid #ff1744'}}>
                  <span style={styles.miniIcon}>💰</span>
                  <div>
                    <span style={styles.miniLabel}>الرصيد</span>
                    <span style={{...styles.miniNumber, color: captainStats.balance >= 0 ? '#00c853' : '#ff1744'}}>
                      {captainStats.balance || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* حالة الحظر */}
              {captainBans.length > 0 && (
                <div style={styles.banAlert}>
                  <span style={{fontSize: '20px'}}>🚫</span>
                  <div>
                    <strong style={{color: '#b71c1c'}}>محظور حالياً</strong>
                    <p style={{margin: '3px 0 0 0', fontSize: '12px', color: '#c62828'}}>
                      ينتهي: {new Date(captainBans[0].ban_end).toLocaleDateString('ar-IQ')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{...s.card, textAlign: 'center', padding: '40px 20px'}}>
              <span style={{fontSize: '50px', display: 'block', marginBottom: '10px'}}>👤</span>
              <p style={{color: '#bbb', fontSize: '14px'}}>اكتب اسم أو رقم الكابتن لعرض التفاصيل</p>
            </div>
          )}
        </div>
      </div>

      {/* آخر السجلات */}
      <div style={s.card}>
        <h3 style={{...s.sectionTitle, marginTop: 0}}>📋 آخر السجلات</h3>
        {recentRecords.length === 0 ? (
          <p style={s.noData}>لا توجد سجلات بعد</p>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>الكابتن</th>
                <th style={s.th}>النوع</th>
                <th style={s.th}>المبلغ</th>
                <th style={s.th}>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recentRecords.map(function(record) {
                return (
                  <tr key={record.id}>
                    <td style={s.td}>
                      <span style={{fontWeight: '600', color: '#1a1a2e'}}>{record.captains?.name || '-'}</span>
                    </td>
                    <td style={s.td}>
                      <span style={{...s.badge, background: getTypeGradient(record.record_type)}}>
                        {getTypeLabel(record.record_type)}
                      </span>
                    </td>
                    <td style={s.td}>{record.amount || '-'}</td>
                    <td style={{...s.td, color: '#999', fontSize: '12px'}}>
                      {new Date(record.created_at).toLocaleDateString('ar-IQ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

var styles = {
  suggestions: { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '2px solid #e9ecef', borderRadius: '0 0 12px 12px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' },
  suggestionItem: { padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  typeButtons: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  typeCard: { padding: '16px 10px', borderRadius: '14px', cursor: 'pointer', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', transition: 'all 0.3s' },
  templatesList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  templateCard: { padding: '14px 18px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s' },
  durationButtons: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  durationBtn: { padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.3s' },
  captainInfo: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '12px' },
  captainAvatar: { width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #667eea, #764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '20px', flexShrink: 0 },
  miniStats: { display: 'flex', flexDirection: 'column', gap: '10px' },
  miniStat: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '10px', borderRight: '4px solid #e9ecef' },
  miniIcon: { fontSize: '22px' },
  miniLabel: { display: 'block', fontSize: '12px', color: '#999' },
  miniNumber: { display: 'block', fontSize: '20px', fontWeight: '800', color: '#1a1a2e' },
  banAlert: { display: 'flex', alignItems: 'center', gap: '10px', padding: '14px', backgroundColor: '#ffebee', borderRadius: '10px', marginTop: '15px', border: '1px solid #ffcdd2' }
};

export default RecordsPage;