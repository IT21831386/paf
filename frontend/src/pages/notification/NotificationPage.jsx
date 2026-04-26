import { useState, useEffect } from 'react';
import { getUserNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification } from '../../api/services';
import { FaBell, FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function NotificationPage() {
  const navigate = useNavigate();
  const stored = localStorage.getItem('user');
  const user = stored ? JSON.parse(stored) : null;

  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('ALL'); // ALL, UNREAD, TICKET_*, VISITOR_*, GENERAL
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getUserNotifications(user.id);
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(user.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  const getTypeIcon = (type) => {
    const map = {
      TICKET_ASSIGNED: '🔧', TICKET_STATUS: '📋', NEW_COMMENT: '💬',
      BOOKING_APPROVED: '✅', BOOKING_REJECTED: '❌',
      VISITOR_APPROVED: '🎫', VISITOR_REJECTED: '🚫',
      GENERAL: '📢'
    };
    return map[type] || '🔔';
  };

  const filtered = notifications.filter(n => {
    if (filter === 'ALL') return true;
    if (filter === 'UNREAD') return !n.read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeFilters = ['ALL', 'UNREAD', 'TICKET_ASSIGNED', 'TICKET_STATUS', 'NEW_COMMENT', 'BOOKING_APPROVED', 'VISITOR_APPROVED', 'GENERAL'];

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading notifications...</div></div>;

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><FaBell /> Notifications</h1>
          <p className="page-subtitle">{unreadCount} unread of {notifications.length} total</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-ghost" onClick={handleMarkAllRead}>
            <FaCheckDouble /> Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {typeFilters.map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
            style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
          >
            {f === 'ALL' ? 'All' : f === 'UNREAD' ? `Unread (${unreadCount})` : f.replace(/_/g, ' ').toLowerCase()}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No notifications found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {filtered.map(n => (
            <div
              key={n.id}
              className="resource-card"
              style={{
                opacity: n.read ? 0.65 : 1,
                borderLeft: n.read ? 'none' : '3px solid #a78bfa',
                padding: '0.8rem 1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{getTypeIcon(n.type)}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '0.9rem' }}>{n.title}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.2rem' }}>{n.message}</div>
                    <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                      {n.createdAt ? timeAgo(n.createdAt) : ''} · {n.type?.replace(/_/g, ' ')}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                  {!n.read && (
                    <button className="btn btn-sm btn-ghost" onClick={() => handleMarkRead(n.id)} title="Mark Read">
                      <FaCheck />
                    </button>
                  )}
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(n.id)} title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationPage;
