import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, getAllResources } from '../../api/services';
import { FaSave, FaArrowLeft, FaPaperclip } from 'react-icons/fa';
import './Ticket.css';

function CreateTicket() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [resources, setResources] = useState([]);
  const [formData, setFormData] = useState({
    resourceId: '',
    customLocation: '',
    userId: user?.id || '',
    category: '',
    description: '',
    priority: 'MEDIUM',
    contactDetails: user?.email || '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await getAllResources();
        setResources(res.data);
      } catch {}
    };
    fetchResources();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 3) {
      setError('Maximum 3 attachments allowed');
      return;
    }
    setFiles(selectedFiles);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const data = new FormData();
      data.append('resourceId', formData.resourceId);
      data.append('userId', formData.userId);
      data.append('category', formData.category);
      data.append('description', formData.description);
      data.append('priority', formData.priority);
      if (formData.contactDetails) {
        data.append('contactDetails', formData.contactDetails);
      }
      files.forEach(file => data.append('files', file));

      await createTicket(data);
      navigate('/tickets');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to create ticket.';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Electrical', 'Plumbing', 'IT / Network', 'Furniture', 'HVAC / AC', 'Cleaning', 'Safety', 'Other'];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Report an Incident</h1>
          <p className="page-subtitle">Submit a maintenance or incident ticket</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/tickets')}>
          <FaArrowLeft /> Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="resourceId">Resource / Location *</label>
            <select id="resourceId" name="resourceId" required value={formData.resourceId} onChange={handleChange}>
              <option value="">Select a resource or location</option>
              {resources.map(r => (
                <option key={r.id} value={r.name}>{r.name} — {r.location}</option>
              ))}
              <option value="__custom">Other (type below)</option>
            </select>
            {formData.resourceId === '__custom' && (
              <input type="text" name="customLocation" placeholder="Type custom location..."
                value={formData.customLocation} onChange={handleChange} style={{ marginTop: '0.5rem' }} required />
            )}
          </div>

          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select id="category" name="category" required value={formData.category} onChange={handleChange}>
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority *</label>
            <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
              <option value="LOW">🟢 Low</option>
              <option value="MEDIUM">🟡 Medium</option>
              <option value="HIGH">🟠 High</option>
              <option value="CRITICAL">🔴 Critical</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="contactDetails">Contact Details</label>
            <input id="contactDetails" name="contactDetails" type="text"
              value={formData.contactDetails} onChange={handleChange}
              placeholder="Phone or email for follow-up" />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description *</label>
          <textarea id="description" name="description" rows="4" required minLength={10}
            value={formData.description} onChange={handleChange}
            placeholder="Describe the issue in detail (min 10 characters)..." />
        </div>

        <div className="form-group full-width">
          <label><FaPaperclip /> Attachments (max 3 images)</label>
          <input type="file" accept="image/*" multiple onChange={handleFileChange}
            className="file-input" />
          {files.length > 0 && (
            <div className="file-preview">
              {files.map((file, i) => (
                <span key={i} className="file-tag">{file.name}</span>
              ))}
            </div>
          )}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/tickets')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FaSave /> {loading ? 'Submitting...' : 'Submit Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTicket;
