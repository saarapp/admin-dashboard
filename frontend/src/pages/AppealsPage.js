// ============================================
// pages/AppealsPage.js - صفحة الطعون
// ============================================

import React, { useState, useEffect } from 'react';
import api from '../services/api';

function AppealsPage() {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchAppeals();
    fetchStats();
  }, [filter]);

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/appeals?status=${filter}`);
      setAppeals(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الطعون:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/appeals/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    }
  };

  // قبول الطعن
  const handleApprove = async (id) => {
    if (!window.confirm('هل أنت متأكد من قبول هذا الطعن واسترداد المبلغ؟')) return;

    setActionLoading(id);
    setMessage('');
    setError('');

    try {
      await api.put(`/appeals/${id}/approve`);
      setMessage('✅ تم قبول الطعن واسترداد المبلغ وإرسال رسالة اعتذار');
      fetchAppeals();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setActionLoading('');
    }
  };

  // رفض الطعن
  const handleReject = async (id) => {
    if (!window.confirm('هل أنت متأكد من رفض هذا الطعن؟')) return;

    setActionLoading(id);
    setMessage('');
    setError('');

    try {
      await api.put(`/appeals/${id}/reject`);
      setMessage('✅ تم رفض الطعن وإرسال رسالة للكابتن');
      fetchAppeals();
      fetchStats();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setActionLoading('');
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'مقبول';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#666';
    }
  };

  return (
    <div style={styles.container}>
      <h2>إدارة الطعون</h2>

      {message && <div style={styles.success}>{message}</div>}
      {error && <div style={styles.error}>{error}</div>}

      {/* إحصائيات */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderRight: '4px solid #ffc107' }}>
            <h4>قيد المراجعة</h4>
            <p style={styles.statNumber}>{stats.pending}</p>
          </div>
          <div style={{ ...styles.statCard, borderRight: '4px solid #28a745' }}>
            <h4>مقبول</h4>
            <p style={styles.statNumber}>{stats.approved}</p>
          </div>
          <div style={{ ...styles.statCard, borderRight: '4px solid #dc3545' }}>
            <h4>مرفوض</h4>
            <p style={styles.statNumber}>{stats.rejected}</p>
          </div>
        </div>
      )}

      {/* فلتر */}
      <div style={styles.filterBar}>
        <button
          onClick={() => setFilter('pending')}
          style={{
            ...styles.filterBtn,
            backgroundColor: filter === 'pending' ? '#ffc107' : '#f8f9fa',
            color: filter === 'pending' ? 'white' : '#333'
          }}
        >
          قيد المراجعة
        </button>
        <button
          onClick={() => setFilter('approved')}
          style={{
            ...styles.filterBtn,
            backgroundColor: filter === 'approved' ? '#28a745' : '#f8f9fa',
            color: filter === 'approved' ? 'white' : '#333'
          }}
        >
          مقبول
        </button>
        <button
          onClick={() => setFilter('rejected')}
          style={{
            ...styles.filterBtn,
            backgroundColor: filter === 'rejected' ? '#dc3545' : '#f8f9fa',
            color: filter === 'rejected' ? 'white' : '#333'
          }}
        >
          مرفوض
        </button>
      </div>

      {/* قائمة الطعون */}
      <div style={styles.appealsCard}>
        {loading ? (
          <p style={styles.noData}>جاري التحميل...</p>
        ) : appeals.length === 0 ? (
          <p style={styles.noData}>لا توجد طعون</p>
        ) : (
          appeals.map((appeal) => (
            <div key={appeal.id} style={styles.appealItem}>
              {/* معلومات الطعن */}
              <div style={styles.appealInfo}>
                <div style={styles.appealHeader}>
                  <strong style={styles.captainName}>
                    {appeal.captains?.name || 'غير معروف'}
                  </strong>
                  <span style={{
                    ...styles.badge,
                    backgroundColor: getStatusColor(appeal.status)
                  }}>
                    {getStatusLabel(appeal.status)}
                  </span>
                </div>

                <div style={styles.appealDetails}>
                  <span>📱 {appeal.captain_phone}</span>
                  <span>📋 {getTypeLabel(appeal.records?.record_type)} - {appeal.records?.amount || 0} دينار</span>
                  <span>📝 السبب: {appeal.records?.reason || '-'}</span>
                  <span>📅 {new Date(appeal.created_at).toLocaleDateString('ar-IQ')} - {new Date(appeal.created_at).toLocaleTimeString('ar-IQ')}</span>
                </div>

                {appeal.appeal_message && (
                  <div style={styles.appealMessage}>
                    رسالة الكابتن: "{appeal.appeal_message}"
                  </div>
                )}
              </div>

              {/* أزرار القرار */}
              {appeal.status === 'pending' && (
                <div style={styles.appealActions}>
                  <button
                    onClick={() => handleApprove(appeal.id)}
                    disabled={actionLoading === appeal.id}
                    style={styles.approveBtn}
                  >
                    {actionLoading === appeal.id ? '...' : '✅ استرداد'}
                  </button>
                  <button
                    onClick={() => handleReject(appeal.id)}
                    disabled={actionLoading === appeal.id}
                    style={styles.rejectBtn}
                  >
                    {actionLoading === appeal.id ? '...' : '❌ رفض'}
                  </button>
                </div>
              )}
            </div>
          ))
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
  filterBar: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  filterBtn: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold'
  },
  appealsCard: {
    marginTop: '20px'
  },
  appealItem: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px'
  },
  appealInfo: {
    flex: 1
  },
  appealHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  captainName: {
    fontSize: '16px',
    color: '#333'
  },
  badge: {
    padding: '4px 12px',
    borderRadius: '15px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  appealDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    fontSize: '13px',
    color: '#666'
  },
  appealMessage: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
    fontSize: '13px',
    color: '#333',
    fontStyle: 'italic'
  },
  appealActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  approveBtn: {
    padding: '10px 20px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  rejectBtn: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
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

export default AppealsPage;