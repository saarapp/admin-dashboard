// ============================================
// components/Sidebar.js - القائمة الجانبية
// ============================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'الرئيسية', icon: '📊' },
    { path: '/records', label: 'الغرامات والتعويضات', icon: '📝' },
    { path: '/notifications', label: 'الإشعارات', icon: '🔔' },
    { path: '/search', label: 'البحث في السجلات', icon: '🔍' },
    { path: '/whatsapp', label: 'إدارة الواتساب', icon: '📱' },
    { path: '/appeals', label: 'الطعون', icon: '⚖️' },
    { path: '/reports', label: 'التقارير', icon: '📊' },
    { path: '/settings', label: 'الإعدادات', icon: '⚙️' }
  ];

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <h2>لوحة التحكم</h2>
      </div>

      <nav style={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              ...styles.link,
              ...(location.pathname === item.path ? styles.activeLink : {})
            }}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

const styles = {
  sidebar: {
    width: '250px',
    backgroundColor: '#1a1a2e',
    color: 'white',
    minHeight: '100vh',
    position: 'fixed',
    right: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column'
  },
  logo: {
    padding: '20px',
    textAlign: 'center',
    borderBottom: '1px solid #333'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '10px 0'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '15px 20px',
    color: '#ccc',
    textDecoration: 'none',
    fontSize: '15px',
    transition: 'all 0.3s'
  },
  activeLink: {
    backgroundColor: '#007bff',
    color: 'white'
  },
  icon: {
    fontSize: '20px'
  }
};

export default Sidebar;