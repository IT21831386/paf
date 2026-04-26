import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllTickets, getMyTickets, deleteTicket, getAllUsers } from '../../api/services';
import { FaPlus, FaFilter, FaSearch, FaTrash, FaEye, FaUser } from 'react-icons/fa';
import './Ticket.css';

function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [showAssignedToMe, setShowAssignedToMe] = useState(false);
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await getAllUsers();
        const map = {};
        res.data.forEach(u => { map[u.id] = u.name; });
        setUserMap(map);
      } catch {}
    };
    fetchUsers();
  }, []);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let response;
      if (showMyTickets && user) {
        response = await getMyTickets(user.id);
      } else if (showAssignedToMe && user) {
        response = await getAllTickets({ assignedTo: user.id });
      } else {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (filterPriority) params.priority = filterPriority;
        if (filterCategory) params.category = filterCategory;
        response = await getAllTickets(params);
      }
      setTickets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load tickets. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, [showMyTickets, showAssignedToMe]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this ticket and all its comments?')) {
      try {
        await deleteTicket(id);
        setTickets(tickets.filter(t => t.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete ticket.');
      }
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterPriority('');
    setFilterCategory('');
    setTimeout(() => fetchTickets(), 0);
  };

  const getStatusBadge = (status) => {
    const map = {
      OPEN: 'badge badge-info', IN_PROGRESS: 'badge badge-warning',
      RESOLVED: 'badge badge-success', CLOSED: 'badge badge-neutral',
      REJECTED: 'badge badge-danger',
    };
    return <span className={map[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  const getPriorityBadge = (priority) => {
    const map = {
      LOW: 'priority-badge priority-low', MEDIUM: 'priority-badge priority-medium',
      HIGH: 'priority-badge priority-high', CRITICAL: 'priority-badge priority-critical',
    };
    return <span className={map[priority] || 'priority-badge'}>{priority}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance & Incident Tickets</h1>
          <p className="page-subtitle">
            {!loading && !error ? `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found` : 'Track and resolve campus issues'}
          </p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">
          <FaPlus /> New Ticket
        </Link>
      </div>

      <div className="search-bar">
        <button
          type="button"
          className={`btn ${showMyTickets ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => { setShowMyTickets(!showMyTickets); setShowAssignedToMe(false); }}
        >
          <FaUser /> {showMyTickets ? 'My Tickets' : 'All Tickets'}
        </button>
        {isTechnician && (
          <button
            type="button"
            className={`btn ${showAssignedToMe ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setShowAssignedToMe(!showAssignedToMe); setShowMyTickets(false); }}
          >
            <FaUser /> Assigned to Me
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> Filters
        </button>
        <button className="btn btn-primary" onClick={fetchTickets}>
          <FaSearch /> Search
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <input type="text" placeholder="Category..." value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)} className="filter-select" />
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear</button>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading tickets...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && tickets.length === 0 && (
        <div className="empty-state">
          <p>No tickets found.</p>
          <Link to="/tickets/new" className="btn btn-primary"><FaPlus /> Create Ticket</Link>
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="ticket-list">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="ticket-card">
              <div className="ticket-card-header">
                <div className="ticket-meta-left">
                  {getPriorityBadge(ticket.priority)}
                  {getStatusBadge(ticket.status)}
                </div>
                <span className="ticket-id">#{ticket.id?.slice(-6)}</span>
              </div>
              <div className="ticket-card-body">
                <span className="ticket-category">{ticket.category}</span>
                <p className="ticket-desc">{ticket.description}</p>
                <div className="ticket-info-row">
                  <span>📍 {ticket.resourceId}</span>
                  {ticket.assignedTo && <span>👷 Assigned: {userMap[ticket.assignedTo] || ticket.assignedTo}</span>}
                  {ticket.createdAt && <span>📅 {new Date(ticket.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>}
                </div>
                {ticket.attachments && ticket.attachments.length > 0 && (
                  <span className="attachment-count">📎 {ticket.attachments.length} attachment(s)</span>
                )}
              </div>
              <div className="ticket-card-actions">
                <Link to={`/tickets/${ticket.id}`} className="btn btn-sm btn-primary">
                  <FaEye /> View Details
                </Link>
                {(isAdmin || (user && ticket.userId === user.id)) && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(ticket.id)}>
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TicketList;
