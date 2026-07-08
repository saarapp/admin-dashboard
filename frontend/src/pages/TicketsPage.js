import React, { useState, useEffect } from 'react';
import api from '../services/api';
import s from '../sharedStyles';

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [actionLoading, setActionLoading] = useState('');
  const [users, setUsers] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [deputyId, setDeputyId] = useState('');
  const [deputyResponse, setDeputyResponse] = useState('');

  var user = JSON.parse(localStorage.getItem('user'));
  var isAdmin = user?.role === 'admin';

  const [newTicket, setNewTicket] = useState({
    captain_name: '', captain_phone: '', case_type: '', description: '', priority: 'normal'
  });

  useEffect(function() {
    fetchTickets();
    fetchStats();
    fetchUsers();
  }, [filter]);

  function fetchTickets() {
    setLoading(true);
    var url = isAdmin ? '/tickets' : '/tickets/my';
    if (filter) url += '?status=' + filter;

    api.get(url).then(function(res) {
      var myTickets = res.data.data;

      // إذا موظف عادي، جلب التكتات المحولة إليه كوكيل
      if (!isAdmin) {
        api.get('/tickets/deputy/my').then(function(deputyRes) {
          var deputyTickets = deputyRes.data.data;
          // دمج التكتات بدون تكرار
          var allIds = myTickets.map(function(t) { return t.id; });
          deputyTickets.forEach(function(t) {
            if (!allIds.includes(t.id)) {
              myTickets.push(t);
            }
          });
          setTickets(myTickets);
        }).catch(function() {
          setTickets(myTickets);
        });
      } else {
        setTickets(myTickets);
      }
    }).catch(function() {}).finally(function() { setLoading(false); });
  }

  function fetchStats() {
    api.get('/tickets/stats').then(function(res) {
      setStats(res.data.data);
    }).catch(function() {});
  }

  function fetchUsers() {
    api.get('/messages/users').then(function(res) {
      setUsers(res.data.data);
    }).catch(function() {});
  }

  function handleCreateTicket(e) {
    e.preventDefault();
    setActionLoading('create');
    setMessage(''); setError('');
    api.post('/tickets', newTicket).then(function() {
      setMessage('✅ تم إنشاء التكت بنجاح');
      setNewTicket({ captain_name: '', captain_phone: '', case_type: '', description: '', priority: 'normal' });
      setShowForm(false);
      fetchTickets(); fetchStats();
    }).catch(function(err) {
      setError(err.response?.data?.message || 'حدث خطأ');
    }).finally(function() { setActionLoading(''); });
  }

  function handleReview(id) {
    api.put('/tickets/' + id + '/review').then(function() {
      setMessage('✅ تم بدء المراجعة');
      fetchTickets(); fetchStats();
    }).catch(function() { setError('خطأ في المراجعة'); });
  }

  function handleSendToDeputy(id) {
    if (!deputyId) { setError('اختر الوكيل'); return; }
    api.put('/tickets/' + id + '/deputy', { deputy_id: deputyId }).then(function() {
      setMessage('✅ تم التحويل للوكيل');
      setDeputyId(''); setShowDetail(null);
      fetchTickets(); fetchStats();
    }).catch(function() { setError('خطأ في التحويل'); });
  }

  function handleDeputyResponse(id) {
    if (!deputyResponse) { setError('اكتب الرد'); return; }
    api.put('/tickets/' + id + '/deputy-response', { deputy_response: deputyResponse }).then(function() {
      setMessage('✅ تم إرسال رد الوكيل');
      setDeputyResponse(''); setShowDetail(null);
      fetchTickets();
    }).catch(function() { setError('خطأ في الرد'); });
  }

  function handleApprove(id) {
    if (!responseText) { setError('اكتب السبب'); return; }
    api.put('/tickets/' + id + '/approve', { admin_response: responseText }).then(function() {
      setMessage('✅ تم القبول وإرسال رسالة للكابتن');
      setResponseText(''); setShowDetail(null);
      fetchTickets(); fetchStats();
    }).catch(function() { setError('خطأ في القبول'); });
  }

  function handleReject(id) {
    if (!responseText) { setError('اكتب السبب'); return; }
    api.put('/tickets/' + id + '/reject', { admin_response: responseText }).then(function() {
      setMessage('✅ تم الرفض وإرسال رسالة للكابتن');
      setResponseText(''); setShowDetail(null);
      fetchTickets(); fetchStats();
    }).catch(function() { setError('خطأ في الرفض'); });
  }

  function getCaseLabel(type) {
    if (type === 'fine_review') return 'مراجعة غرامة';
    if (type === 'ban_review') return 'مراجعة حظر';
    if (type === 'compensation_request') return 'طلب تعويض';
    if (type === 'other') return 'أخرى';
    return type;
  }

  function getCaseIcon(type) {
    if (type === 'fine_review') return '💰';
    if (type === 'ban_review') return '🚫';
    if (type === 'compensation_request') return '💵';
    return '📋';
  }

  function getStatusLabel(status) {
    if (status === 'pending') return 'قيد الانتظار';
    if (status === 'under_review') return 'قيد المراجعة';
    if (status === 'deputy_review') return 'مراجعة الوكيل';
    if (status === 'approved') return 'مقبول';
    if (status === 'rejected') return 'مرفوض';
    return status;
  }

  function getStatusGradient(status) {
    if (status === 'pending') return 'linear-gradient(135deg, #ffc400, #ffab00)';
    if (status === 'under_review') return 'linear-gradient(135deg, #00b0ff, #448aff)';
    if (status === 'deputy_review') return 'linear-gradient(135deg, #764ba2, #667eea)';
    if (status === 'approved') return 'linear-gradient(135deg, #00c853, #00e676)';
    if (status === 'rejected') return 'linear-gradient(135deg, #ff1744, #ff5252)';
    return '#666';
  }

  function getPriorityLabel(p) {
    if (p === 'low') return 'منخفض';
    if (p === 'normal') return 'عادي';
    if (p === 'high') return 'مرتفع';
    if (p === 'urgent') return 'عاجل';
    return p;
  }

  function getPriorityColor(p) {
    if (p === 'low') return '#00b0ff';
    if (p === 'normal') return '#00c853';
    if (p === 'high') return '#ffc400';
    if (p === 'urgent') return '#ff1744';
    return '#999';
  }

  return (
    <div style={s.pageContainer}>
      <div style={s.pageHeader}>
        <h2 style={s.pageTitle}>🎫 التكتات</h2>
        <button onClick={function() { setShowForm(!showForm); }}
          style={showForm ? styles.cancelBtn : s.btnPrimary}>
          {showForm ? '✕ إلغاء' : '+ تكت جديد'}
        </button>
      </div>

      {message && <div style={s.success}>{message}</div>}
      {error && <div style={s.error}>{error}</div>}

      {/* الإحصائيات */}
      {stats && (
        <div style={s.statsGrid}>
          <div style={{...s.statCard, borderTop: '4px solid #ffc400'}}>
            <div style={s.statIcon}>⏳</div>
            <p style={s.statLabel}>قيد الانتظار</p>
            <p style={s.statNumber}>{stats.pending || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #00b0ff'}}>
            <div style={s.statIcon}>📋</div>
            <p style={s.statLabel}>قيد المراجعة</p>
            <p style={s.statNumber}>{stats.under_review || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #764ba2'}}>
            <div style={s.statIcon}>👤</div>
            <p style={s.statLabel}>مراجعة الوكيل</p>
            <p style={s.statNumber}>{stats.deputy_review || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #00c853'}}>
            <div style={s.statIcon}>✅</div>
            <p style={s.statLabel}>مقبول</p>
            <p style={s.statNumber}>{stats.approved || 0}</p>
          </div>
          <div style={{...s.statCard, borderTop: '4px solid #ff1744'}}>
            <div style={s.statIcon}>❌</div>
            <p style={s.statLabel}>مرفوض</p>
            <p style={s.statNumber}>{stats.rejected || 0}</p>
          </div>
        </div>
      )}

      {/* نموذج إنشاء تكت */}
      {showForm && (
        <div style={{...s.card, border: '2px solid #667eea'}}>
          <h3 style={{...s.sectionTitle, marginTop: 0}}>📝 إنشاء تكت جديد</h3>
          <form onSubmit={handleCreateTicket}>
            <div style={styles.formRow}>
              <div style={{...s.inputGroup, flex: 1, minWidth: '200px'}}>
                <label style={s.label}>اسم الكابتن:</label>
                <input type="text" value={newTicket.captain_name}
                  onChange={function(e) { setNewTicket({...newTicket, captain_name: e.target.value}); }}
                  required style={s.input} placeholder="اسم الكابتن" />
              </div>
              <div style={{...s.inputGroup, flex: 1, minWidth: '200px'}}>
                <label style={s.label}>رقم الهاتف:</label>
                <input type="text" value={newTicket.captain_phone}
                  onChange={function(e) { setNewTicket({...newTicket, captain_phone: e.target.value}); }}
                  required style={s.input} placeholder="07xxxxxxxxx" />
              </div>
            </div>

            <div style={styles.formRow}>
              <div style={{...s.inputGroup, flex: 1, minWidth: '200px'}}>
                <label style={s.label}>نوع الحالة:</label>
                <select value={newTicket.case_type}
                  onChange={function(e) { setNewTicket({...newTicket, case_type: e.target.value}); }}
                  required style={s.select}>
                  <option value="">-- اختر --</option>
                  <option value="fine_review">💰 مراجعة غرامة</option>
                  <option value="ban_review">🚫 مراجعة حظر</option>
                  <option value="compensation_request">💵 طلب تعويض</option>
                  <option value="other">📋 أخرى</option>
                </select>
              </div>
              <div style={{...s.inputGroup, flex: 1, minWidth: '200px'}}>
                <label style={s.label}>الأولوية:</label>
                <select value={newTicket.priority}
                  onChange={function(e) { setNewTicket({...newTicket, priority: e.target.value}); }}
                  style={s.select}>
                  <option value="low">🔵 منخفض</option>
                  <option value="normal">🟢 عادي</option>
                  <option value="high">🟡 مرتفع</option>
                  <option value="urgent">🔴 عاجل</option>
                </select>
              </div>
            </div>

            <div style={s.inputGroup}>
              <label style={s.label}>شرح الحالة:</label>
              <textarea value={newTicket.description}
                onChange={function(e) { setNewTicket({...newTicket, description: e.target.value}); }}
                required style={{...s.textarea, minHeight: '100px'}} placeholder="اشرح الحالة بالتفصيل..." />
            </div>

            <button type="submit" disabled={actionLoading === 'create'}
              style={{...s.btnPrimary, ...s.btnFull}}>
              {actionLoading === 'create' ? 'جاري الإنشاء...' : '📤 إرسال التكت'}
            </button>
          </form>
        </div>
      )}

      {/* الفلتر */}
      <div style={s.filterBar}>
        {[
          {key: '', label: 'الكل'},
          {key: 'pending', label: 'قيد الانتظار'},
          {key: 'under_review', label: 'قيد المراجعة'},
          {key: 'deputy_review', label: 'مراجعة الوكيل'},
          {key: 'approved', label: 'مقبول'},
          {key: 'rejected', label: 'مرفوض'}
        ].map(function(f) {
          return (
            <button key={f.key} onClick={function() { setFilter(f.key); }}
              style={{...s.filterBtn, ...(filter === f.key ? s.filterBtnActive : {})}}>
              {f.label}
            </button>
          );
        })}
      </div>

      {/* قائمة التكتات */}
      {loading ? (
        <p style={s.noData}>جاري التحميل...</p>
      ) : tickets.length === 0 ? (
        <div style={s.noData}>
          <span style={{fontSize: '50px', display: 'block', marginBottom: '10px'}}>🎫</span>
          لا توجد تكتات
        </div>
      ) : (
        tickets.map(function(ticket) {
          return (
            <div key={ticket.id} style={styles.ticketCard}>
              {/* رأس التكت */}
              <div style={styles.ticketHeader}>
                <div style={styles.ticketHeaderLeft}>
                  <div style={{...styles.ticketIcon, backgroundColor: getPriorityColor(ticket.priority) + '20'}}>
                    {getCaseIcon(ticket.case_type)}
                  </div>
                  <div>
                    <div style={styles.ticketTitleRow}>
                      <span style={styles.ticketNumber}>#{ticket.ticket_number}</span>
                      <span style={styles.ticketName}>{ticket.captain_name}</span>
                    </div>
                    <div style={styles.ticketMetaRow}>
                      <span style={styles.metaItem}>📱 {ticket.captain_phone}</span>
                      <span style={styles.metaItem}>{getCaseIcon(ticket.case_type)} {getCaseLabel(ticket.case_type)}</span>
                      <span style={{...styles.priorityBadge, color: getPriorityColor(ticket.priority), backgroundColor: getPriorityColor(ticket.priority) + '15'}}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </div>
                    {ticket.created_by_user && (
                      <span style={styles.createdBy}>
                        👤 {ticket.created_by_user.full_name} {ticket.created_by_user.city ? '(' + ticket.created_by_user.city + ')' : ''}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{...s.badge, background: getStatusGradient(ticket.status)}}>
                  {getStatusLabel(ticket.status)}
                </span>
              </div>

              {/* وصف التكت */}
              <div style={styles.ticketBody}>
                <p style={styles.ticketDesc}>{ticket.description}</p>
              </div>

              {/* رد الوكيل */}
              {ticket.deputy_response && (
                <div style={styles.responseBox}>
                  <span style={styles.responseIcon}>👤</span>
                  <div>
                    <span style={styles.responseTitle}>رد الوكيل:</span>
                    <p style={styles.responseText}>{ticket.deputy_response}</p>
                  </div>
                </div>
              )}

              {/* رد الإدارة */}
              {ticket.admin_response && (
                <div style={{
                  ...styles.responseBox,
                  backgroundColor: ticket.status === 'approved' ? '#e8f5e9' : '#ffebee',
                  borderRightColor: ticket.status === 'approved' ? '#00c853' : '#ff1744'
                }}>
                  <span style={styles.responseIcon}>{ticket.status === 'approved' ? '✅' : '❌'}</span>
                  <div>
                    <span style={styles.responseTitle}>رد الإدارة:</span>
                    <p style={styles.responseText}>{ticket.admin_response}</p>
                  </div>
                </div>
              )}

              {/* فوتر التكت */}
              <div style={styles.ticketFooter}>
                <span style={styles.ticketDate}>
                  📅 {new Date(ticket.created_at).toLocaleDateString('ar-IQ')} - {new Date(ticket.created_at).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute: '2-digit'})}
                </span>
                {(isAdmin || ticket.deputy_id === user?.id) && (
                  <button onClick={function() { setShowDetail(showDetail === ticket.id ? null : ticket.id); }}
                    style={styles.actionToggle}>
                    {showDetail === ticket.id ? '✕ إغلاق' : '⚡ إجراءات'}
                  </button>
                )}
              </div>

              {/* إجراءات المدير */}
{showDetail === ticket.id && (isAdmin || ticket.deputy_id === user?.id) && (
                  <div style={styles.actionPanel}>
                  {ticket.status === 'pending' && (
                    <button onClick={function() { handleReview(ticket.id); }} style={s.btnInfo}>
                      📋 بدء المراجعة
                    </button>
                  )}

                  {(ticket.status === 'under_review' || ticket.status === 'pending') && (
                    <div>
                      {/* تحويل للوكيل */}
                      <div style={styles.actionSection}>
                        <h4 style={styles.actionTitle}>👤 تحويل للوكيل</h4>
                        <div style={styles.actionRow}>
                          <select value={deputyId} onChange={function(e) { setDeputyId(e.target.value); }} style={{...s.select, flex: 1}}>
                            <option value="">-- اختر الوكيل --</option>
                            {users.map(function(u) {
                              return <option key={u.id} value={u.id}>{u.full_name} ({u.role === 'admin' ? 'مدير' : 'محاسب'})</option>;
                            })}
                          </select>
                          <button onClick={function() { handleSendToDeputy(ticket.id); }}
                            style={{...s.btnSmall, background: 'linear-gradient(135deg, #764ba2, #667eea)', padding: '10px 20px'}}>
                            📤 تحويل
                          </button>
                        </div>
                      </div>

                      {/* القرار */}
                      <div style={styles.actionSection}>
                        <h4 style={styles.actionTitle}>📝 القرار</h4>
                        <textarea value={responseText} onChange={function(e) { setResponseText(e.target.value); }}
                          style={{...s.textarea, minHeight: '70px'}} placeholder="اكتب السبب..." />
                        <div style={{...styles.actionRow, marginTop: '10px'}}>
                          <button onClick={function() { handleApprove(ticket.id); }} style={s.btnSuccess}>
                            ✅ قبول
                          </button>
                          <button onClick={function() { handleReject(ticket.id); }} style={s.btnDanger}>
                            ❌ رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {ticket.status === 'deputy_review' && ticket.deputy_id === user?.id && (
                    <div style={styles.actionSection}>
                      <h4 style={styles.actionTitle}>📝 ردك كوكيل</h4>
                      <textarea value={deputyResponse} onChange={function(e) { setDeputyResponse(e.target.value); }}
                        style={{...s.textarea, minHeight: '70px'}} placeholder="اكتب ردك..." />
                      <button onClick={function() { handleDeputyResponse(ticket.id); }}
                        style={{...s.btnPrimary, marginTop: '10px'}}>
                        📤 إرسال الرد
                      </button>
                    </div>
                  )}
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
  formRow: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  cancelBtn: { padding: '12px 28px', background: 'linear-gradient(135deg, #6c757d, #495057)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },

  // بطاقة التكت
  ticketCard: { backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '16px', overflow: 'hidden', transition: 'transform 0.2s' },
  ticketHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px 0 24px' },
  ticketHeaderLeft: { display: 'flex', gap: '14px', alignItems: 'flex-start' },
  ticketIcon: { width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 },
  ticketTitleRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  ticketNumber: { fontSize: '14px', fontWeight: '800', color: '#667eea' },
  ticketName: { fontSize: '16px', fontWeight: '700', color: '#1a1a2e' },
  ticketMetaRow: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' },
  metaItem: { fontSize: '12px', color: '#999' },
  priorityBadge: { fontSize: '11px', fontWeight: '700', padding: '2px 10px', borderRadius: '20px' },
  createdBy: { fontSize: '12px', color: '#bbb', display: 'block', marginTop: '4px' },

  // جسم التكت
  ticketBody: { padding: '15px 24px' },
  ticketDesc: { margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.8', padding: '14px 18px', backgroundColor: '#f8f9fa', borderRadius: '12px', borderRight: '4px solid #667eea' },

  // الردود
  responseBox: { margin: '0 24px 15px 24px', padding: '14px 18px', backgroundColor: '#e8f4fd', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'flex-start', borderRight: '4px solid #00b0ff' },
  responseIcon: { fontSize: '20px', flexShrink: 0 },
  responseTitle: { fontSize: '12px', fontWeight: '700', color: '#1a1a2e', display: 'block', marginBottom: '3px' },
  responseText: { margin: 0, fontSize: '13px', color: '#555', lineHeight: '1.6' },

  // فوتر
  ticketFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderTop: '1px solid #f5f5f5' },
  ticketDate: { fontSize: '12px', color: '#bbb' },
  actionToggle: { padding: '8px 18px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },

  // لوحة الإجراءات
  actionPanel: { padding: '20px 24px', backgroundColor: '#f8f9fa', borderTop: '2px solid #e9ecef' },
  actionSection: { marginBottom: '20px' },
  actionTitle: { fontSize: '14px', fontWeight: '700', color: '#1a1a2e', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' },
  actionRow: { display: 'flex', gap: '10px', alignItems: 'center' }
};

export default TicketsPage;