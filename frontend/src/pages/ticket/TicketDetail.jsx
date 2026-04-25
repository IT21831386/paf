import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTicketById, updateTicketStatus, assignTicket,
  getComments, addComment, updateComment, deleteComment, getAllUsers
} from '../../api/services';
import { FaArrowLeft, FaPaperPlane, FaEdit, FaTrash, FaUserCog } from 'react-icons/fa';
import './Ticket.css';

function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'ADMIN';
  const isTechnician = user?.role === 'TECHNICIAN';
  const canManage = isAdmin || isTechnician;

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comment form
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  // Status / Assign modals
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [techId, setTechId] = useState('');
  const [technicianList, setTechnicianList] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketRes, commentsRes] = await Promise.all([
        getTicketById(id),
        getComments(id),
      ]);
      setTicket(ticketRes.data);
      setComments(commentsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to load ticket.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // Load technicians for assign dropdown
  const loadTechnicians = async () => {
    try {
      const res = await getAllUsers();
      setTechnicianList(res.data.filter(u => u.role === 'TECHNICIAN' || u.role === 'ADMIN'));
    } catch {}
  };

  // ---- Status ----
  const handleStatusUpdate = async () => {
    try {
      await updateTicketStatus(id, newStatus, statusNotes);
      setShowStatusModal(false);
      setNewStatus('');
      setStatusNotes('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  // ---- Assign ----
  const handleAssign = async () => {
    try {
      await assignTicket(id, techId);
      setShowAssignModal(false);
      setTechId('');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign.');
    }
  };

  // ---- Comments ----
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      await addComment(id, { userId: user.id, userName: user.name, content: newComment });
      setNewComment('');
      const res = await getComments(id);
      setComments(res.data);
    } catch (err) {
      alert('Failed to add comment.');
    }
  };

  const handleEditComment = async (commentId) => {
    try {
      await updateComment(id, commentId, user?.id, editContent);
      setEditingComment(null);
      setEditContent('');
      const res = await getComments(id);
      setComments(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to edit comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(id, commentId, user?.id);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete comment.');
    }
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

  const getNextStatuses = (current) => {
    const transitions = {
      OPEN: ['IN_PROGRESS', 'REJECTED'],
      IN_PROGRESS: ['RESOLVED', 'REJECTED'],
      RESOLVED: ['CLOSED'],
    };
    return transitions[current] || [];
  };

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading ticket...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;
  if (!ticket) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ticket #{ticket.id?.slice(-6)}</h1>
          <p className="page-subtitle">{ticket.category}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/tickets')}>
          <FaArrowLeft /> Back to Tickets
        </button>
      </div>

      {/* Ticket Details */}
      <div className="detail-card">
        <div className="detail-row">
          <div className="detail-badges">
            {getPriorityBadge(ticket.priority)}
            {getStatusBadge(ticket.status)}
          </div>
          <div className="detail-actions-row">
            {canManage && getNextStatuses(ticket.status).length > 0 && (
              <button className="btn btn-sm btn-primary" onClick={() => setShowStatusModal(true)}>
                Update Status
              </button>
            )}
            {canManage && ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED' && (
              <button className="btn btn-sm btn-ghost" onClick={() => { setShowAssignModal(true); loadTechnicians(); }}>
                <FaUserCog /> Assign
              </button>
            )}
          </div>
        </div>

        <div className="detail-body">
          <p className="detail-description">{ticket.description}</p>

          <div className="detail-meta">
            <div><strong>Resource/Location:</strong> {ticket.resourceId}</div>
            <div><strong>Reported by:</strong> {ticket.userId}</div>
            <div><strong>Contact:</strong> {ticket.contactDetails || '—'}</div>
            <div><strong>Assigned to:</strong> {ticket.assignedTo || 'Unassigned'}</div>
            <div><strong>Created:</strong> {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : '—'}</div>
          </div>

          {ticket.resolutionNotes && (
            <div className="resolution-box">
              <strong>Resolution Notes:</strong>
              <p>{ticket.resolutionNotes}</p>
            </div>
          )}

          {ticket.rejectionReason && (
            <div className="rejection-box">
              <strong>Rejection Reason:</strong>
              <p>{ticket.rejectionReason}</p>
            </div>
          )}

          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="attachments-section">
              <strong>Attachments:</strong>
              <div className="attachment-grid">
                {ticket.attachments.map((url, i) => (
                  <a key={i} href={`http://localhost:8080${url}`} target="_blank" rel="noreferrer" className="attachment-thumb">
                    <img src={`http://localhost:8080${url}`} alt={`attachment-${i}`} />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="comments-section">
        <h2 className="section-title">Comments ({comments.length})</h2>

        {comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <div className="comment-header">
              <span className="comment-user">{comment.userName || comment.userId}</span>
              <span className="comment-time">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
              </span>
            </div>

            {editingComment === comment.id ? (
              <div className="comment-edit">
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows="2" />
                <div className="comment-edit-actions">
                  <button className="btn btn-sm btn-primary" onClick={() => handleEditComment(comment.id)}>Save</button>
                  <button className="btn btn-sm btn-ghost" onClick={() => setEditingComment(null)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p className="comment-content">{comment.content}</p>
            )}

            {user && comment.userId === user.id && editingComment !== comment.id && (
              <div className="comment-actions">
                <button className="btn btn-sm btn-ghost" onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}><FaEdit /> Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDeleteComment(comment.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            )}
          </div>
        ))}

        <form className="comment-form" onSubmit={handleAddComment}>
          <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..." rows="2" />
          <button type="submit" className="btn btn-primary" disabled={!newComment.trim()}>
            <FaPaperPlane /> Send
          </button>
        </form>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Update Ticket Status</h3>
            <div className="form-group">
              <label>New Status</label>
              <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="">Select...</option>
                {getNextStatuses(ticket.status).map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            {(newStatus === 'RESOLVED' || newStatus === 'REJECTED') && (
              <div className="form-group">
                <label>{newStatus === 'RESOLVED' ? 'Resolution Notes' : 'Rejection Reason'} *</label>
                <textarea rows="3" value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder={newStatus === 'RESOLVED' ? 'Describe the resolution...' : 'Reason for rejection...'} />
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={!newStatus}>Update</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Assign Technician</h3>
            <div className="form-group">
              <label>Select Technician</label>
              <select value={techId} onChange={(e) => setTechId(e.target.value)}>
                <option value="">Choose...</option>
                {technicianList.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.role})</option>
                ))}
              </select>
              <input type="text" value={techId} onChange={(e) => setTechId(e.target.value)}
                placeholder="Or enter technician ID" style={{ marginTop: '0.5rem' }} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAssignModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={!techId.trim()}>Assign</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetail;
