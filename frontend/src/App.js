// ============================================
// App.js - الملف الرئيسي
// ============================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RecordsPage from './pages/RecordsPage';
import NotificationsPage from './pages/NotificationsPage';
import SearchPage from './pages/SearchPage';
import SettingsPage from './pages/SettingsPage';
import WhatsappPage from './pages/WhatsappPage';
import AppealsPage from './pages/AppealsPage';
import BannedPage from './pages/BannedPage';
import ReportsPage from './pages/ReportsPage';
import MarketingPage from './pages/MarketingPage';
import TicketsPage from './pages/TicketsPage';
import ChatPage from './pages/ChatPage';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>جاري التحميل...</div>;
  }

  // صفحة الدخول بدون Sidebar
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  // الصفحات الداخلية مع Sidebar
  return (
    <Router>
      <div style={styles.layout}>
        <Sidebar />
        <div style={styles.content}>
          {/* Header */}
          <Header />

          {/* الصفحات */}
          <div style={styles.pageContent}>
            <Routes>
              {JSON.parse(localStorage.getItem('user'))?.role === 'admin' && (
                <>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/records" element={<RecordsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/whatsapp" element={<WhatsappPage />} />
                  <Route path="/appeals" element={<AppealsPage />} />
                  <Route path="/banned" element={<BannedPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/marketing" element={<MarketingPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </>
              )}
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/" element={
                <Navigate to={JSON.parse(localStorage.getItem('user'))?.role === 'admin' ? '/dashboard' : '/tickets'} />
              } />
              <Route path="*" element={
                <Navigate to={JSON.parse(localStorage.getItem('user'))?.role === 'admin' ? '/dashboard' : '/tickets'} />
              } />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

const styles = {
  layout: {
    display: 'flex',
    direction: 'rtl',
    minHeight: '100vh'
  },
  content: {
    flex: 1,
    marginRight: '250px',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh'
  },
  header: {
    backgroundColor: 'white',
    padding: '15px 30px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  logoutBtn: {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px'
  },
  pageContent: {
    padding: '20px'
  }
};

export default App;