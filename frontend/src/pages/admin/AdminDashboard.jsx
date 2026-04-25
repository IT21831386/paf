import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaBuilding, FaTools, FaUserShield, FaArrowRight, FaChartBar } from 'react-icons/fa';
import api from '../../api/axiosInstance';
import './Admin.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentTickets, setRecentTickets] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ticketsRes, visitorsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/recent-tickets'),
          api.get('/admin/recent-visitors'),
        ]);
        setStats(statsRes.data);
        setRecentTickets(ticketsRes.data);
        setRecentVisitors(visitorsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusBadge = (status) => {
    const map = {
      OPEN: 'badge badge-info', IN_PROGRESS: 'badge badge-warning',
      RESOLVED: 'badge badge-success', CLOSED: 'badge badge-neutral',
      REJECTED: 'badge badge-danger', PENDING: 'badge badge-warning',
      APPROVED: 'badge badge-success', CHECKED_IN: 'badge badge-info',
    };
    return <span className={map[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading dashboard...</div></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><FaChartBar /> Admin Dashboard</h1>
          <p className="page-subtitle">System-wide overview and quick actions</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-purple">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalUsers || 0}</span>
            <span className="stat-label">Total Users</span>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-icon"><FaBuilding /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalResources || 0}</span>
            <span className="stat-label">Resources</span>
          </div>
        </div>
        <div className="stat-card stat-orange">
          <div className="stat-icon"><FaTools /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalTickets || 0}</span>
            <span className="stat-label">Total Tickets</span>
          </div>
        </div>
        <div className="stat-card stat-pink">
          <div className="stat-icon"><FaUserShield /></div>
          <div className="stat-info">
            <span className="stat-value">{stats?.totalVisitors || 0}</span>
            <span className="stat-label">Visitor Requests</span>
          </div>
        </div>
      </div>

      {/* Breakdown Panels */}
      <div className="dashboard-panels">
        {/* Ticket Breakdown */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Ticket Status Breakdown</h3>
            <Link to="/tickets" className="panel-link">View All <FaArrowRight size={10} /></Link>
          </div>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <span className="breakdown-count text-info">{stats?.openTickets || 0}</span>
              <span className="breakdown-label">Open</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-count text-warning">{stats?.inProgressTickets || 0}</span>
              <span className="breakdown-label">In Progress</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-count text-success">{stats?.resolvedTickets || 0}</span>
              <span className="breakdown-label">Resolved</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-count text-neutral">{stats?.closedTickets || 0}</span>
              <span className="breakdown-label">Closed</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-count text-danger">{stats?.rejectedTickets || 0}</span>
              <span className="breakdown-label">Rejected</span>
            </div>
          </div>
        </div>

        {/* Visitor Breakdown */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Visitor Status Breakdown</h3>
            <Link to="/visitor-requests" className="panel-link">View All <FaArrowRight size={10} /></Link>
          </div>
          <div className="breakdown-grid">
            <div className="breakdown-item">
              <span className="breakdown-count text-warning">{stats?.pendingVisitors || 0}</span>
              <span className="breakdown-label">Pending</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-count text-success">{stats?.approvedVisitors || 0}</span>
              <span className="breakdown-label">Approved</span>
            </div>
            <div className="breakdown-item">
              <span className="breakdown-count text-danger">{stats?.rejectedVisitors || 0}</span>
              <span className="breakdown-label">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Tables */}
      <div className="dashboard-panels">
        {/* Recent Tickets */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Recent Tickets</h3>
            <Link to="/tickets/new" className="btn btn-sm btn-primary">+ New Ticket</Link>
          </div>
          {recentTickets.length === 0 ? (
            <p className="panel-empty">No tickets yet</p>
          ) : (
            <div className="panel-list">
              {recentTickets.map(t => (
                <Link to={`/tickets/${t.id}`} key={t.id} className="panel-list-item">
                  <div className="panel-list-main">
                    <span className="panel-list-title">{t.category}</span>
                    <span className="panel-list-sub">{t.description?.substring(0, 60)}...</span>
                  </div>
                  <div className="panel-list-badges">
                    {getStatusBadge(t.status)}
                    <span className={`priority-badge priority-${t.priority?.toLowerCase()}`}>{t.priority}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Visitors */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h3>Recent Visitor Requests</h3>
            <Link to="/visitor-requests/new" className="btn btn-sm btn-primary">+ New Request</Link>
          </div>
          {recentVisitors.length === 0 ? (
            <p className="panel-empty">No visitor requests yet</p>
          ) : (
            <div className="panel-list">
              {recentVisitors.map(v => (
                <div key={v.id} className="panel-list-item">
                  <div className="panel-list-main">
                    <span className="panel-list-title">{v.visitorName}</span>
                    <span className="panel-list-sub">{v.purpose}</span>
                  </div>
                  <div className="panel-list-badges">
                    {getStatusBadge(v.status)}
                    <span className="panel-list-date">{v.visitDate}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <Link to="/resources/new" className="quick-action-btn">🏢 Add Resource</Link>
          <Link to="/tickets/new" className="quick-action-btn">🔧 Create Ticket</Link>
          <Link to="/visitor-requests/new" className="quick-action-btn">🎫 New Visitor Request</Link>
          <Link to="/users" className="quick-action-btn">👥 Manage Users</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
