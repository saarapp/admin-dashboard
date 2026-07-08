import React, { useState, useEffect } from 'react';
import api from '../services/api';
import s from '../sharedStyles';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [ticketStats, setTicketStats] = useState(null);
  const [appealStats, setAppealStats] = useState(null);
  const [notifStats, setNotifStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [deleteFrom, setDeleteFrom] = useState('');
  const [deleteTo, setDeleteTo] = useState('');
  const [deleteType, setDeleteType] = useState('records');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(function() { fetchAllStats(); }, []);

  function fetchAllStats() {
    setLoading(true);
    Promise.all([
      api.get('/records/stats/global'),
      api.get('/tickets/stats'),
      api.get('/appeals/stats'),
      api.get('/notifications/stats')
    ]).then(function(results) {
      setStats(results[0].data.data);
      setTicketStats(results[1].data.data);
      setAppealStats(results[2].data.data);
      setNotifStats(results[3].data.data);
    }).catch(function() {}).finally(function() { setLoading(false); });
  }

  function handleDeleteData() {
    if (!deleteFrom || !deleteTo) { setError('حدد التاريخ من وإلى'); return; }
    if (!window.confirm('هل أنت متأكد من حذف البيانات؟ لا يمكن التراجع!')) return;
    if (!window.confirm('تأكيد نهائي: هل أنت متأكد؟')) return;

    setDeleteLoading(true);
    setMessage('');
    setError('');

    api.post('/records/delete-range', { from: deleteFrom, to: deleteTo, type: deleteType })
      .then(function() {
        setMessage('✅ تم حذف البيانات بنجاح');
        setDeleteFrom('');
        setDeleteTo('');
        fetchAllStats();
      })
      .catch(function(err) { setError(err.response?.data?.message || 'حدث خطأ'); })
      .finally(function() { setDeleteLoading(false); });
  }

  if (loading) return <div style={s.noData}>جاري التحميل...</div>;

  return (
    <div style={s.pageContainer}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>📊 الرئيسية</h2>
      </div>

      {message && <div style={s.success}>{message}</div>}
      {error && <div style={s.error}>{error}</div>}

      {/* السجلات */}
      <div style={s.sectionTitle}>📋 السجلات</div>
      <div style={s.statsGrid}>
        <div style={{...s.statCard, borderTop: '4px solid #ffc400'}}>
          <div style={s.statIcon}>⚠️</div>
          <p style={s.statLabel}>الإنذارات</p>
          <p style={s.statNumber}>{stats?.totalWarnings || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #ff1744'}}>
          <div style={s.statIcon}>➖</div>
          <p style={s.statLabel}>الخصومات</p>
          <p style={s.statNumber}>{stats?.totalDeductions || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #00c853'}}>
          <div style={s.statIcon}>➕</div>
          <p style={s.statLabel}>التعويضات</p>
          <p style={s.statNumber}>{stats?.totalCompensations || 0}</p>
        </div>
      </div>

      {/* الرسائل */}
      <div style={s.sectionTitle}>📨 الرسائل</div>
      <div style={s.statsGrid}>
        <div style={{...s.statCard, borderTop: '4px solid #00c853'}}>
          <div style={s.statIcon}>✅</div>
          <p style={s.statLabel}>مرسلة</p>
          <p style={s.statNumber}>{notifStats?.sent || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #ff1744'}}>
          <div style={s.statIcon}>❌</div>
          <p style={s.statLabel}>فاشلة</p>
          <p style={s.statNumber}>{notifStats?.failed || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #ffc400'}}>
          <div style={s.statIcon}>⏳</div>
          <p style={s.statLabel}>معلقة</p>
          <p style={s.statNumber}>{notifStats?.pending || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #00b0ff'}}>
          <div style={s.statIcon}>📬</div>
          <p style={s.statLabel}>تم التسليم</p>
          <p style={s.statNumber}>{notifStats?.delivered || 0}</p>
        </div>
      </div>

      {/* التكتات */}
      <div style={s.sectionTitle}>🎫 التكتات</div>
      <div style={s.statsGrid}>
        <div style={{...s.statCard, borderTop: '4px solid #ffc400'}}>
          <div style={s.statIcon}>⏳</div>
          <p style={s.statLabel}>قيد الانتظار</p>
          <p style={s.statNumber}>{ticketStats?.pending || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #00b0ff'}}>
          <div style={s.statIcon}>📋</div>
          <p style={s.statLabel}>قيد المراجعة</p>
          <p style={s.statNumber}>{ticketStats?.under_review || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #764ba2'}}>
          <div style={s.statIcon}>👤</div>
          <p style={s.statLabel}>مراجعة الوكيل</p>
          <p style={s.statNumber}>{ticketStats?.deputy_review || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #00c853'}}>
          <div style={s.statIcon}>✅</div>
          <p style={s.statLabel}>مقبول</p>
          <p style={s.statNumber}>{ticketStats?.approved || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #ff1744'}}>
          <div style={s.statIcon}>❌</div>
          <p style={s.statLabel}>مرفوض</p>
          <p style={s.statNumber}>{ticketStats?.rejected || 0}</p>
        </div>
      </div>

      {/* الطعون */}
      <div style={s.sectionTitle}>⚖️ الطعون</div>
      <div style={s.statsGrid}>
        <div style={{...s.statCard, borderTop: '4px solid #ffc400'}}>
          <div style={s.statIcon}>⏳</div>
          <p style={s.statLabel}>قيد المراجعة</p>
          <p style={s.statNumber}>{appealStats?.pending || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #00c853'}}>
          <div style={s.statIcon}>✅</div>
          <p style={s.statLabel}>مقبول</p>
          <p style={s.statNumber}>{appealStats?.approved || 0}</p>
        </div>
        <div style={{...s.statCard, borderTop: '4px solid #ff1744'}}>
          <div style={s.statIcon}>❌</div>
          <p style={s.statLabel}>مرفوض</p>
          <p style={s.statNumber}>{appealStats?.rejected || 0}</p>
        </div>
      </div>

      {/* تنظيف قاعدة البيانات */}
      <div style={s.sectionTitle}>🗑️ تنظيف قاعدة البيانات</div>
      <div style={s.card}>
        <div style={{...s.hint, borderRightColor: '#ff1744', backgroundColor: '#fff5f5'}}>
          ⚠️ تحذير: حذف البيانات لا يمكن التراجع عنه!
        </div>

        <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px'}}>
          <div style={{...s.inputGroup, flex: 1, minWidth: '180px'}}>
            <label style={s.label}>من تاريخ:</label>
            <input type="date" value={deleteFrom} onChange={function(e) { setDeleteFrom(e.target.value); }} style={s.input} />
          </div>
          <div style={{...s.inputGroup, flex: 1, minWidth: '180px'}}>
            <label style={s.label}>إلى تاريخ:</label>
            <input type="date" value={deleteTo} onChange={function(e) { setDeleteTo(e.target.value); }} style={s.input} />
          </div>
          <div style={{...s.inputGroup, flex: 1, minWidth: '180px'}}>
            <label style={s.label}>نوع البيانات:</label>
            <select value={deleteType} onChange={function(e) { setDeleteType(e.target.value); }} style={s.select}>
              <option value="records">السجلات فقط</option>
              <option value="notifications">الإشعارات فقط</option>
              <option value="all">الكل</option>
            </select>
          </div>
        </div>

        <button onClick={handleDeleteData} disabled={deleteLoading || !deleteFrom || !deleteTo} style={s.btnDanger}>
          {deleteLoading ? 'جاري الحذف...' : '🗑️ حذف البيانات'}
        </button>
      </div>
    </div>
  );
}

export default DashboardPage;