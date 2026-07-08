import React, { useState, useEffect } from 'react';
import api from '../services/api';
import s from '../sharedStyles';

function BannedPage() {
  const [bans, setBans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(function() {
    fetchBans();
    fetchStats();
    // تحديث تلقائي كل دقيقة
    var interval = setInterval(function() { fetchBans(); fetchStats(); }, 60000);
    return function() { clearInterval(interval); };
  }, [filter]);

  function fetchBans() {
    setLoading(true);
    var url = '/bans';
    if (filter) url += '?status=' + filter;
    api.get(url).then(function(res) {
      setBans(res.data.data);
    }).catch(function() {}).finally(function() { setLoading(false); });
  }

  function fetchStats() {
    api.get('/bans/stats').then(function(res) {
      setStats(res.data.data);
    }).catch(function() {});
  }

  function handleLiftBan(id, captainName) {
    if (!window.confirm('هل أنت متأكد من فك حظر ' + captainName + '؟')) return;

    setActionLoading(id);
    setMessage('');
    setError('');

    api.put('/bans/' + id + '/lift').then(function() {
      setMessage('✅ تم فك الحظر وإرسال رسالة للكابتن');
      fetchBans();
      fetchStats();
    }).catch(function(err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    }).finally(function() { setActionLoading(''); });
  }

  function formatRemaining(ban) {
    if (ban.status === 'lifted') return 'تم الفك';
    if (ban.status === 'expired' || ban.is_expired) return 'منتهي';

    var days = ban.remaining_days || 0;
    var hours = ban.remaining_hours || 0;

    if (days > 1) return days + ' يوم';
    if (days === 1) return 'يوم واحد';
    if (hours > 0) return hours + ' ساعة';
    return 'منتهي';
  }

  function getStatusLabel(status, isExpired) {
    if (isExpired) return 'منتهي';
    if (status === 'active') return 'محظور';
    if (status === 'lifted') return 'تم الفك';
    if (status === 'expired') return 'منتهي';
    return status;
  }

  function getStatusGradient(status, isExpired) {
    if (isExpired || status === 'expired') return 'linear-gradient(135deg, #6c757d, #495057)';
    if (status === 'active') return 'linear-gradient(135deg, #ff1744, #d50000)';
    if (status === 'lifted') return 'linear-gradient(135deg, #00c853, #00e676)';
    return '#666';
  }

  function getProgressPercent(ban) {
    var start = new Date(ban.ban_start).getTime();
    var end = new Date(ban.ban_end).getTime();
    var now = Date.now();
    var total = end - start;
    var passed = now - start;
    var percent = Math.min(100, Math.max(0, (passed / total) * 100));
    return percent;
  }

  function getProgressColor(percent) {
    if (percent >= 90) return '#00c853';
    if (percent >= 60) return '#ffc400';
    return '#ff1744';
  }

  return (
    <div style={s.pageContainer}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>🚫 المحظورون</h2>
      </div>

      {message && <div style={s.success}>{message}</div>}
      {error && <div style={s.error}>{error}</div>}

      {/* الإحصائيات */}
      {stats && (
        <div style={s.statsGrid}>
          <div style={{...s.statCard, borderTop: '4px solid #ff1744'}}>
            <div style={s.statIcon}>🚫</div>
            <p style={s.statLabel}>محظور حالياً</p>
            <p style={s.statNumber}>{stats.active || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #00c853'}}>
            <div style={s.statIcon}>✅</div>
            <p style={s.statLabel}>تم فك الحظر</p>
            <p style={s.statNumber}>{stats.lifted || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #6c757d'}}>
            <div style={s.statIcon}>⏰</div>
            <p style={s.statLabel}>منتهي تلقائياً</p>
            <p style={s.statNumber}>{stats.expired || 0}</p>
          </div>
        </div>
      )}

      {/* الفلتر */}
      <div style={s.filterBar}>
        {[
          {key: 'active', label: '🚫 محظور'},
          {key: 'lifted', label: '✅ تم الفك'},
          {key: 'expired', label: '⏰ منتهي'},
          {key: '', label: 'الكل'}
        ].map(function(f) {
          return (
            <button key={f.key} onClick={function() { setFilter(f.key); }}
              style={{...s.filterBtn, ...(filter === f.key ? s.filterBtnActive : {})}}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* القائمة */}
      {loading ? (
        <p style={s.noData}>جاري التحميل...</p>
      ) : bans.length === 0 ? (
        <div style={s.noData}>
          <span style={{fontSize: '50px', display: 'block', marginBottom: '10px'}}>🚫</span>
          لا يوجد محظورون
        </div>
      ) : (
        bans.map(function(ban) {
          var progress = getProgressPercent(ban);
          var isExpired = ban.is_expired || ban.status === 'expired';

          return (
            <div key={ban.id} style={styles.banCard}>
              {/* الرأس */}
              <div style={styles.banHeader}>
                <div style={styles.banHeaderLeft}>
                  <div style={styles.banAvatar}>
                    {ban.captain_name.charAt(0)}
                  </div>
                  <div>
                    <h4 style={styles.banName}>{ban.captain_name}</h4>
                    <div style={styles.banMeta}>
                      <span>📱 {ban.captain_phone}</span>
                      <span>📅 {ban.duration_days} يوم</span>
                    </div>
                  </div>
                </div>
                <span style={{...s.badge, background: getStatusGradient(ban.status, isExpired)}}>
                  {getStatusLabel(ban.status, isExpired)}
                </span>
              </div>

              {/* السبب */}
              {ban.reason && (
                <div style={styles.banReason}>
                  <span style={{fontWeight: '700', color: '#1a1a2e'}}>📝 السبب: </span>
                  {ban.reason}
                </div>
              )}

              {/* شريط التقدم */}
              {ban.status === 'active' && !isExpired && (
                <div style={styles.progressSection}>
                  <div style={styles.progressBar}>
                    <div style={{
                      ...styles.progressFill,
                      width: progress + '%',
                      backgroundColor: getProgressColor(progress)
                    }} />
                  </div>
                  <div style={styles.progressInfo}>
                    <span style={styles.progressText}>
                      ⏳ المتبقي: <strong>{formatRemaining(ban)}</strong>
                    </span>
                    <span style={styles.progressPercent}>
                      {Math.round(progress)}% مضى
                    </span>
                  </div>
                </div>
              )}

              {/* التواريخ */}
              <div style={styles.banDates}>
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>بداية الحظر</span>
                  <span style={styles.dateValue}>{new Date(ban.ban_start).toLocaleDateString('ar-IQ')}</span>
                </div>
                <div style={styles.dateItem}>
                  <span style={styles.dateLabel}>نهاية الحظر</span>
                  <span style={styles.dateValue}>{new Date(ban.ban_end).toLocaleDateString('ar-IQ')}</span>
                </div>
                {ban.appeal_deadline && (
                  <div style={styles.dateItem}>
                    <span style={styles.dateLabel}>مهلة الطعن</span>
                    <span style={styles.dateValue}>{new Date(ban.appeal_deadline).toLocaleDateString('ar-IQ')}</span>
                  </div>
                )}
                {ban.created_by_user && (
                  <div style={styles.dateItem}>
                    <span style={styles.dateLabel}>بواسطة</span>
                    <span style={styles.dateValue}>{ban.created_by_user.full_name}</span>
                  </div>
                )}
              </div>

              {/* زر فك الحظر */}
              {(ban.status === 'active' || isExpired) && ban.status !== 'lifted' && (
                <div style={styles.banFooter}>
                  <button
                    onClick={function() { handleLiftBan(ban.id, ban.captain_name); }}
                    disabled={actionLoading === ban.id}
                    style={isExpired ? styles.liftBtnExpired : styles.liftBtn}>
                    {actionLoading === ban.id ? 'جاري فك الحظر...' : isExpired ? '⏰ منتهي - فك الحظر' : '🔓 فك الحظر'}
                  </button>
                </div>
              )}

              {/* تم الفك */}
              {ban.status === 'lifted' && (
                <div style={styles.liftedInfo}>
                  <span>✅ تم فك الحظر بتاريخ {new Date(ban.lifted_at).toLocaleDateString('ar-IQ')}</span>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

var styles = {
  banCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
    marginBottom: '16px',
    overflow: 'hidden'
  },
  banHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px'
  },
  banHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },
  banAvatar: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ff1744, #d50000)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontWeight: '700',
    fontSize: '20px',
    flexShrink: 0
  },
  banName: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  banMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '12px',
    color: '#999'
  },
  banReason: {
    margin: '0 24px',
    padding: '12px 16px',
    backgroundColor: '#fff5f5',
    borderRadius: '10px',
    fontSize: '13px',
    color: '#555',
    borderRight: '4px solid #ff1744'
  },
  progressSection: {
    padding: '15px 24px'
  },
  progressBar: {
    width: '100%',
    height: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '5px',
    transition: 'width 0.5s'
  },
  progressInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px'
  },
  progressText: {
    fontSize: '13px',
    color: '#555'
  },
  progressPercent: {
    fontSize: '12px',
    color: '#999'
  },
  banDates: {
    display: 'flex',
    gap: '15px',
    padding: '0 24px 15px 24px',
    flexWrap: 'wrap'
  },
  dateItem: {
    flex: 1,
    minWidth: '120px',
    padding: '10px 14px',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    textAlign: 'center'
  },
  dateLabel: {
    display: 'block',
    fontSize: '11px',
    color: '#999',
    marginBottom: '3px'
  },
  dateValue: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '700',
    color: '#1a1a2e'
  },
  banFooter: {
    padding: '15px 24px',
    borderTop: '1px solid #f5f5f5'
  },
  liftBtn: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #00c853, #00e676)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,200,83,0.3)'
  },
  liftBtnExpired: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #ffc400, #ffab00)',
    color: '#333',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer'
  },
  liftedInfo: {
    padding: '12px 24px',
    backgroundColor: '#e8f5e9',
    fontSize: '13px',
    color: '#2e7d32',
    textAlign: 'center',
    fontWeight: '600'
  }
};

export default BannedPage;