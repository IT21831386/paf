import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../../api/services';
import { FaSave, FaArrowLeft, FaPaperclip } from 'react-icons/fa';
import './Ticket.css';

function CreateTicket() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    resourceId: '',
    userId: 'user1', // placeholder until auth
    category: '',
    description: '',
    priority: 'MEDIUM',
    contactDetails: '',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
            <input id="resourceId" name="resourceId" type="text" required
              value={formData.resourceId} onChange={handleChange}
              placeholder="e.g., Lab 101, Building A Corridor" />
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
          <textarea id="description" name="description" rows="4" required
            value={formData.description} onChange={handleChange}
            placeholder="Describe the issue in detail..." />
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
