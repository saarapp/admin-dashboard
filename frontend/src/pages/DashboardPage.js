// ============================================
// pages/DashboardPage.js - الصفحة الرئيسية
// ============================================

import React, { useState, useEffect } from 'react';
import api from '../services/api';

function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // جلب بيانات المستخدم
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // جلب الإحصائيات
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/records/stats/global');
      setStats(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1>لوحة التحكم</h1>
          <div style={styles.userInfo}>
            <span>{user?.full_name} ({user?.role})</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              تسجيل خروج
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <h2>ملخص النظام</h2>

        {loading ? (
          <p>جاري التحميل...</p>
        ) : stats ? (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <h3>إجمالي الإنذارات</h3>
              <p style={styles.statNumber}>{stats.totalWarnings}</p>
            </div>

            <div style={styles.statCard}>
              <h3>إجمالي الخصومات</h3>
              <p style={styles.statNumber}>{stats.totalDeductions}</p>
            </div>

            <div style={styles.statCard}>
              <h3>إجمالي التعويضات</h3>
              <p style={styles.statNumber}>{stats.totalCompensations}</p>
            </div>
          </div>
        ) : (
          <p>لا توجد بيانات</p>
        )}

        <div style={styles.soon}>
          <p>🚀 الصفحات الأخرى قريباً...</p>
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    direction: 'rtl'
  },
  header: {
    backgroundColor: '#007bff',
    color: 'white',
    padding: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  userInfo: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  logoutBtn: {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  main: {
    flex: 1,
    padding: '30px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#007bff',
    margin: '10px 0 0 0'
  },
  soon: {
    marginTop: '40px',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '8px',
    textAlign: 'center',
    fontSize: '18px'
  }
};

export default DashboardPage;