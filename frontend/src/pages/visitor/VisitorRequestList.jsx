import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAllVisitorRequests, getMyVisitorRequests, deleteVisitorRequest,
  approveVisitorRequest, rejectVisitorRequest,
  checkInVisitorRequest, checkOutVisitorRequest
} from '../../api/services';
import { FaPlus, FaSearch, FaFilter, FaCheck, FaTimes, FaSignInAlt, FaSignOutAlt, FaTrash, FaUser, FaEye } from 'react-icons/fa';
import './Visitor.css';

function VisitorRequestList() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'ADMIN';
  const isSecurity = user?.role === 'SECURITY';

  const fetchRequests = async () => {
    try {
      setLoading(true);
      let response;
      if (showMyRequests && user) {
        response = await getMyVisitorRequests(user.id);
      } else {
        const params = {};
        if (filterStatus) params.status = filterStatus;
        if (filterDepartment) params.department = filterDepartment;
        response = await getAllVisitorRequests(params);
      }
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load visitor requests.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [showMyRequests]);

  const handleApprove = async (id) => {
    if (window.confirm('Approve this visitor request?')) {
      try { await approveVisitorRequest(id); fetchRequests(); }
      catch { alert('Failed to approve'); }
    }
  };

  const handleRejectSubmit = async () => {
    try {
      await rejectVisitorRequest(rejectId, rejectReason);
      setRejectId(null);
      setRejectReason('');
      fetchRequests();
    } catch { alert('Failed to reject'); }
  };

  const handleCheckIn = async (id) => {
    try { await checkInVisitorRequest(id); fetchRequests(); }
    catch { alert('Failed to check in'); }
  };

  const handleCheckOut = async (id) => {
    try { await checkOutVisitorRequest(id); fetchRequests(); }
    catch { alert('Failed to check out'); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this visitor request?')) {
      try { await deleteVisitorRequest(id); setRequests(requests.filter(r => r.id !== id)); }
      catch { alert('Failed to delete'); }
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterDepartment('');
    setTimeout(() => fetchRequests(), 0);
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: 'badge badge-warning', APPROVED: 'badge badge-success',
      REJECTED: 'badge badge-danger', CHECKED_IN: 'badge badge-info',
      CHECKED_OUT: 'badge badge-neutral',
    };
    return <span className={map[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visitor & Event Access</h1>
          <p className="page-subtitle">
            {!loading && !error ? `${requests.length} request${requests.length !== 1 ? 's' : ''} found` : 'Manage visitor access requests and digital passes'}
          </p>
        </div>
        <Link to="/visitor-requests/new" className="btn btn-primary">
          <FaPlus /> New Request
        </Link>
      </div>

      <div className="search-bar">
        <button
          type="button"
          className={`btn ${showMyRequests ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setShowMyRequests(!showMyRequests)}
        >
          <FaUser /> {showMyRequests ? 'My Requests' : 'All Requests'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> Filters
        </button>
        <button className="btn btn-primary" onClick={fetchRequests}>
          <FaSearch /> Search
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
          </select>
          <input type="text" placeholder="Department..." value={filterDepartment}
            onChange={e => setFilterDepartment(e.target.value)} className="filter-select" />
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear</button>
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="modal-overlay" onClick={() => setRejectId(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Reject Visitor Request</h3>
            <div className="form-group">
              <label>Reason for rejection</label>
              <textarea rows="3" value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Enter reason..." />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setRejectId(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleRejectSubmit} disabled={!rejectReason.trim()}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && requests.length === 0 && (
        <div className="empty-state">
          <p>No visitor requests found.</p>
          <Link to="/visitor-requests/new" className="btn btn-primary"><FaPlus /> Create Request</Link>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="visitor-list">
          {requests.map(r => (
            <div key={r.id} className="visitor-card" onClick={() => navigate(`/visitor-requests/${r.id}`)} style={{ cursor: 'pointer' }}>
              <div className="visitor-card-header">
                <h3>{r.visitorName}</h3>
                {getStatusBadge(r.status)}
              </div>
              <div className="visitor-card-body">
                <div className="visitor-info">
                  <span>📋 {r.purpose}</span>
                  <span>👤 Host: {r.hostPerson}</span>
                  <span>📅 {r.visitDate} at {r.visitTime}</span>
                  <span>📍 {r.location}</span>
                  <span>👥 {r.numberOfVisitors} visitor(s)</span>
                </div>
              </div>
              <div className="visitor-card-actions" onClick={e => e.stopPropagation()}>
                <Link to={`/visitor-requests/${r.id}`} className="btn btn-sm btn-primary" onClick={e => e.stopPropagation()}>
                  <FaEye /> Detail
                </Link>
                {/* Admin-only approve/reject */}
                {isAdmin && r.status === 'PENDING' && (
                  <>
                    <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); handleApprove(r.id); }}><FaCheck /> Approve</button>
                    <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); setRejectId(r.id); }}><FaTimes /> Reject</button>
                  </>
                )}
                {/* Security/Admin check-in/out */}
                {(isSecurity || isAdmin) && r.status === 'APPROVED' && (
                  <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); handleCheckIn(r.id); }}><FaSignInAlt /> In</button>
                )}
                {(isSecurity || isAdmin) && r.status === 'CHECKED_IN' && (
                  <button className="btn btn-sm btn-primary" onClick={(e) => { e.stopPropagation(); handleCheckOut(r.id); }}><FaSignOutAlt /> Out</button>
                )}
                {/* Delete for admin or own request */}
                {(isAdmin || (user && r.createdBy === user.id)) && (
                  <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}><FaTrash /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VisitorRequestList;
