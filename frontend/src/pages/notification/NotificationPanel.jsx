import { useState, useEffect, useRef } from 'react';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification, getUnreadCount } from '../../api/services';
import { FaBell, FaCheck, FaCheckDouble, FaTrash, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Notification.css';

function NotificationPanel({ userId }) {
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  const fetchUnreadCount = async () => {
    try {
      const res = await getUnreadCount(userId);
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Failed to fetch unread count', err);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getUserNotifications(userId);
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(userId);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      const notif = notifications.find(n => n.id === id);
      if (notif && !notif.read) setUnreadCount(prev => Math.max(0, prev - 1));
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (type) => {
    const icons = {
      BOOKING_APPROVED: '✅', BOOKING_REJECTED: '❌',
      TICKET_STATUS: '🔧', TICKET_ASSIGNED: '👷',
      NEW_COMMENT: '💬', VISITOR_APPROVED: '🎫',
      VISITOR_REJECTED: '🚫', GENERAL: '📢',
    };
    return icons[type] || '📢';
  };

  return (
    <div className="notification-wrapper" ref={panelRef}>
      <button className="notification-bell" onClick={() => setIsOpen(!isOpen)}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h3>Notifications</h3>
            <div className="notification-header-actions">
              {unreadCount > 0 && (
                <button className="btn-icon" onClick={handleMarkAllRead} title="Mark all as read">
                  <FaCheckDouble />
                </button>
              )}
              <button className="btn-icon" onClick={() => setIsOpen(false)}>
                <FaTimes />
              </button>
            </div>
          </div>

          <div className="notification-list">
            {loading && <div className="notification-empty">Loading...</div>}

            {!loading && notifications.length === 0 && (
              <div className="notification-empty">No notifications yet</div>
            )}

            {!loading && notifications.map((notif) => (
              <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                <div className="notification-icon">{getTypeIcon(notif.type)}</div>
                <div className="notification-content">
                  <span className="notification-title">{notif.title}</span>
                  <p className="notification-message">{notif.message}</p>
                  <span className="notification-time">
                    {timeAgo(notif.createdAt)}
                  </span>
                </div>
                <div className="notification-actions">
                  {!notif.read && (
                    <button className="btn-icon" onClick={() => handleMarkRead(notif.id)} title="Mark as read">
                      <FaCheck />
                    </button>
                  )}
                  <button className="btn-icon btn-icon-danger" onClick={() => handleDelete(notif.id)} title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link to="/notifications" className="notification-view-all" onClick={() => setIsOpen(false)}>
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;
