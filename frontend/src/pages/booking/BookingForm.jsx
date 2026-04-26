import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkedAlt, FaThLarge, FaCheckCircle, FaMapMarkerAlt, FaUsers, FaBox, FaCubes, FaTools } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { createBooking, updateBooking, getBookingById, getAllResources } from '../../api/services';
import CustomDatePicker from './CustomDatePicker';
import CustomTimePicker from './CustomTimePicker';
import CampusMap from '../../components/CampusMap';
import IndoorMap from '../../components/IndoorMap';



import './Booking.css';

const INITIAL_FORM = {
  resourceId: '',
  roomName: '',
  date: '',
  returnDate: '',
  startTime: '',
  endTime: '',
  purpose: '',
  attendees: '',
  notes: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

const RESOURCE_TYPES = [
  { id: 'LECTURE_HALL', label: 'Lecture Halls', icon: '🏫' },
  { id: 'LAB', label: 'Labs', icon: '🧪' },
  { id: 'MEETING_ROOM', label: 'Meeting Rooms', icon: '🏢' },
  { id: 'EQUIPMENT', label: 'Equipment (Projector, Camera, etc.)', icon: '📷' },
];

const ALLOWED_ROOMS = [
  'Lecture Hall A1', 'Lecture Hall A2', 'Lecture Hall B1', 'Lecture Hall B2',
  'Computer Lab 101', 'Chemistry Lab 201', 'Electronics Lab 102', 'Research Lab 202',
  'Conference Room B2', 'Seminar Room C1', 'Boardroom D4', 'Innovation Studio E2'
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
  const [showMap, setShowMap] = useState(false);
  const [mapType, setMapType] = useState('CAMPUS'); // 'CAMPUS' or 'INDOOR'

  useEffect(() => {
    const loadRooms = async () => {
      setLoadingRooms(true);
      setError(null);
      try {
        const res = await getAllResources({ type: selectedType });
        const data = Array.isArray(res.data) ? res.data : [];
        const seenNames = new Set();
        setRooms(data.filter((r) => {
          if (r.status !== 'ACTIVE') return false;
          if (selectedType === 'EQUIPMENT') return true; 
          if (ALLOWED_ROOMS.includes(r.name) && !seenNames.has(r.name)) {
            seenNames.add(r.name);
            return true;
          }
          return false;
        }));

        // Auto-fill user info disabled as per request
      } catch (err) {
        console.error('Load rooms error:', err);
        setError(`Could not load resources. ${err.response?.data?.message || 'Please check if the backend is running.'}`);
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, [selectedType, isEdit]);

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
          firstName: b.firstName || '',
          lastName: b.lastName || '',
          email: b.email || '',
          phone: b.phone || '',
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

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Keep only numbers
    if (value.length <= 10) {
      setForm(prev => ({ ...prev, phone: value }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    // If user typed '@' and it's the only '@' in the string
    if (value.endsWith('@') && (value.match(/@/g) || []).length === 1) {
      setForm(prev => ({ ...prev, email: value + 'gmail.com' }));
    } else {
      setForm(prev => ({ ...prev, email: value }));
    }
  };

  const handleRoomSelect = (room) => {
    setForm((prev) => ({ ...prev, resourceId: room.id, roomName: room.name }));
    toast.success(`Selected: ${room.name}`, {
      id: 'selection-toast', // Prevent duplicate toasts
      icon: '✅',
    });
    // Auto scroll to personal info section
    setTimeout(() => {
      const personalSection = document.getElementById('personal-info-section');
      if (personalSection) {
        personalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const selectedResource = (rooms || []).find(r => String(r.id) === String(form.resourceId)) || (form.resourceId ? { id: form.resourceId, name: form.roomName } : null);

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
    // Use availableUnits if provided, otherwise fallback to capacity
    return room.availableUnits != null ? room.availableUnits : (room.capacity || 0);
  };

  const validate = () => {
    if (!form.resourceId) return 'Please select a resource.';
    if (!form.date) return 'Please select a date.';
    if (selectedType === 'EQUIPMENT' && !form.returnDate) return 'Please select a return date.';
    if (!form.startTime) return 'Please set a start time.';
    if (!form.endTime) return 'Please set an end time.';
    if (form.startTime >= form.endTime) return 'End time must be after start time.';
    if (!form.purpose.trim()) return 'Please enter a purpose for the meeting.';
    if (!form.firstName.trim()) return 'Please enter your first name.';
    if (!form.lastName.trim()) return 'Please enter your last name.';
    if (!form.email.trim()) return 'Please enter your email.';
    if (!form.phone.trim()) return 'Please enter your phone number.';
    if (form.phone.length !== 10) return 'Phone number must be exactly 10 digits.';
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
        toast.success('Booking updated successfully!');
      } else {
        await createBooking(payload);
        toast.success('Booking created successfully! Check your list.');
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="booking-detail-section-title" style={{ margin: 0 }}>
              Select {RESOURCE_TYPES.find(t => t.id === selectedType)?.label.slice(0, -1)}
            </div>
            {form.resourceId && (
              <div className="selected-resource-banner">
                <FaCheckCircle style={{ color: '#10b981' }} />
                <span>Selected: <strong>{form.roomName || (rooms || []).find(r => String(r.id) === String(form.resourceId))?.name || 'Loading...'}</strong></span>
              </div>
            )}
            
            {!form.resourceId && (
              <div className="view-toggle-group">
                <button 
                  type="button" 
                  className={`view-btn ${!showMap ? 'active' : ''}`}
                  onClick={() => setShowMap(false)}
                  title="Grid View"
                >
                  <FaThLarge />
                </button>
                <button 
                  type="button" 
                  className={`view-btn ${showMap ? 'active' : ''}`}
                  onClick={() => setShowMap(true)}
                  title="Map View"
                >
                  <FaMapMarkedAlt />
                </button>
              </div>
            )}
          </div>

          {showMap && !form.resourceId && (
            <div className="map-type-toggle">
              <button 
                type="button" 
                className={`type-toggle-btn ${mapType === 'CAMPUS' ? 'active' : ''}`}
                onClick={() => setMapType('CAMPUS')}
              >
                Campus Map
              </button>
              <button 
                type="button" 
                className={`type-toggle-btn ${mapType === 'INDOOR' ? 'active' : ''}`}
                onClick={() => setMapType('INDOOR')}
              >
                Indoor Floor Plan
              </button>
            </div>
          )}

          {loadingRooms && !form.resourceId && <div className="bk-loading" style={{ padding: '1.5rem 0' }}>Loading resources...</div>}

          {!loadingRooms && rooms.length === 0 && !form.resourceId && (
            <div className="bk-error">
              No active {selectedType.toLowerCase().replace('_', ' ')}s found. Please add them in the Facilities section first.
            </div>
          )}

          {!loadingRooms && rooms.length > 0 && !form.resourceId && (
            showMap ? (
              <div className="booking-map-container" style={{ marginTop: '1rem' }}>
                {mapType === 'CAMPUS' ? (
                  <CampusMap 
                    hideHeader={true}
                    onViewIndoor={() => setMapType('INDOOR')}
                    onSelectRoom={(loc) => {
                      const room = (rooms || []).find(r => r.name?.toLowerCase().includes(loc.name?.toLowerCase()) || loc.name?.toLowerCase().includes(r.name?.toLowerCase()));
                      if (room) {
                        handleRoomSelect(room);
                      } else {
                        setForm(prev => ({ ...prev, resourceId: loc.id, roomName: loc.name }));
                        // Trigger scroll manually for fallback case
                        setTimeout(() => {
                          const personalSection = document.getElementById('personal-info-section');
                          if (personalSection) {
                            personalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 200);
                      }
                      setShowMap(false);
                      toast.success(`Selected: ${loc.name}`);
                    }} 
                  />
                ) : (
                  <IndoorMap 
                    isEmbedded={true}
                    onSelectRoom={(room) => {
                      // Smart matching: Try exact match first, then fuzzy match
                      const mapName = room.name?.toLowerCase() || '';
                      const matchedResource = (rooms || []).find(r => {
                        const rName = r.name?.toLowerCase() || '';
                        return rName === mapName || (rName && mapName && (rName.includes(mapName) || mapName.includes(rName)));
                      });

                      if (matchedResource) {
                        handleRoomSelect(matchedResource);
                      } else {
                        // Fallback: Just set the name and ID directly
                        setForm(prev => ({ 
                          ...prev, 
                          resourceId: room.id, 
                          roomName: room.name
                        }));
                        // Trigger scroll manually for fallback case
                        setTimeout(() => {
                          const personalSection = document.getElementById('personal-info-section');
                          if (personalSection) {
                            personalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }, 200);
                      }
                      setShowMap(false);
                      toast.success(`Selected: ${room.name}`);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="equipment-selector-container">
              <div className="room-selector-grid">
                {(rooms || [])
                  .filter((room) => {
                    if (!room) return false;
                    if (selectedType !== 'EQUIPMENT' || showAllEquipment) return true;
                    const name = room.name?.toLowerCase() || '';
                    return name.includes('projector') || 
                           name.includes('microphone') || 
                           name.includes('laptop') || 
                           name.includes('macbook');
                  })
                  .map((room) => (
                    <div
                      key={room.id}
                      className={`room-option-card ${String(form.resourceId) === String(room.id) ? 'selected' : ''}`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="room-option-name">
                        {RESOURCE_TYPES.find(t => t.id === selectedType)?.icon || '📍'} {room.name}
                      </div>
                      <div className="room-option-meta">
                        <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.9rem' }}>📍</span> {room.location || '—'}
                        </div>
                        {selectedType === 'EQUIPMENT' ? (
                          <div className="equipment-meta-details">
                            <div className="equipment-meta-item">
                              <span style={{ fontSize: '0.9rem' }}>📦</span> Available: {room.availableUnits != null ? room.availableUnits : (room.capacity || '0')} units
                            </div>
                          </div>
                        ) : (
                          <div className="equipment-meta-item">
                            <span style={{ fontSize: '0.9rem' }}>👥</span> Supports: {room.capacity || '—'} people
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
              
              {selectedType === 'EQUIPMENT' && !showAllEquipment && (rooms || []).some(r => {
                const name = r.name?.toLowerCase() || '';
                return !name.includes('projector') && 
                       !name.includes('microphone') && 
                       !name.includes('laptop') && 
                       !name.includes('macbook');
              }) && (
                <button 
                  type="button" 
                  className="bk-btn bk-btn-ghost"
                  style={{ alignSelf: 'center', marginTop: '0.5rem' }}
                  onClick={() => setShowAllEquipment(true)}
                >
                  More Equipment
                </button>
              )}
            </div>
          ))}

          {/* Selection Summary Card */}
          {form.resourceId && (
            <div className="selection-summary-card">
              <div className="summary-left">
                <div className="summary-icon">
                  {RESOURCE_TYPES.find(t => t.id === selectedType)?.icon || '📍'}
                </div>
                <div className="summary-text">
                  <h3>{form.roomName || 'Selected Resource'}</h3>
                  <p>{selectedResource?.location || 'Campus Location'}</p>
                </div>
              </div>
              <button 
                type="button" 
                className="summary-change-btn"
                onClick={() => {
                  setForm(prev => ({ ...prev, resourceId: '', roomName: '' }));
                  setShowMap(false);
                }}
              >
                Change Selection
              </button>
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

        {/* User Information */}
        <div id="personal-info-section" className="booking-form-card" style={{ marginBottom: '1.25rem' }}>
          <div className="booking-detail-section-title">Personal Information</div>
          <div className="booking-form-grid">
            <div className="booking-form-group">
              <label className="booking-form-label">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="booking-form-input"
                required
              />
            </div>
            <div className="booking-form-group">
              <label className="booking-form-label">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="booking-form-input"
                required
              />
            </div>
            <div className="booking-form-group">
              <label className="booking-form-label">E-mail *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleEmailChange}
                placeholder="ex: myname@example.com"
                className="booking-form-input"
                required
              />
              <span className="booking-form-hint">Typing '@' will auto-fill gmail.com</span>
            </div>
            <div className="booking-form-group">
              <label className="booking-form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                placeholder="e.g. 0712345678"
                className="booking-form-input"
                required
              />
              <span className="booking-form-hint">Exactly 10 digits required</span>
            </div>
          </div>
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
