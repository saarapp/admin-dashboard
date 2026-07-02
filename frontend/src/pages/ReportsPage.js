// ============================================
// pages/ReportsPage.js - صفحة التقارير
// ============================================

import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ReportsPage() {
  const [activeTab, setActiveTab] = useState('daily');
  const [loading, setLoading] = useState(false);
  const [dailyData, setDailyData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (activeTab === 'daily') {
      fetchDailyReport();
    } else {
      fetchMonthlyReport();
    }
  }, [activeTab, selectedDate, selectedMonth, selectedYear]);

  const fetchDailyReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/daily?date=${selectedDate}`);
      setDailyData(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب التقرير اليومي:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/reports/monthly?month=${selectedMonth}&year=${selectedYear}`);
      setMonthlyData(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب التقرير الشهري:', error);
    } finally {
      setLoading(false);
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

  const getTypeColor = (type) => {
    switch (type) {
      case 'warning': return '#ffc107';
      case 'deduction': return '#dc3545';
      case 'compensation': return '#28a745';
      default: return '#666';
    }
  };

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div style={styles.container}>
      <h2>التقارير</h2>

      {/* التبويبات */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('daily')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'daily' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'daily' ? 'white' : '#333'
          }}
        >
          📅 تقرير يومي
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          style={{
            ...styles.tab,
            backgroundColor: activeTab === 'monthly' ? '#6f42c1' : '#f8f9fa',
            color: activeTab === 'monthly' ? 'white' : '#333'
          }}
        >
          📊 تقرير شهري
        </button>
      </div>

      {/* ============================================ */}
      {/* التقرير اليومي */}
      {/* ============================================ */}
      {activeTab === 'daily' && (
        <div style={styles.tabContent}>
          {/* اختيار التاريخ */}
          <div style={styles.dateSelector}>
            <label style={styles.label}>اختر التاريخ:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              style={styles.dateInput}
            />
          </div>

          {loading ? (
            <p style={styles.noData}>جاري التحميل...</p>
          ) : dailyData ? (
            <div>
              {/* إحصائيات اليوم */}
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderTop: '4px solid #007bff' }}>
                  <h4>إجمالي العمليات</h4>
                  <p style={styles.statNumber}>{dailyData.stats.totalRecords}</p>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #ffc107' }}>
                  <h4>الإنذارات</h4>
                  <p style={styles.statNumber}>{dailyData.stats.warnings}</p>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #dc3545' }}>
                  <h4>الخصومات</h4>
                  <p style={styles.statNumber}>{dailyData.stats.deductions}</p>
                  <p style={styles.statAmount}>{dailyData.stats.totalDeductionAmount} دينار</p>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #28a745' }}>
                  <h4>التعويضات</h4>
                  <p style={styles.statNumber}>{dailyData.stats.compensations}</p>
                  <p style={styles.statAmount}>{dailyData.stats.totalCompensationAmount} دينار</p>
                </div>
              </div>

              {/* إحصائيات الإشعارات */}
              <div style={styles.sectionCard}>
                <h3>حالة الرسائل</h3>
                <div style={styles.miniStats}>
                  <span style={styles.miniStat}>✅ مرسلة: {dailyData.notifStats.sent || 0}</span>
                  <span style={styles.miniStat}>❌ فاشلة: {dailyData.notifStats.failed || 0}</span>
                  <span style={styles.miniStat}>⏳ معلقة: {dailyData.notifStats.pending || 0}</span>
                </div>
              </div>

              {/* إحصائيات الطعون */}
              <div style={styles.sectionCard}>
                <h3>الطعون</h3>
                <div style={styles.miniStats}>
                  <span style={styles.miniStat}>⏳ قيد المراجعة: {dailyData.appealStats.pending || 0}</span>
                  <span style={styles.miniStat}>✅ مقبول: {dailyData.appealStats.approved || 0}</span>
                  <span style={styles.miniStat}>❌ مرفوض: {dailyData.appealStats.rejected || 0}</span>
                </div>
              </div>

              {/* جدول السجلات */}
              <div style={styles.sectionCard}>
                <h3>تفاصيل العمليات</h3>
                {dailyData.records.length === 0 ? (
                  <p style={styles.noData}>لا توجد عمليات في هذا اليوم</p>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>الكابتن</th>
                        <th style={styles.th}>النوع</th>
                        <th style={styles.th}>المبلغ</th>
                        <th style={styles.th}>بواسطة</th>
                        <th style={styles.th}>الوقت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyData.records.map((record) => (
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
                          <td style={styles.td}>{record.users?.full_name || '-'}</td>
                          <td style={styles.td}>
                            {new Date(record.created_at).toLocaleTimeString('ar-IQ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ) : (
            <p style={styles.noData}>لا توجد بيانات</p>
          )}
        </div>
      )}

      {/* ============================================ */}
      {/* التقرير الشهري */}
      {/* ============================================ */}
      {activeTab === 'monthly' && (
        <div style={styles.tabContent}>
          {/* اختيار الشهر */}
          <div style={styles.dateSelector}>
            <div style={styles.monthSelector}>
              <div>
                <label style={styles.label}>الشهر:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  style={styles.dateInput}
                >
                  {monthNames.map((name, index) => (
                    <option key={index} value={index + 1}>{name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={styles.label}>السنة:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={styles.dateInput}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <p style={styles.noData}>جاري التحميل...</p>
          ) : monthlyData ? (
            <div>
              {/* إحصائيات الشهر */}
              <div style={styles.statsGrid}>
                <div style={{ ...styles.statCard, borderTop: '4px solid #007bff' }}>
                  <h4>إجمالي العمليات</h4>
                  <p style={styles.statNumber}>{monthlyData.stats.totalRecords}</p>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #ffc107' }}>
                  <h4>الإنذارات</h4>
                  <p style={styles.statNumber}>{monthlyData.stats.warnings}</p>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #dc3545' }}>
                  <h4>الخصومات</h4>
                  <p style={styles.statNumber}>{monthlyData.stats.deductions}</p>
                  <p style={styles.statAmount}>{monthlyData.stats.totalDeductionAmount} دينار</p>
                </div>
                <div style={{ ...styles.statCard, borderTop: '4px solid #28a745' }}>
                  <h4>التعويضات</h4>
                  <p style={styles.statNumber}>{monthlyData.stats.compensations}</p>
                  <p style={styles.statAmount}>{monthlyData.stats.totalCompensationAmount} دينار</p>
                </div>
              </div>

              {/* إحصائيات الطعون */}
              <div style={styles.sectionCard}>
                <h3>الطعون</h3>
                <div style={styles.miniStats}>
                  <span style={styles.miniStat}>⏳ قيد المراجعة: {monthlyData.appealStats.pending || 0}</span>
                  <span style={styles.miniStat}>✅ مقبول: {monthlyData.appealStats.approved || 0}</span>
                  <span style={styles.miniStat}>❌ مرفوض: {monthlyData.appealStats.rejected || 0}</span>
                </div>
              </div>

              {/* أكثر الكابتنات غرامات */}
              {monthlyData.topCaptains && monthlyData.topCaptains.length > 0 && (
                <div style={styles.sectionCard}>
                  <h3>أكثر الكابتنات غرامات</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>#</th>
                        <th style={styles.th}>الكابتن</th>
                        <th style={styles.th}>إنذارات</th>
                        <th style={styles.th}>خصومات</th>
                        <th style={styles.th}>تعويضات</th>
                        <th style={styles.th}>صافي المبلغ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyData.topCaptains.map((captain, index) => (
                        <tr key={index}>
                          <td style={styles.td}>{index + 1}</td>
                          <td style={styles.td}>{captain.name}</td>
                          <td style={styles.td}>{captain.warnings}</td>
                          <td style={styles.td}>{captain.deductions}</td>
                          <td style={styles.td}>{captain.compensations}</td>
                          <td style={{
                            ...styles.td,
                            color: captain.totalAmount > 0 ? '#dc3545' : '#28a745',
                            fontWeight: 'bold'
                          }}>
                            {captain.totalAmount} دينار
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* إحصائيات يومية */}
              {monthlyData.dailyStats && Object.keys(monthlyData.dailyStats).length > 0 && (
                <div style={styles.sectionCard}>
                  <h3>تفاصيل حسب اليوم</h3>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>التاريخ</th>
                        <th style={styles.th}>إنذارات</th>
                        <th style={styles.th}>خصومات</th>
                        <th style={styles.th}>مبلغ الخصم</th>
                        <th style={styles.th}>تعويضات</th>
                        <th style={styles.th}>مبلغ التعويض</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyData.dailyStats)
                        .sort((a, b) => a[0].localeCompare(b[0]))
                        .map(([date, data]) => (
                          <tr key={date}>
                            <td style={styles.td}>{new Date(date).toLocaleDateString('ar-IQ')}</td>
                            <td style={styles.td}>{data.warnings}</td>
                            <td style={styles.td}>{data.deductions}</td>
                            <td style={styles.td}>{data.deductionAmount} دينار</td>
                            <td style={styles.td}>{data.compensations}</td>
                            <td style={styles.td}>{data.compensationAmount} دينار</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p style={styles.noData}>لا توجد بيانات</p>
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
    marginTop: '20px'
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
  dateSelector: {
    marginBottom: '20px'
  },
  monthSelector: {
    display: 'flex',
    gap: '15px'
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    fontWeight: 'bold',
    color: '#333'
  },
  dateInput: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '5px',
    fontSize: '14px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  statCard: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    margin: '5px 0 0 0'
  },
  statAmount: {
    fontSize: '13px',
    color: '#666',
    margin: '5px 0 0 0'
  },
  sectionCard: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '15px'
  },
  miniStats: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  miniStat: {
    fontSize: '14px',
    color: '#333'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '10px'
  },
  th: {
    backgroundColor: '#e9ecef',
    padding: '10px',
    textAlign: 'right',
    borderBottom: '2px solid #ddd',
    fontSize: '13px'
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #eee',
    textAlign: 'right',
    fontSize: '13px'
  },
  badge: {
    padding: '3px 8px',
    borderRadius: '15px',
    color: 'white',
    fontSize: '11px',
    fontWeight: 'bold'
  },
  noData: {
    textAlign: 'center',
    color: '#999',
    padding: '30px'
  }
};

export default ReportsPage;