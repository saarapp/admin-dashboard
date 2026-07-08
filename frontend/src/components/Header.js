// ============================================
// components/Header.js - الشريط العلوي مع الإشعارات
// ============================================

import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

function Header() {
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user?.role === 'admin';

  useEffect(function() {
    fetchNotifications();
    var interval = setInterval(fetchNotifications, 15000);
    return function() { clearInterval(interval); };
  }, []);

  useEffect(function() {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return function() { document.removeEventListener('mousedown', handleClick); };
  }, []);

  function fetchNotifications() {
    var notifs = [];

    api.get('/messages/unread').then(function(msgRes) {
      setUnreadMessages(msgRes.data.data.unread);
      if (msgRes.data.data.unread > 0) {
        notifs.push({
          type: 'message',
          icon: '💬',
          text: 'لديك ' + msgRes.data.data.unread + ' رسالة غير مقروءة',
          link: '/chat',
          color: '#007bff'
        });
      }

      if (isAdmin) {
        api.get('/tickets/stats').then(function(ticketRes) {
          if (ticketRes.data.data.pending > 0) {
            notifs.push({
              type: 'ticket',
              icon: '🎫',
              text: ticketRes.data.data.pending + ' تكت بانتظار المراجعة',
              link: '/tickets',
              color: '#ffc107'
            });
          }
          if (ticketRes.data.data.deputy_review > 0) {
            notifs.push({
              type: 'deputy',
              icon: '👤',
              text: ticketRes.data.data.deputy_review + ' تكت بانتظار الوكيل',
              link: '/tickets',
              color: '#6f42c1'
            });
          }

          api.get('/appeals/stats').then(function(appealRes) {
            if (appealRes.data.data.pending > 0) {
              notifs.push({
                type: 'appeal',
                icon: '⚖️',
                text: appealRes.data.data.pending + ' طعن بانتظار القرار',
                link: '/appeals',
                color: '#dc3545'
              });
            }
            setNotifications(notifs);
          }).catch(function() { setNotifications(notifs); });
        }).catch(function() { setNotifications(notifs); });
      } else {
        setNotifications(notifs);
      }
    }).catch(function() {});
  }

  var totalNotifications = notifications.length;

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  function handleNotifClick(link) {
    setShowNotifications(false);
    window.location.href = link;
  }

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <span style={styles.welcome}>مرحباً، {user?.full_name}</span>

        <div style={styles.headerActions}>
          <div ref={notifRef} style={styles.notifWrapper}>
            <button onClick={function() { setShowNotifications(!showNotifications); }} style={styles.notifBtn}>
              🔔
              {totalNotifications > 0 && (
                <span style={styles.notifBadge}>{totalNotifications}</span>
              )}
            </button>

            {showNotifications && (
              <div style={styles.notifDropdown}>
                <div style={styles.notifHeader}>
                  <strong>الإشعارات</strong>
                  {totalNotifications === 0 && <span style={styles.noNotif}>لا توجد إشعارات</span>}
                </div>
                {notifications.map(function(notif, index) {
                  return (
                    <div key={index} onClick={function() { handleNotifClick(notif.link); }} style={styles.notifItem}>
                      <span style={styles.notifIcon}>{notif.icon}</span>
                      <span style={styles.notifText}>{notif.text}</span>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: notif.color
                      }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={handleLogout} style={styles.logoutBtn}>
            تسجيل خروج
          </button>
        </div>
      </div>
    </header>
  );
}

var styles = {
  header: {
    backgroundColor: 'white',
    padding: '15px 30px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  welcome: {
    fontSize: '15px',
    color: '#333'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  notifWrapper: {
    position: 'relative'
  },
  notifBtn: {
    background: 'none',
    border: '1px solid #eee',
    borderRadius: '50%',
    width: '42px',
    height: '42px',
    fontSize: '20px',
    cursor: 'pointer',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  notifBadge: {
    position: 'absolute',
    top: '-5px',
    right: '-5px',
    backgroundColor: '#dc3545',
    color: 'white',
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold'
  },
  notifDropdown: {
    position: 'absolute',
    top: '50px',
    left: '0',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 5px 20px rgba(0,0,0,0.15)',
    width: '320px',
    zIndex: 100,
    overflow: 'hidden'
  },
  notifHeader: {
    padding: '15px',
    borderBottom: '1px solid #eee',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  noNotif: {
    fontSize: '12px',
    color: '#999'
  },
  notifItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    borderBottom: '1px solid #f5f5f5',
    cursor: 'pointer'
  },
  notifIcon: {
    fontSize: '20px'
  },
  notifText: {
    flex: 1,
    fontSize: '13px'
  },
  logoutBtn: {
    padding: '8px 15px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '13px'
  }
};

export default Header;