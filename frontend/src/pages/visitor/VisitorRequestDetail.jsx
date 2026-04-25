import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  getVisitorRequestById, approveVisitorRequest, rejectVisitorRequest,
  checkInVisitorRequest, checkOutVisitorRequest, deleteVisitorRequest
} from '../../api/services';
import { FaArrowLeft, FaCheck, FaTimes, FaSignInAlt, FaSignOutAlt, FaTrash, FaQrcode } from 'react-icons/fa';
import './Visitor.css';

function VisitorRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'ADMIN';
  const isSecurity = user?.role === 'SECURITY';

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const res = await getVisitorRequestById(id);
      setRequest(res.data);
    } catch { setError('Failed to load visitor request'); }
    finally { setLoading(false); }
  };

  const handleApprove = async () => {
    try { await approveVisitorRequest(id); fetchRequest(); }
    catch { alert('Failed to approve'); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { alert('Please provide a reason'); return; }
    try { await rejectVisitorRequest(id, rejectReason); setShowReject(false); fetchRequest(); }
    catch { alert('Failed to reject'); }
  };

  const handleCheckIn = async () => {
    try { await checkInVisitorRequest(id); fetchRequest(); }
    catch { alert('Failed to check in'); }
  };

  const handleCheckOut = async () => {
    try { await checkOutVisitorRequest(id); fetchRequest(); }
    catch { alert('Failed to check out'); }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this visitor request?')) {
      try { await deleteVisitorRequest(id); navigate('/visitor-requests'); }
      catch { alert('Failed to delete'); }
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: 'badge badge-warning', APPROVED: 'badge badge-success',
      REJECTED: 'badge badge-danger', CHECKED_IN: 'badge badge-info',
      CHECKED_OUT: 'badge badge-neutral',
    };
    return <span className={map[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;
  if (!request) return null;

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/visitor-requests" className="btn btn-ghost" style={{ marginBottom: '1rem' }}>
        <FaArrowLeft /> Back to Visitor Requests
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1 className="detail-title">{request.visitorName}</h1>
            <div style={{ marginTop: '0.5rem' }}>{getStatusBadge(request.status)}</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Admin Actions */}
            {isAdmin && request.status === 'PENDING' && (
              <>
                <button className="btn btn-sm btn-primary" onClick={handleApprove}><FaCheck /> Approve</button>
                <button className="btn btn-sm btn-danger" onClick={() => setShowReject(true)}><FaTimes /> Reject</button>
              </>
            )}
            {/* Security Actions */}
            {(isSecurity || isAdmin) && request.status === 'APPROVED' && (
              <button className="btn btn-sm btn-primary" onClick={handleCheckIn}><FaSignInAlt /> Check In</button>
            )}
            {(isSecurity || isAdmin) && request.status === 'CHECKED_IN' && (
              <button className="btn btn-sm btn-primary" onClick={handleCheckOut}><FaSignOutAlt /> Check Out</button>
            )}
            {isAdmin && (
              <button className="btn btn-sm btn-danger" onClick={handleDelete}><FaTrash /> Delete</button>
            )}
          </div>
        </div>

        {/* Reject Modal */}
        {showReject && (
          <div style={{ background: '#16132d', padding: '1rem', borderRadius: '8px', margin: '1rem 0' }}>
            <label style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>Rejection Reason</label>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              rows={3}
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', borderRadius: '6px', background: '#1e1b3a', border: '1px solid #334155', color: '#e2e8f0' }}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-sm btn-danger" onClick={handleReject}>Confirm Reject</button>
              <button className="btn btn-sm btn-ghost" onClick={() => setShowReject(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="detail-body">
          <div className="detail-grid">
            <div className="detail-field">
              <span className="detail-label">NIC / Passport</span>
              <span className="detail-value">{request.nicOrPassport}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Purpose</span>
              <span className="detail-value">{request.purpose}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Visit Date</span>
              <span className="detail-value">{request.visitDate}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Visit Time</span>
              <span className="detail-value">{request.visitTime}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Host Person</span>
              <span className="detail-value">{request.hostPerson}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Department</span>
              <span className="detail-value">{request.hostDepartment}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Location</span>
              <span className="detail-value">{request.location}</span>
            </div>
            <div className="detail-field">
              <span className="detail-label">Number of Visitors</span>
              <span className="detail-value">{request.numberOfVisitors}</span>
            </div>
          </div>

          {request.rejectionReason && (
            <div className="detail-section" style={{ borderLeft: '3px solid #f87171', paddingLeft: '1rem', marginTop: '1rem' }}>
              <h3 style={{ color: '#f87171' }}>Rejection Reason</h3>
              <p style={{ color: '#94a3b8' }}>{request.rejectionReason}</p>
            </div>
          )}

          {request.qrCode && (
            <div className="detail-section" style={{ marginTop: '1rem' }}>
              <h3><FaQrcode /> Digital Pass</h3>
              <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', display: 'inline-block', marginTop: '0.5rem' }}>
                <p style={{ color: '#111', fontFamily: 'monospace', fontSize: '0.85rem' }}>{request.qrCode}</p>
              </div>
            </div>
          )}

          {(request.checkInTime || request.checkOutTime) && (
            <div className="detail-section" style={{ marginTop: '1rem' }}>
              <h3>Visit Log</h3>
              <div className="detail-grid">
                {request.checkInTime && (
                  <div className="detail-field">
                    <span className="detail-label">Check-In</span>
                    <span className="detail-value">{new Date(request.checkInTime).toLocaleString()}</span>
                  </div>
                )}
                {request.checkOutTime && (
                  <div className="detail-field">
                    <span className="detail-label">Check-Out</span>
                    <span className="detail-value">{new Date(request.checkOutTime).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="detail-meta" style={{ marginTop: '1rem' }}>
            {request.createdAt && <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VisitorRequestDetail;
