import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  const adminItems = [
    { path: '/dashboard', label: 'الرئيسية', icon: '📊' },
    { path: '/records', label: 'الغرامات والتعويضات', icon: '📝' },
    { path: '/notifications', label: 'الإشعارات', icon: '🔔' },
    { path: '/search', label: 'البحث في السجلات', icon: '🔍' },
    { path: '/whatsapp', label: 'إدارة الواتساب', icon: '📱' },
    { path: '/appeals', label: 'الطعون', icon: '⚖️' },
    { path: '/banned', label: 'المحظورون', icon: '🚫' },
    { path: '/reports', label: 'التقارير', icon: '📊' },
    { path: '/marketing', label: 'التسويق', icon: '📢' },
    { path: '/tickets', label: 'التكتات', icon: '🎫' },
    { path: '/chat', label: 'الدردشة', icon: '💬' },
    { path: '/settings', label: 'الإعدادات', icon: '⚙️' }
  ];

  const accountantItems = [
    { path: '/tickets', label: 'التكتات', icon: '🎫' },
    { path: '/chat', label: 'الدردشة', icon: '💬' }
  ];

  const menuItems = isAdmin ? adminItems : accountantItems;

  return (
    <div style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>⚡</div>
        <h2 style={styles.logoText}>لوحة التحكم</h2>
        <div style={styles.userBadge}>
          <div style={styles.userAvatar}>{user?.full_name?.charAt(0)}</div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.full_name}</span>
            <span style={styles.userRole}>{isAdmin ? 'مدير' : 'موظف'}</span>
          </div>
        </div>
      </div>

      <nav style={styles.nav}>
        {menuItems.map(function(item) {
          var isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path} style={{
              ...styles.link,
              ...(isActive ? styles.activeLink : {})
            }}>
              <span style={styles.linkIcon}>{item.icon}</span>
              <span style={styles.linkText}>{item.label}</span>
              {isActive && <div style={styles.activeBar} />}
            </Link>
          );
        })}
      </nav>

      <div style={styles.footer}>
        <span style={styles.version}>v1.0.0</span>
      </div>
    </div>
  );
}

var styles = {
  sidebar: {
    width: '260px',
    background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
    color: 'white',
    minHeight: '100vh',
    position: 'fixed',
    right: 0,
    top: 0,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50
  },
  logo: {
    padding: '25px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  logoIcon: {
    fontSize: '30px',
    textAlign: 'center',
    marginBottom: '5px'
  },
  logoText: {
    textAlign: 'center',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '15px'
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '10px'
  },
  userAvatar: {
    width: '38px',
    height: '38px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600'
  },
  userRole: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)'
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    padding: '15px 12px',
    flex: 1,
    overflowY: 'auto',
    gap: '4px'
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 15px',
    color: 'rgba(255,255,255,0.65)',
    textDecoration: 'none',
    fontSize: '14px',
    borderRadius: '10px',
    transition: 'all 0.3s',
    position: 'relative'
  },
  activeLink: {
    backgroundColor: 'rgba(102,126,234,0.2)',
    color: 'white'
  },
  activeBar: {
    position: 'absolute',
    left: '0',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '4px',
    height: '24px',
    backgroundColor: '#667eea',
    borderRadius: '0 4px 4px 0'
  },
  linkIcon: {
    fontSize: '18px',
    width: '24px',
    textAlign: 'center'
  },
  linkText: {
    fontWeight: '500'
  },
  footer: {
    padding: '15px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    textAlign: 'center'
  },
  version: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.3)'
  }
};

export default Sidebar;