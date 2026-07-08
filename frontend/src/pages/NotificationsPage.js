import React, { useState, useEffect } from 'react';
import api from '../services/api';
import s from '../sharedStyles';

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState(null);

  useEffect(function() {
    fetchNotifications();
    fetchStats();
  }, []);

  function fetchNotifications() {
    api.get('/notifications').then(function(res) {
      setNotifications(res.data.data);
    }).catch(function() {}).finally(function() { setLoading(false); });
  }

  function fetchStats() {
    api.get('/notifications/stats').then(function(res) {
      setStats(res.data.data);
    }).catch(function() {});
  }

  function getStatusLabel(status) {
    if (status === 'pending') return 'قيد الإرسال';
    if (status === 'sent') return 'تم الإرسال';
    if (status === 'delivered') return 'تم التسليم';
    if (status === 'failed') return 'فشل';
    return status;
  }

  function getStatusGradient(status) {
    if (status === 'pending') return 'linear-gradient(135deg, #ffc400, #ffab00)';
    if (status === 'sent') return 'linear-gradient(135deg, #00b0ff, #448aff)';
    if (status === 'delivered') return 'linear-gradient(135deg, #00c853, #00e676)';
    if (status === 'failed') return 'linear-gradient(135deg, #ff1744, #ff5252)';
    return '#666';
  }

  function getTypeLabel(type) {
    if (type === 'warning') return 'إنذار';
    if (type === 'deduction') return 'خصم';
    if (type === 'compensation') return 'تعويض';
    return type;
  }

  var filteredNotifications = filter === 'all'
    ? notifications
    : notifications.filter(function(n) { return n.status === filter; });

  return (
    <div style={s.pageContainer}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>🔔 الإشعارات</h2>
      </div>

      {/* الإحصائيات */}
      {stats && (
        <div style={s.statsGrid}>
          <div style={{...s.statCard, borderTop: '4px solid #ffc400'}}>
            <div style={s.statIcon}>⏳</div>
            <p style={s.statLabel}>قيد الإرسال</p>
            <p style={s.statNumber}>{stats.pending || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #00b0ff'}}>
            <div style={s.statIcon}>📤</div>
            <p style={s.statLabel}>تم الإرسال</p>
            <p style={s.statNumber}>{stats.sent || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #00c853'}}>
            <div style={s.statIcon}>✅</div>
            <p style={s.statLabel}>تم التسليم</p>
            <p style={s.statNumber}>{stats.delivered || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #ff1744'}}>
            <div style={s.statIcon}>❌</div>
            <p style={s.statLabel}>فشل</p>
            <p style={s.statNumber}>{stats.failed || 0}</p>
          </div>
        </div>
      )}

      {/* الفلتر */}
      <div style={s.filterBar}>
        {[
          {key: 'all', label: 'الكل'},
          {key: 'pending', label: 'قيد الإرسال'},
          {key: 'sent', label: 'تم الإرسال'},
          {key: 'delivered', label: 'تم التسليم'},
          {key: 'failed', label: 'فشل'}
        ].map(function(f) {
          return (
            <button key={f.key} onClick={function() { setFilter(f.key); }}
              style={{...s.filterBtn, ...(filter === f.key ? s.filterBtnActive : {})}}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* الجدول */}
      <div style={s.card}>
        {loading ? (
          <p style={s.noData}>جاري التحميل...</p>
        ) : filteredNotifications.length === 0 ? (
          <div style={s.noData}>
            <span style={{fontSize: '40px', display: 'block', marginBottom: '10px'}}>📭</span>
            لا توجد إشعارات
          </div>
        ) : (
          <div style={{overflowX: 'auto'}}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>رقم الكابتن</th>
                  <th style={s.th}>نوع الرسالة</th>
                  <th style={s.th}>محتوى الرسالة</th>
                  <th style={s.th}>الرقم المرسل منه</th>
                  <th style={s.th}>الحالة</th>
                  <th style={s.th}>التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map(function(notification) {
                  return (
                    <tr key={notification.id}>
                      <td style={s.td}>
                        <span style={{fontWeight: '600', color: '#1a1a2e'}}>{notification.captain_phone}</span>
                      </td>
                      <td style={s.td}>{getTypeLabel(notification.message_type)}</td>
                      <td style={s.td}>
                        <div style={styles.messageContent}>
                          {notification.message_content}
                        </div>
                      </td>
                      <td style={s.td}>{notification.whatsapp_number_used || '-'}</td>
                      <td style={s.td}>
                        <span style={{...s.badge, background: getStatusGradient(notification.status)}}>
                          {getStatusLabel(notification.status)}
                        </span>
                      </td>
                      <td style={s.td}>
                        <span style={{color: '#999', fontSize: '12px'}}>
                          {new Date(notification.created_at).toLocaleDateString('ar-IQ')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

var styles = {
  messageContent: {
    maxWidth: '200px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    color: '#666'
  }
};

export default NotificationsPage;