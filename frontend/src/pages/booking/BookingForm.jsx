import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { createBooking, updateBooking, getBookingById, getAllResources } from '../../api/services';
import CustomDatePicker from './CustomDatePicker';
import CustomTimePicker from './CustomTimePicker';
import './Booking.css';

const INITIAL_FORM = {
  resourceId: '',
  roomName: '',
  date: '',
  returnDate: '', // Added for equipment
  startTime: '',
  endTime: '',
  purpose: '',
  attendees: '',
  notes: '',
};

const RESOURCE_TYPES = [
  { id: 'LECTURE_HALL', label: 'Lecture Halls', icon: '🏫' },
  { id: 'LAB', label: 'Labs', icon: '🧪' },
  { id: 'MEETING_ROOM', label: 'Meeting Rooms', icon: '🏢' },
  { id: 'EQUIPMENT', label: 'Equipment (Projector, Camera, etc.)', icon: '📷' },
];

function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [selectedType, setSelectedType] = useState('MEETING_ROOM');
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAllEquipment, setShowAllEquipment] = useState(false);

  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      try {
        const res = await getAllResources({ type: selectedType });
        setRooms(res.data.filter((r) => r.status === 'ACTIVE'));
      } catch {
        setError(`Could not load resources for ${selectedType}. Make sure the backend is running.`);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, [selectedType]);

  useEffect(() => {
    if (!isEdit) return;
    const loadBooking = async () => {
      try {
        const res = await getBookingById(id);
        const b = res.data;
        setForm({
          resourceId: b.resourceId || '',
          roomName: b.roomName || '',
          date: b.date || '',
          returnDate: b.returnDate || b.date || '',
          startTime: b.startTime || '',
          endTime: b.endTime || '',
          purpose: b.purpose || '',
          attendees: b.attendees || '',
          notes: b.notes || '',
        });
      } catch {
        setError('Could not load booking details.');
      }
    };
    loadBooking();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSelect = (room) => {
    setForm((prev) => ({ ...prev, resourceId: room.id, roomName: room.name }));
  };

  const selectedResource = rooms.find(r => r.id === form.resourceId);

  const handleAttendeesChange = (e) => {
    const val = parseInt(e.target.value, 10);
    const max = selectedResource?.capacity || 9999;
    
    if (val > max) {
      setForm(prev => ({ ...prev, attendees: max }));
    } else {
      setForm(prev => ({ ...prev, attendees: e.target.value }));
    }
  };

  const handleStartTimeChange = (val) => {
    setForm(prev => {
      const newForm = { ...prev, startTime: val };
      
      // Auto-set end time to start time + 1 hour
      const [h, m] = val.split(':').map(n => parseInt(n, 10));
      const endHour = (h + 1) % 24;
      const formattedEndHour = endHour.toString().padStart(2, '0');
      const formattedMin = m.toString().padStart(2, '0');
      
      newForm.endTime = `${formattedEndHour}:${formattedMin}`;
      return newForm;
    });
  };

  const handleTypeChange = (typeId) => {
    setSelectedType(typeId);
    setForm((prev) => ({ ...prev, resourceId: '', roomName: '' }));
    setShowAllEquipment(false); // Reset toggle when type changes
  };

  const getAvailableUnits = (room) => {
    if (!room) return 0;
    if (selectedType !== 'EQUIPMENT') return room.capacity || 0;
    if (room.name === 'Projector Set A') return 3;
    if (room.name === 'Projector Set B') return 5;
    return room.capacity || 0;
  };

  const validate = () => {
    if (!form.resourceId) return 'Please select a resource.';
    if (!form.date) return 'Please select a date.';
    if (selectedType === 'EQUIPMENT' && !form.returnDate) return 'Please select a return date.';
    if (!form.startTime) return 'Please set a start time.';
    if (!form.endTime) return 'Please set an end time.';
    if (form.startTime >= form.endTime) return 'End time must be after start time.';
    if (!form.purpose.trim()) return 'Please enter a purpose for the meeting.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    const payload = {
      ...form,
      attendees: form.attendees ? parseInt(form.attendees, 10) : null,
      bookedBy: user?.id || null,
      bookedByName: user?.name || null,
      status: 'PENDING',
    };

    try {
      if (isEdit) {
        await updateBooking(id, payload);
      } else {
        await createBooking(payload);
      }
      navigate('/bookings');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="booking-container">
      <div className="booking-header">
        <div>
          <h1 className="booking-title">
            <FaCalendarAlt style={{ marginRight: '0.5rem', color: '#a78bfa' }} />
            {isEdit ? 'Edit Booking' : 'New Booking'}
          </h1>
          <p className="booking-subtitle">
            {isEdit ? 'Update your resource reservation' : 'Reserve a resource for your campus needs'}
          </p>
        </div>
        <Link to="/bookings" className="bk-btn bk-btn-ghost">
          <FaArrowLeft /> Back
        </Link>
      </div>

      {error && <div className="bk-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Resource Selection */}
        <div className="booking-form-card" style={{ marginBottom: '1.25rem' }}>
          <div className="booking-detail-section-title">Select Resource Type</div>

          <div className="booking-tabs" style={{ marginBottom: '1.5rem' }}>
            {RESOURCE_TYPES.map((type) => (
              <button
                key={type.id}
                type="button"
                className={`booking-tab ${selectedType === type.id ? 'active' : ''}`}
                onClick={() => handleTypeChange(type.id)}
              >
                <span style={{ marginRight: '0.4rem' }}>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>

          <div className="booking-detail-section-title">Select {RESOURCE_TYPES.find(t => t.id === selectedType)?.label.slice(0, -1)}</div>

          {loadingRooms && <div className="bk-loading" style={{ padding: '1.5rem 0' }}>Loading resources...</div>}

          {!loadingRooms && rooms.length === 0 && (
            <div className="bk-error">
              No active {selectedType.toLowerCase().replace('_', ' ')}s found. Please add them in the Facilities section first.
            </div>
          )}

          {!loadingRooms && rooms.length > 0 && (
            <div className="equipment-selector-container">
              <div className="room-selector-grid">
                {rooms
                  .filter((room) => {
                    if (selectedType !== 'EQUIPMENT' || showAllEquipment) return true;
                    const name = room.name.toLowerCase();
                    return name.includes('projector') || 
                           name.includes('microphone') || 
                           name.includes('laptop') || 
                           name.includes('macbook');
                  })
                  .map((room) => (
                    <div
                      key={room.id}
                      className={`room-option-card ${form.resourceId === room.id ? 'selected' : ''}`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="room-option-name">{RESOURCE_TYPES.find(t => t.id === selectedType)?.icon} {room.name}</div>
                      <div className="room-option-meta">
                        <div style={{ marginBottom: '2px' }}>📍 {room.location || '—'}</div>
                        {selectedType === 'EQUIPMENT' ? (
                          <div className="equipment-meta-details">
                            <div className="equipment-meta-item">
                              📦 Available: {room.name === 'Projector Set A' ? '3' : (room.name === 'Projector Set B' ? '5' : room.capacity)} units
                            </div>
                          </div>
                        ) : (
                          <div className="equipment-meta-item">👥 Capacity: {room.capacity || '—'} people</div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              
              {selectedType === 'EQUIPMENT' && !showAllEquipment && rooms.some(r => {
                const name = r.name.toLowerCase();
                return !name.includes('projector') && 
                       !name.includes('microphone') && 
                       !name.includes('laptop') && 
                       !name.includes('macbook');
              }) && (
                <button 
                  type="button" 
                  className="show-more-equipment-btn"
                  onClick={() => setShowAllEquipment(true)}
                >
                  More Equipment
                </button>
              )}
            </div>
          )}

          {/* Resource Specifications Section */}
          {selectedResource && (
            <div className="resource-specs-card">
              <div className="booking-detail-section-title">Equipment Specifications</div>
              <div className="specs-grid">
                {selectedResource.name === 'Projector Set A' ? (
                  <>
                    <div className="spec-item">
                      <span className="spec-label">Resolution</span>
                      <span className="spec-value">1080p / 4K Support</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Connectivity</span>
                      <span className="spec-value">HDMI, VGA, USB-C</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Included Accessories</span>
                      <span className="spec-value">Remote Control, Power Cable, HDMI Cable</span>
                    </div>
                  </>
                ) : selectedResource.name === 'Projector Set B' ? (
                  <>
                    <div className="spec-item">
                      <span className="spec-label">Resolution</span>
                      <span className="spec-value">4K Native / Ultra HDR</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Connectivity</span>
                      <span className="spec-value">Wireless (AirPlay/Miracast), HDMI 2.1</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Included Accessories</span>
                      <span className="spec-value">Laser Pointer, Tripod, Carry Case</span>
                    </div>
                  </>
                ) : (
                  <div className="spec-item full-width">
                    <span className="spec-label">Description & Features</span>
                    <span className="spec-value">{selectedResource.description || 'Standard campus facility with standard amenities.'}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="booking-form-card">
          <div className="booking-detail-section-title">Booking Details</div>

          <div className="booking-form-grid">
            <div className="booking-form-group">
              <CustomDatePicker
                label={selectedType === 'EQUIPMENT' ? "Need Date *" : "Date *"}
                selectedDate={form.date}
                onChange={(val) => setForm(prev => ({ 
                  ...prev, 
                  date: val, 
                  returnDate: (prev.returnDate && prev.returnDate < val) ? val : (prev.returnDate || val) 
                }))}
              />
            </div>

            {selectedType === 'EQUIPMENT' ? (
              <div className="booking-form-group">
                <CustomDatePicker
                  label="Return Date *"
                  selectedDate={form.returnDate}
                  onChange={(val) => setForm(prev => ({ ...prev, returnDate: val }))}
                  minDate={form.date}
                />
              </div>
            ) : (
              <div className="booking-form-group">
                <label className="booking-form-label">Number of Attendees</label>
                {selectedResource?.capacity && selectedResource.capacity <= 50 ? (
                  <div className="attendees-selector-container">
                    <select 
                      name="attendees"
                      value={form.attendees}
                      onChange={handleAttendeesChange}
                      className="booking-form-select"
                    >
                      <option value="">Select Attendees</option>
                      {(() => {
                        const options = [];
                        for (let i = 5; i <= selectedResource.capacity; i += 5) {
                          options.push(i);
                        }
                        if (selectedResource.capacity % 5 !== 0) {
                          options.push(selectedResource.capacity);
                        }
                        return options.map(num => (
                          <option key={num} value={num}>{num}</option>
                        ));
                      })()}
                    </select>
                  </div>
                ) : (
                  <input
                    type="number"
                    name="attendees"
                    value={form.attendees}
                    onChange={handleAttendeesChange}
                    min="1"
                    max={selectedResource?.capacity || ''}
                    placeholder={selectedResource?.capacity ? `Max: ${selectedResource.capacity}` : 'e.g. 10'}
                    className="booking-form-input"
                  />
                )}
              </div>
            )}

            <div className="booking-form-group">
              <CustomTimePicker
                label={selectedType === 'EQUIPMENT' ? "Need Time *" : "Start Time *"}
                selectedTime={form.startTime}
                onChange={handleStartTimeChange}
              />
            </div>

            <div className="booking-form-group">
              <CustomTimePicker
                label={selectedType === 'EQUIPMENT' ? "Return Time *" : "End Time *"}
                selectedTime={form.endTime}
                onChange={(val) => setForm(prev => ({ ...prev, endTime: val }))}
                startTime={form.startTime}
              />
            </div>

            {selectedType === 'EQUIPMENT' && (
              <div className="booking-form-group">
                <label className="booking-form-label">Quantity Needed *</label>
                {(() => {
                  const maxUnits = getAvailableUnits(selectedResource);
                  if (maxUnits <= 20) {
                    return (
                      <div className="attendees-selector-container">
                        <select 
                          name="attendees"
                          value={form.attendees}
                          onChange={handleAttendeesChange}
                          className="booking-form-select"
                        >
                          <option value="">Select Quantity</option>
                          {Array.from({ length: maxUnits }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                    );
                  }
                  return (
                    <div className="attendees-selector-container">
                      <select 
                        name="attendees"
                        value={form.attendees}
                        onChange={handleAttendeesChange}
                        className="booking-form-select"
                      >
                        <option value="">Select Quantity</option>
                        {(() => {
                          const options = [];
                          for (let i = 1; i <= maxUnits; i++) {
                            if (maxUnits > 10 && i % 5 !== 0 && i !== 1 && i !== maxUnits) continue;
                            options.push(i);
                          }
                          return options.map(num => (
                            <option key={num} value={num}>{num}</option>
                          ));
                        })()}
                      </select>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="booking-form-group full-width">
              <label className="booking-form-label">Purpose *</label>
              <input
                type="text"
                name="purpose"
                value={form.purpose}
                onChange={handleChange}
                placeholder="e.g. Sprint Planning, Client Meeting..."
                className="booking-form-input"
                required
              />
            </div>

            <div className="booking-form-group full-width">
              <label className="booking-form-label">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any additional requirements or notes..."
                className="booking-form-textarea"
                rows={3}
              />
              <span className="booking-form-hint">Optional — equipment needs, setup instructions, etc.</span>
            </div>
          </div>

          <div className="booking-form-actions">
            <button type="submit" className="bk-btn bk-btn-primary" disabled={submitting || loadingRooms}>
              {submitting ? 'Saving...' : isEdit ? 'Update Booking' : 'Confirm Booking'}
            </button>
            <Link to="/bookings" className="bk-btn bk-btn-ghost">Cancel</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default BookingForm;
