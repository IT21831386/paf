import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createResource, getResourceById, updateResource } from '../../api/services';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import './Facility.css';

function ResourceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    type: 'LECTURE_HALL',
    capacity: 1,
    location: '',
    status: 'ACTIVE',
    description: '',
    availabilityWindows: [''],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      loadResource();
    }
  }, [id]);

  const loadResource = async () => {
    try {
      setLoading(true);
      const response = await getResourceById(id);
      const data = response.data;
      setFormData({
        name: data.name || '',
        type: data.type || 'LECTURE_HALL',
        capacity: data.capacity || 1,
        location: data.location || '',
        status: data.status || 'ACTIVE',
        description: data.description || '',
        availabilityWindows: data.availabilityWindows?.length ? data.availabilityWindows : [''],
      });
    } catch (err) {
      setError('Failed to load resource.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvailabilityChange = (index, value) => {
    const updated = [...formData.availabilityWindows];
    updated[index] = value;
    setFormData(prev => ({ ...prev, availabilityWindows: updated }));
  };

  const addAvailabilitySlot = () => {
    setFormData(prev => ({ ...prev, availabilityWindows: [...prev.availabilityWindows, ''] }));
  };

  const removeAvailabilitySlot = (index) => {
    const updated = formData.availabilityWindows.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, availabilityWindows: updated.length ? updated : [''] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity),
        availabilityWindows: formData.availabilityWindows.filter(w => w.trim() !== ''),
      };

      if (isEdit) {
        await updateResource(id, payload);
      } else {
        await createResource(payload);
      }
      navigate('/resources');
    } catch (err) {
      const message = err.response?.data?.errors
        ? Object.values(err.response.data.errors).join(', ')
        : err.response?.data?.message || 'Failed to save resource.';
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
          <h1 className="page-title">{isEdit ? 'Edit Resource' : 'Add New Resource'}</h1>
          <p className="page-subtitle">{isEdit ? 'Update resource details' : 'Register a new campus facility or asset'}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate('/resources')}>
          <FaArrowLeft /> Back
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Resource Name *</label>
            <input id="name" name="name" type="text" required value={formData.name}
              onChange={handleChange} placeholder="e.g., Lab 101" />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type *</label>
            <select id="type" name="type" value={formData.type} onChange={handleChange}>
              <option value="LECTURE_HALL">Lecture Hall</option>
              <option value="LAB">Lab</option>
              <option value="MEETING_ROOM">Meeting Room</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacity *</label>
            <input id="capacity" name="capacity" type="number" min="1" required
              value={formData.capacity} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location *</label>
            <input id="location" name="location" type="text" required
              value={formData.location} onChange={handleChange} placeholder="e.g., Building A, Floor 2" />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select id="status" name="status" value={formData.status} onChange={handleChange}>
              <option value="ACTIVE">Active</option>
              <option value="OUT_OF_SERVICE">Out of Service</option>
            </select>
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" rows="3"
            value={formData.description} onChange={handleChange}
            placeholder="Additional details about this resource..." />
        </div>

        <div className="form-group full-width">
          <label>Availability Windows</label>
          {formData.availabilityWindows.map((window, index) => (
            <div key={index} className="availability-input-row">
              <input
                type="text"
                value={window}
                onChange={(e) => handleAvailabilityChange(index, e.target.value)}
                placeholder="e.g., Mon-Fri 08:00-17:00"
              />
              {formData.availabilityWindows.length > 1 && (
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeAvailabilitySlot(index)}>✕</button>
              )}
            </div>
          ))}
          <button type="button" className="btn btn-sm btn-ghost" onClick={addAvailabilitySlot}>
            + Add Time Slot
          </button>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/resources')}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : (isEdit ? 'Update Resource' : 'Create Resource')}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ResourceForm;
