// ============================================
// pages/NotificationsPage.js - صفحة الإشعارات
// ============================================

import React, { useState, useEffect } from 'react';
import api from '../services/api';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  // جلب الإشعارات
  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      setNotifications(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الإشعارات:', error);
    } finally {
      setLoading(false);
    }
  };

  // جلب الإحصائيات
  const fetchStats = async () => {
    try {
      const response = await api.get('/notifications/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    }
  };

  // ترجمة الحالة
  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'قيد الإرسال';
      case 'sent': return 'تم الإرسال';
      case 'delivered': return 'تم التسليم';
      case 'failed': return 'فشل';
      default: return status;
    }
  };

  // لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'sent': return '#17a2b8';
      case 'delivered': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#666';
    }
  };

  // ترجمة نوع الرسالة
  const getTypeLabel = (type) => {
    switch (type) {
      case 'warning': return 'إنذار';
      case 'deduction': return 'خصم';
      case 'compensation': return 'تعويض';
      default: return type;
    }
  };

  // فلترة الإشعارات
  const filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(n => n.status === filter);

  return (
    <div style={styles.container}>
      <h2>الإشعارات</h2>

      {/* إحصائيات الإشعارات */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={{ ...styles.statCard, borderRight: '4px solid #ffc107' }}>
            <h4>قيد الإرسال</h4>
            <p style={styles.statNumber}>{stats.pending}</p>
          </div>
          <div style={{ ...styles.statCard, borderRight: '4px solid #17a2b8' }}>
            <h4>تم الإرسال</h4>
            <p style={styles.statNumber}>{stats.sent}</p>
          </div>
          <div style={{ ...styles.statCard, borderRight: '4px solid #28a745' }}>
            <h4>تم التسليم</h4>
            <p style={styles.statNumber}>{stats.delivered}</p>
          </div>
          <div style={{ ...styles.statCard, borderRight: '4px solid #dc3545' }}>
            <h4>فشل</h4>
            <p style={styles.statNumber}>{stats.failed}</p>
          </div>
        </div>
      )}

      {/* فلتر الحالة */}
      <div style={styles.filterBar}>
        <button
          onClick={() => setFilter('all')}
          style={{
            ...styles.filterBtn,
            backgroundColor: filter === 'all' ? '#007bff' : '#f8f9fa',
            color: filter === 'all' ? 'white' : '#333'
          }}
        >
          الكل
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            ...styles.filterBtn,
            backgroundColor: filter === 'pending' ? '#ffc107' : '#f8f9fa',
            color: filter === 'pending' ? 'white' : '#333'
          }}
        >
          قيد الإرسال
        </button>
        <button
          onClick={() => setFilter('sent')}
          style={{
            ...styles.filterBtn,
            backgroundColor: filter === 'sent' ? '#17a2b8' : '#f8f9fa',
            color: filter === 'sent' ? 'white' : '#333'
          }}
        >
          تم الإرسال
        </button>
        <button
          onClick={() => setFilter('delivered')}
          style={{
            ...styles.filterBtn,
            backgroundColor: filter === 'delivered' ? '#28a745' : '#f8f9fa',
            color: filter === 'delivered' ? 'white' : '#333'
          }}
        >
          تم التسليم
        </button>
        <button
          onClick={() => setFilter('failed')}
          style={{
            ...styles.filterBtn,
            backgroundColor: filter === 'failed' ? '#dc3545' : '#f8f9fa',
            color: filter === 'failed' ? 'white' : '#333'
          }}
        >
          فشل
        </button>
      </div>

      {/* جدول الإشعارات */}
      <div style={styles.tableCard}>
        {loading ? (
          <p>جاري التحميل...</p>
        ) : filteredNotifications.length === 0 ? (
          <p style={styles.noData}>لا توجد إشعارات</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>رقم الكابتن</th>
                <th style={styles.th}>نوع الرسالة</th>
                <th style={styles.th}>محتوى الرسالة</th>
                <th style={styles.th}>الرقم المرسل منه</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((notification) => (
                <tr key={notification.id}>
                  <td style={styles.td}>{notification.captain_phone}</td>
                  <td style={styles.td}>{getTypeLabel(notification.message_type)}</td>
                  <td style={styles.td}>
                    <div style={styles.messageContent}>
                      {notification.message_content}
                    </div>
                  </td>
                  <td style={styles.td}>{notification.whatsapp_number_used || '-'}</td>
                  <td style={styles.td}>
                    <span style={{
                      ...styles.badge,
                      backgroundColor: getStatusColor(notification.status)
                    }}>
                      {getStatusLabel(notification.status)}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {new Date(notification.created_at).toLocaleDateString('ar-IQ')}
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
    marginTop: '20px',
    flexWrap: 'wrap'
  },
  filterBtn: {
    padding: '8px 16px',
    border: '1px solid #ddd',
    borderRadius: '20px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },
  tableCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    marginTop: '20px',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  th: {
    backgroundColor: '#f8f9fa',
    padding: '12px',
    textAlign: 'right',
    borderBottom: '2px solid #ddd',
    color: '#333',
    whiteSpace: 'nowrap'
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
  messageContent: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: '30px'
  }
};

export default NotificationsPage;