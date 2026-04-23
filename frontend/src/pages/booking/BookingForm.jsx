import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FaArrowLeft, FaCalendarAlt } from 'react-icons/fa';
import { createBooking, updateBooking, getBookingById, getAllResources } from '../../api/services';
import './Booking.css';

const INITIAL_FORM = {
  resourceId: '',
  roomName: '',
  date: '',
  startTime: '',
  endTime: '',
  purpose: '',
  attendees: '',
  notes: '',
};

function BookingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(INITIAL_FORM);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRooms = async () => {
      try {
        const res = await getAllResources({ type: 'MEETING_ROOM' });
        setRooms(res.data.filter((r) => r.status === 'ACTIVE'));
      } catch {
        setError('Could not load meeting rooms. Make sure the backend is running.');
      } finally {
        setLoadingRooms(false);
      }
    };
    loadRooms();
  }, []);

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

  const validate = () => {
    if (!form.resourceId) return 'Please select a meeting room.';
    if (!form.date) return 'Please select a date.';
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
            {isEdit ? 'Update your meeting room reservation' : 'Reserve a meeting room for your team'}
          </p>
        </div>
        <Link to="/bookings" className="bk-btn bk-btn-ghost">
          <FaArrowLeft /> Back
        </Link>
      </div>

      {error && <div className="bk-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Room Selection */}
        <div className="booking-form-card" style={{ marginBottom: '1.25rem' }}>
          <div className="booking-detail-section-title">Select Meeting Room</div>

          {loadingRooms && <div className="bk-loading" style={{ padding: '1.5rem 0' }}>Loading rooms...</div>}

          {!loadingRooms && rooms.length === 0 && (
            <div className="bk-error">
              No active meeting rooms found. Please add meeting rooms in the Facilities section first.
            </div>
          )}

          {!loadingRooms && rooms.length > 0 && (
            <div className="room-selector-grid">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-option-card ${form.resourceId === room.id ? 'selected' : ''}`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="room-option-name">🏢 {room.name}</div>
                  <div className="room-option-meta">
                    📍 {room.location || '—'} &nbsp;·&nbsp; 👥 Capacity: {room.capacity || '—'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="booking-form-card">
          <div className="booking-detail-section-title">Booking Details</div>

          <div className="booking-form-grid">
            <div className="booking-form-group">
              <label className="booking-form-label">Date *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={today}
                className="booking-form-input"
                required
              />
            </div>

            <div className="booking-form-group">
              <label className="booking-form-label">Number of Attendees</label>
              <input
                type="number"
                name="attendees"
                value={form.attendees}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 8"
                className="booking-form-input"
              />
            </div>

            <div className="booking-form-group">
              <label className="booking-form-label">Start Time *</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="booking-form-input"
                required
              />
            </div>

            <div className="booking-form-group">
              <label className="booking-form-label">End Time *</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="booking-form-input"
                required
              />
            </div>

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
