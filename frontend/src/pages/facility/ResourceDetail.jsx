import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getResourceById, deleteResource } from '../../api/services';
import { FaEdit, FaTrash, FaArrowLeft, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import './Facility.css';

function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getResourceById(id);
        setResource(res.data);
      } catch (err) {
        setError('Failed to load resource');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Delete "${resource.name}"? This action cannot be undone.`)) {
      try {
        await deleteResource(id);
        navigate('/resources');
      } catch { alert('Failed to delete'); }
    }
  };

  const getStatusBadge = (status) => {
    const classes = { ACTIVE: 'badge badge-success', OUT_OF_SERVICE: 'badge badge-danger' };
    return <span className={classes[status] || 'badge'}>{status?.replace('_', ' ')}</span>;
  };

  const getTypeBadge = (type) => {
    const labels = {
      LECTURE_HALL: '🏫 Lecture Hall', LAB: '🔬 Lab',
      MEETING_ROOM: '🤝 Meeting Room', EQUIPMENT: '📷 Equipment',
    };
    return <span className="badge badge-type">{labels[type] || type}</span>;
  };

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading resource...</div></div>;
  if (error) return <div className="page-container"><div className="error-message">{error}</div></div>;
  if (!resource) return null;

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/resources" className="btn btn-ghost" style={{ marginBottom: '1rem' }}>
        <FaArrowLeft /> Back to Resources
      </Link>

      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1 className="detail-title">{resource.name}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
              {getTypeBadge(resource.type)}
              {getStatusBadge(resource.status)}
            </div>
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to={`/resources/edit/${resource.id}`} className="btn btn-sm btn-ghost"><FaEdit /> Edit</Link>
              <button className="btn btn-sm btn-danger" onClick={handleDelete}><FaTrash /> Delete</button>
            </div>
          )}
        </div>

        <div className="detail-body">
          <div className="detail-row">
            <FaMapMarkerAlt className="detail-icon" />
            <div>
              <span className="detail-label">Location</span>
              <span className="detail-value">{resource.location}</span>
            </div>
          </div>
          <div className="detail-row">
            <FaUsers className="detail-icon" />
            <div>
              <span className="detail-label">Capacity</span>
              <span className="detail-value">{resource.capacity} people</span>
            </div>
          </div>
          {resource.description && (
            <div className="detail-section">
              <h3>Description</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>{resource.description}</p>
            </div>
          )}
          {resource.availabilityWindows && resource.availabilityWindows.length > 0 && (
            <div className="detail-section">
              <h3>Availability Windows</h3>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {resource.availabilityWindows.map((w, i) => (
                  <span key={i} className="availability-tag">{w}</span>
                ))}
              </div>
            </div>
          )}
          {resource.createdAt && (
            <div className="detail-meta">
              <span>Created: {new Date(resource.createdAt).toLocaleDateString()}</span>
              {resource.updatedAt && <span>Updated: {new Date(resource.updatedAt).toLocaleDateString()}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourceDetail;
