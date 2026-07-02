// ============================================
// pages/SearchPage.js - صفحة البحث في السجلات
// ============================================

import React, { useState } from 'react';
import api from '../services/api';

function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [captainData, setCaptainData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // البحث عن الكابتن
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setCaptainData(null);

    try {
      const response = await api.get(`/captains/search?name=${searchQuery}`);
      setSearchResults(response.data.data);

      if (response.data.data.length === 0) {
        setError('لم يتم العثور على كابتن بهذا الاسم');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في البحث');
    } finally {
      setLoading(false);
    }
  };

  // جلب سجل الكابتن الكامل
  const fetchCaptainRecord = async (captainId) => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/captains/${captainId}/record`);
      setCaptainData(response.data.data);
      setSearchResults([]);
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ في جلب السجل');
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
      <h2>البحث في السجلات</h2>

      {/* نموذج البحث */}
      <div style={styles.searchCard}>
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم الكابتن أو رقم الهاتف..."
            required
            style={styles.searchInput}
          />
          <button type="submit" disabled={loading} style={styles.searchBtn}>
            {loading ? 'جاري البحث...' : '🔍 بحث'}
          </button>
        </form>
      </div>

      {/* رسالة خطأ */}
      {error && <div style={styles.error}>{error}</div>}

      {/* نتائج البحث - قائمة الكابتنات */}
      {searchResults.length > 0 && (
        <div style={styles.resultsCard}>
          <h3>نتائج البحث:</h3>
          {searchResults.map((captain) => (
            <div
              key={captain.id}
              style={styles.captainItem}
              onClick={() => fetchCaptainRecord(captain.id)}
            >
              <div>
                <strong>{captain.name}</strong>
                <p style={styles.captainPhone}>{captain.phone_number}</p>
              </div>
              <span style={styles.viewBtn}>عرض السجل ←</span>
            </div>
          ))}
        </div>
      )}

      {/* سجل الكابتن الكامل */}
      {captainData && (
        <div>
          {/* معلومات الكابتن */}
          <div style={styles.captainCard}>
            <h3>معلومات الكابتن</h3>
            <div style={styles.captainInfo}>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>الاسم:</span>
                <span>{captainData.captain.name}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>رقم الهاتف:</span>
                <span>{captainData.captain.phone_number}</span>
              </div>
              <div style={styles.infoItem}>
                <span style={styles.infoLabel}>الحالة:</span>
                <span style={{
                  color: captainData.captain.status === 'active' ? '#28a745' : '#dc3545'
                }}>
                  {captainData.captain.status === 'active' ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </div>

          {/* ملخص الإحصائيات */}
          <div style={styles.statsGrid}>
            <div style={{ ...styles.statCard, borderTop: '4px solid #ffc107' }}>
              <h4>الإنذارات</h4>
              <p style={styles.statNumber}>{captainData.stats.warnings}</p>
            </div>
            <div style={{ ...styles.statCard, borderTop: '4px solid #dc3545' }}>
              <h4>إجمالي الخصومات</h4>
              <p style={styles.statNumber}>{captainData.stats.totalDeductions}</p>
            </div>
            <div style={{ ...styles.statCard, borderTop: '4px solid #28a745' }}>
              <h4>إجمالي التعويضات</h4>
              <p style={styles.statNumber}>{captainData.stats.totalCompensations}</p>
            </div>
            <div style={{
              ...styles.statCard,
              borderTop: `4px solid ${captainData.balance >= 0 ? '#28a745' : '#dc3545'}`
            }}>
              <h4>الرصيد</h4>
              <p style={{
                ...styles.statNumber,
                color: captainData.balance >= 0 ? '#28a745' : '#dc3545'
              }}>
                {captainData.balance}
              </p>
            </div>
          </div>

          {/* جدول السجلات */}
          <div style={styles.recordsCard}>
            <h3>السجل الكامل</h3>
            {captainData.records.length === 0 ? (
              <p style={styles.noData}>لا توجد سجلات</p>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>#</th>
                    <th style={styles.th}>النوع</th>
                    <th style={styles.th}>المبلغ</th>
                    <th style={styles.th}>السبب</th>
                    <th style={styles.th}>ملاحظات</th>
                    <th style={styles.th}>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {captainData.records.map((record, index) => (
                    <tr key={record.id}>
                      <td style={styles.td}>{index + 1}</td>
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
                      <td style={styles.td}>{record.notes || '-'}</td>
                      <td style={styles.td}>
                        {new Date(record.created_at).toLocaleDateString('ar-IQ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* زر الرجوع */}
          <button
            onClick={() => {
              setCaptainData(null);
              setSearchResults([]);
              setSearchQuery('');
            }}
            style={styles.backBtn}
          >
            ← بحث جديد
          </button>
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
  searchCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginTop: '20px'
  },
  searchForm: {
    display: 'flex',
    gap: '10px'
  },
  searchInput: {
    flex: 1,
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  searchBtn: {
    padding: '12px 25px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '10px',
    borderRadius: '5px',
    marginTop: '15px',
    textAlign: 'center'
  },
  resultsCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginTop: '15px'
  },
  captainItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  captainPhone: {
    color: '#666',
    margin: '5px 0 0 0',
    fontSize: '13px'
  },
  viewBtn: {
    color: '#007bff',
    fontWeight: 'bold',
    fontSize: '14px'
  },
  captainCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginTop: '15px'
  },
  captainInfo: {
    display: 'flex',
    gap: '30px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  infoItem: {
    display: 'flex',
    gap: '8px'
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#666'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '15px',
    marginTop: '15px'
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
  recordsCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginTop: '15px',
    overflowX: 'auto'
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
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: '30px'
  },
  backBtn: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#6c757d',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  }
};

export default SearchPage;