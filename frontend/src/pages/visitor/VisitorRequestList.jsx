import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllVisitorRequests, deleteVisitorRequest,
  approveVisitorRequest, rejectVisitorRequest,
  checkInVisitorRequest, checkOutVisitorRequest
} from '../../api/services';
import { FaPlus, FaSearch, FaFilter, FaCheck, FaTimes, FaSignInAlt, FaSignOutAlt, FaTrash, FaQrcode } from 'react-icons/fa';
import './Visitor.css';

function VisitorRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterHost, setFilterHost] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [rejectModal, setRejectModal] = useState({ open: false, id: null });
  const [rejectReason, setRejectReason] = useState('');
  const [qrModal, setQrModal] = useState({ open: false, request: null });

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (filterLocation) params.location = filterLocation;
      if (filterHost) params.host = filterHost;
      if (filterDate) params.date = filterDate;

      const response = await getAllVisitorRequests(params);
      setRequests(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load visitor requests. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    if (window.confirm('Approve this visitor request?')) {
      try {
        await approveVisitorRequest(id);
        fetchRequests();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to approve request.');
      }
    }
  };

  const handleRejectSubmit = async () => {
    try {
      await rejectVisitorRequest(rejectModal.id, rejectReason);
      setRejectModal({ open: false, id: null });
      setRejectReason('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await checkInVisitorRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check in.');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await checkOutVisitorRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to check out.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this visitor request?')) {
      try {
        await deleteVisitorRequest(id);
        setRequests(requests.filter(r => r.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete request.');
      }
    }
  };

  const clearFilters = () => {
    setFilterStatus('');
    setFilterLocation('');
    setFilterHost('');
    setFilterDate('');
    setTimeout(() => fetchRequests(), 0);
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: 'badge badge-warning',
      APPROVED: 'badge badge-success',
      REJECTED: 'badge badge-danger',
      CHECKED_IN: 'badge badge-info',
      CHECKED_OUT: 'badge badge-neutral',
    };
    return <span className={map[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Visitor & Event Access</h1>
          <p className="page-subtitle">Manage visitor access requests and digital passes</p>
        </div>
        <Link to="/visitor-requests/new" className="btn btn-primary">
          <FaPlus /> New Request
        </Link>
      </div>

      <div className="search-bar">
        <button type="button" className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> Filters
        </button>
        <button className="btn btn-primary" onClick={fetchRequests}>
          <FaSearch /> Search
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CHECKED_IN">Checked In</option>
            <option value="CHECKED_OUT">Checked Out</option>
          </select>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="filter-select" />
          <input type="text" placeholder="Location..." value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)} className="filter-select" />
          <input type="text" placeholder="Host person..." value={filterHost}
            onChange={(e) => setFilterHost(e.target.value)} className="filter-select" />
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear</button>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading requests...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && requests.length === 0 && (
        <div className="empty-state">
          <p>No visitor requests found.</p>
          <Link to="/visitor-requests/new" className="btn btn-primary"><FaPlus /> Create Request</Link>
        </div>
      )}

      {!loading && !error && requests.length > 0 && (
        <div className="visitor-table-wrapper">
          <table className="visitor-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>NIC / Passport</th>
                <th>Host</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Count</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id}>
                  <td className="cell-bold">{req.visitorName}</td>
                  <td>{req.nicOrPassport}</td>
                  <td>
                    {req.hostPerson}
                    {req.hostDepartment && <span className="cell-sub">{req.hostDepartment}</span>}
                  </td>
                  <td>{req.visitDate} {req.visitTime}</td>
                  <td>{req.location}</td>
                  <td>{req.numberOfVisitors}</td>
                  <td>{getStatusBadge(req.status)}</td>
                  <td>
                    <div className="action-buttons">
                      {req.status === 'PENDING' && (
                        <>
                          <button className="btn btn-sm btn-success" onClick={() => handleApprove(req.id)} title="Approve">
                            <FaCheck />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => setRejectModal({ open: true, id: req.id })} title="Reject">
                            <FaTimes />
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDelete(req.id)} title="Delete">
                            <FaTrash />
                          </button>
                        </>
                      )}
                      {req.status === 'APPROVED' && (
                        <>
                          <button className="btn btn-sm btn-info" onClick={() => handleCheckIn(req.id)} title="Check In">
                            <FaSignInAlt />
                          </button>
                          <button className="btn btn-sm btn-ghost" onClick={() => setQrModal({ open: true, request: req })} title="View QR">
                            <FaQrcode />
                          </button>
                        </>
                      )}
                      {req.status === 'CHECKED_IN' && (
                        <button className="btn btn-sm btn-warning" onClick={() => handleCheckOut(req.id)} title="Check Out">
                          <FaSignOutAlt />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.open && (
        <div className="modal-overlay" onClick={() => setRejectModal({ open: false, id: null })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reject Visitor Request</h3>
            <div className="form-group">
              <label>Reason for rejection *</label>
              <textarea rows="3" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter the reason..." />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setRejectModal({ open: false, id: null }); setRejectReason(''); }}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleRejectSubmit} disabled={!rejectReason.trim()}>
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModal.open && (
        <div className="modal-overlay" onClick={() => setQrModal({ open: false, request: null })}>
          <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Digital Visitor Pass</h3>
            <div className="qr-pass">
              <div className="qr-placeholder">
                <FaQrcode size={80} />
                <p className="qr-code-text">{qrModal.request?.qrCode}</p>
              </div>
              <div className="pass-details">
                <p><strong>Visitor:</strong> {qrModal.request?.visitorName}</p>
                <p><strong>NIC/Passport:</strong> {qrModal.request?.nicOrPassport}</p>
                <p><strong>Host:</strong> {qrModal.request?.hostPerson}</p>
                <p><strong>Date:</strong> {qrModal.request?.visitDate}</p>
                <p><strong>Location:</strong> {qrModal.request?.location}</p>
                <p><strong>Visitors:</strong> {qrModal.request?.numberOfVisitors}</p>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setQrModal({ open: false, request: null })}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisitorRequestList;
