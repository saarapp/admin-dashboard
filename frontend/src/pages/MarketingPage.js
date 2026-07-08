// ============================================
// pages/MarketingPage.js - صفحة التسويق
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function MarketingPage() {
  const [activeTab, setActiveTab] = useState('captains');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [campaigns, setCampaigns] = useState([]);

  // إرسال لكل الكابتنات
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastHours, setBroadcastHours] = useState(12);

  // استيراد CSV
  const [csvNumbers, setCsvNumbers] = useState([]);
  const [csvMessage, setCsvMessage] = useState('');
  const [csvHours, setCsvHours] = useState(12);
  const [csvFileName, setCsvFileName] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await api.get('/marketing/campaigns');
      setCampaigns(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الحملات:', error);
    }
  };

  // إرسال لكل الكابتنات
  const handleSendToAll = async (e) => {
    e.preventDefault();
    if (!window.confirm('هل أنت متأكد من إرسال الرسالة لجميع الكابتنات؟')) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/marketing/send-all', {
        message: broadcastMessage,
        totalHours: broadcastHours
      });

      setMessage(`✅ ${response.data.message}`);
      setBroadcastMessage('');
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // قراءة ملف CSV
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setCsvFileName(file.name);
    setCheckResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      const numbers = [];

      lines.forEach(line => {
        const cleaned = line.trim().replace(/[",]/g, '');
        if (cleaned && cleaned.match(/[\d+]/)) {
          numbers.push(cleaned);
        }
      });

      setCsvNumbers(numbers);
      setMessage(`✅ تم قراءة ${numbers.length} رقم من الملف`);
    };

    reader.readAsText(file);
  };

  // فحص الأرقام
  const handleCheckNumbers = async () => {
    if (csvNumbers.length === 0) {
      setError('لا توجد أرقام للفحص');
      return;
    }

    setChecking(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/marketing/check-numbers', {
        numbers: csvNumbers
      });

      setCheckResult(response.data.data);
      setMessage(`✅ تم الفحص: ${response.data.data.hasWhatsapp} بيهم واتساب، ${response.data.data.noWhatsapp} بدون`);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في الفحص');
    } finally {
      setChecking(false);
    }
  };

  // إرسال من CSV
  const handleSendCSV = async (e) => {
    e.preventDefault();

    const numbersToSend = checkResult ? checkResult.numbers.hasWhatsapp : csvNumbers;

    if (numbersToSend.length === 0) {
      setError('لا توجد أرقام للإرسال');
      return;
    }

    if (!window.confirm(`هل أنت متأكد من إرسال الرسالة لـ ${numbersToSend.length} رقم؟`)) return;

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/marketing/send-csv', {
        numbers: numbersToSend,
        message: csvMessage,
        totalHours: csvHours
      });

      setMessage(`✅ ${response.data.message}`);
      setCsvMessage('');
      setCsvNumbers([]);
      setCsvFileName('');
      setCheckResult(null);
      fetchCampaigns();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  // إيقاف حملة
  const handleStopCampaign = async (id) => {
    if (!window.confirm('هل أنت متأكد من إيقاف هذه الحملة؟')) return;

    try {
      await api.put(`/marketing/campaigns/${id}/stop`);
      setMessage('✅ تم إيقاف الحملة');
      fetchCampaigns();
    } catch (err) {
      setError('خطأ في إيقاف الحملة');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'running': return 'جاري الإرسال...';
      case 'completed': return 'مكتملة';
      case 'stopped': return 'متوقفة';
      case 'failed': return 'فاشلة';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'running': return '#17a2b8';
      case 'completed': return '#28a745';
      case 'stopped': return '#6c757d';
      case 'failed': return '#dc3545';
      default: return '#666';
    }
  };

  return (
    <div style={styles.container}>
      <h2>التسويق</h2>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* التبويبات */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('captains')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'captains' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'captains' ? 'white' : '#333'
          }}
        >
          📢 إرسال لكل الكابتنات
        </button>
        <button
          onClick={() => setActiveTab('csv')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'csv' ? '#28a745' : '#f8f9fa',
            color: activeTab === 'csv' ? 'white' : '#333'
          }}
        >
          📁 استيراد CSV
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'campaigns' ? '#6f42c1' : '#f8f9fa',
            color: activeTab === 'campaigns' ? 'white' : '#333'
          }}
        >
          📊 الحملات ({campaigns.filter(c => c.status === 'running').length} نشطة)
        </button>
      </div>

      {/* إرسال لكل الكابتنات */}
      {activeTab === 'captains' && (
        <div style={styles.tabContent}>
          <h3>إرسال رسالة لجميع الكابتنات</h3>
          <p style={styles.hint}>الرسالة ستُرسل لجميع الكابتنات المسجلين بالنظام مع توزيع على الأرقام المربوطة</p>

          <form onSubmit={handleSendToAll}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>نص الرسالة:</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                required
                style={styles.textarea}
                placeholder="اكتب رسالتك التسويقية هنا..."
                rows={5}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>مدة الإرسال (بالساعات):</label>
              <select
                value={broadcastHours}
                onChange={(e) => setBroadcastHours(parseInt(e.target.value))}
                style={styles.select}
              >
                <option value={1}>ساعة واحدة</option>
                <option value={3}>3 ساعات</option>
                <option value={6}>6 ساعات</option>
                <option value={12}>12 ساعة</option>
                <option value={24}>24 ساعة</option>
              </select>
            </div>

            <button type="submit" disabled={loading || !broadcastMessage} style={styles.sendBtn}>
              {loading ? 'جاري البدء...' : '🚀 إرسال للجميع'}
            </button>
          </form>
        </div>
      )}

      {/* استيراد CSV */}
      {activeTab === 'csv' && (
        <div style={styles.tabContent}>
          <h3>إرسال من ملف CSV</h3>
          <p style={styles.hint}>ارفع ملف CSV يحتوي على أرقام الهواتف (رقم واحد بكل سطر)</p>

          {/* رفع الملف */}
          <div style={styles.uploadSection}>
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              style={styles.uploadBtn}
            >
              📁 اختر ملف CSV
            </button>
            {csvFileName && (
              <span style={styles.fileName}>
                {csvFileName} ({csvNumbers.length} رقم)
              </span>
            )}
          </div>

          {/* فحص الأرقام */}
          {csvNumbers.length > 0 && (
            <div style={styles.checkSection}>
              <button
                onClick={handleCheckNumbers}
                disabled={checking}
                style={styles.checkBtn}
              >
                {checking ? 'جاري الفحص...' : `🔍 فحص ${csvNumbers.length} رقم`}
              </button>

              {checkResult && (
                <div style={styles.checkResult}>
                  <div style={styles.checkStats}>
                    <div style={{ ...styles.checkStat, borderRight: '4px solid #28a745' }}>
                      <h4>بيهم واتساب</h4>
                      <p style={styles.checkNumber}>{checkResult.hasWhatsapp}</p>
                    </div>
                    <div style={{ ...styles.checkStat, borderRight: '4px solid #dc3545' }}>
                      <h4>بدون واتساب</h4>
                      <p style={styles.checkNumber}>{checkResult.noWhatsapp}</p>
                    </div>
                    <div style={{ ...styles.checkStat, borderRight: '4px solid #007bff' }}>
                      <h4>المجموع</h4>
                      <p style={styles.checkNumber}>{checkResult.total}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* نموذج الإرسال */}
              <form onSubmit={handleSendCSV} style={{ marginTop: '20px' }}>
                <div style={styles.inputGroup}>
                  <label style={styles.label}>نص الرسالة:</label>
                  <textarea
                    value={csvMessage}
                    onChange={(e) => setCsvMessage(e.target.value)}
                    required
                    style={styles.textarea}
                    placeholder="اكتب رسالتك التسويقية هنا..."
                    rows={5}
                  />
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>مدة الإرسال (بالساعات):</label>
                  <select
                    value={csvHours}
                    onChange={(e) => setCsvHours(parseInt(e.target.value))}
                    style={styles.select}
                  >
                    <option value={1}>ساعة واحدة</option>
                    <option value={3}>3 ساعات</option>
                    <option value={6}>6 ساعات</option>
                    <option value={12}>12 ساعة</option>
                    <option value={24}>24 ساعة</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !csvMessage}
                  style={styles.sendBtn}
                >
                  {loading ? 'جاري البدء...' : `🚀 إرسال لـ ${checkResult ? checkResult.hasWhatsapp : csvNumbers.length} رقم`}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* الحملات */}
      {activeTab === 'campaigns' && (
        <div style={styles.tabContent}>
          <h3>الحملات التسويقية</h3>

          {campaigns.length === 0 ? (
            <p style={styles.noData}>لا توجد حملات بعد</p>
          ) : (
            campaigns.map((campaign) => (
              <div key={campaign.id} style={styles.campaignCard}>
                <div style={styles.campaignHeader}>
                  <strong>{campaign.name}</strong>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: getStatusColor(campaign.status)
                  }}>
                    {getStatusLabel(campaign.status)}
                  </span>
                </div>

                {/* شريط التقدم */}
                <div style={styles.progressBar}>
                  <div style={{
                    ...styles.progressFill,
                    width: `${campaign.totalNumbers > 0 ? ((campaign.sent + campaign.failed) / campaign.totalNumbers * 100) : 0}%`,
                    backgroundColor: getStatusColor(campaign.status)
                  }} />
                </div>

                <div style={styles.campaignStats}>
                  <span>📱 المجموع: {campaign.totalNumbers}</span>
                  <span>✅ مرسلة: {campaign.sent}</span>
                  <span>❌ فاشلة: {campaign.failed}</span>
                  <span>⏳ متبقية: {campaign.remaining}</span>
                </div>

                <div style={styles.campaignInfo}>
                  <span>⏱️ المدة: {campaign.totalHours} ساعة</span>
                  <span>📅 {new Date(campaign.createdAt).toLocaleDateString('ar-IQ')}</span>
                </div>

                {campaign.status === 'running' && (
                  <button
                    onClick={() => handleStopCampaign(campaign.id)}
                    style={styles.stopBtn}
                  >
                    ⛔ إيقاف الحملة
                  </button>
                )}
              </div>
            ))
          )}
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
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  tab: {
    padding: '10px 20px',
    border: '1px solid #ddd',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
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
  inputGroup: {
    marginBottom: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  },
  textarea: {
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
  sendBtn: {
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    width: '100%'
  },
  uploadSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  uploadBtn: {
    padding: '12px 25px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  fileName: {
    color: '#333',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  checkSection: {
    marginTop: '15px'
  },
  checkBtn: {
    padding: '10px 25px',
    backgroundColor: '#17a2b8',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  checkResult: {
    marginTop: '15px'
  },
  checkStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px'
  },
  checkStat: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  checkNumber: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '5px 0 0 0'
  },
  campaignCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '15px'
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '15px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e9ecef',
    borderRadius: '4px',
    marginBottom: '10px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.5s'
  },
  campaignStats: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    fontSize: '13px',
    color: '#333',
    marginBottom: '5px'
  },
  campaignInfo: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#666'
  },
  stopBtn: {
    marginTop: '10px',
    padding: '8px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px',
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
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: '30px'
  }
};

export default MarketingPage;