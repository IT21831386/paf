import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVisitorRequest } from '../../api/services';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import './Visitor.css';

function VisitorRequestForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    visitorName: '',
    nicOrPassport: '',
    hostPerson: '',
    hostDepartment: '',
    purpose: '',
    visitDate: '',
    visitTime: '',
    location: '',
    numberOfVisitors: 1,
    createdBy: 'user1', // placeholder until auth is integrated
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        numberOfVisitors: parseInt(formData.numberOfVisitors),
      };

      await createVisitorRequest(payload);
      navigate('/visitor-requests');
    } catch (err) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(', ')
        : err.response?.data?.message || 'Failed to submit request.';
      setError(message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Visitor Access Request</h1>
          <p className="page-subtitle">Submit a request for visitor or event access</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/visitor-requests')}>
          <FaArrowLeft /> Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="visitorName">Visitor Name *</label>
            <input id="visitorName" name="visitorName" type="text" required
              value={formData.visitorName} onChange={handleChange} placeholder="Full name of visitor" />
          </div>

          <div className="form-group">
            <label htmlFor="nicOrPassport">NIC / Passport No. *</label>
            <input id="nicOrPassport" name="nicOrPassport" type="text" required
              value={formData.nicOrPassport} onChange={handleChange} placeholder="e.g., 200012345678" />
          </div>

          <div className="form-group">
            <label htmlFor="hostPerson">Host Person *</label>
            <input id="hostPerson" name="hostPerson" type="text" required
              value={formData.hostPerson} onChange={handleChange} placeholder="Person being visited" />
          </div>

          <div className="form-group">
            <label htmlFor="hostDepartment">Host Department</label>
            <input id="hostDepartment" name="hostDepartment" type="text"
              value={formData.hostDepartment} onChange={handleChange} placeholder="e.g., Faculty of Computing" />
          </div>

          <div className="form-group">
            <label htmlFor="purpose">Purpose of Visit *</label>
            <input id="purpose" name="purpose" type="text" required
              value={formData.purpose} onChange={handleChange} placeholder="e.g., Guest lecture, Interview" />
          </div>

          <div className="form-group">
            <label htmlFor="visitDate">Visit Date *</label>
            <input id="visitDate" name="visitDate" type="date" required
              value={formData.visitDate} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="visitTime">Visit Time *</label>
            <input id="visitTime" name="visitTime" type="time" required
              value={formData.visitTime} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location / Building *</label>
            <input id="location" name="location" type="text" required
              value={formData.location} onChange={handleChange} placeholder="e.g., Main Building, Block A" />
          </div>

          <div className="form-group">
            <label htmlFor="numberOfVisitors">Number of Visitors *</label>
            <input id="numberOfVisitors" name="numberOfVisitors" type="number" min="1" required
              value={formData.numberOfVisitors} onChange={handleChange} />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/visitor-requests')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FaSave /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VisitorRequestForm;
