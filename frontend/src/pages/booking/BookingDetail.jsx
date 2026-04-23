import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaArrowLeft, FaEdit, FaTimes } from 'react-icons/fa';
import { getBookingById, cancelBooking } from '../../api/services';
import './Booking.css';

function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBookingById(id);
        setBooking(res.data);
      } catch {
        setError('Could not load booking details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(id);
      setBooking((prev) => ({ ...prev, status: 'CANCELLED' }));
      setShowCancelModal(false);
    } catch {
      alert('Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      PENDING: 'bk-badge bk-badge-pending',
      CONFIRMED: 'bk-badge bk-badge-confirmed',
      CANCELLED: 'bk-badge bk-badge-cancelled',
      COMPLETED: 'bk-badge bk-badge-completed',
    };
    return <span className={map[status] || 'bk-badge'}>{status}</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  };

  const formatCreated = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const canModify = booking && (booking.status === 'PENDING' || booking.status === 'CONFIRMED');

  if (loading) return <div className="booking-container"><div className="bk-loading">Loading booking...</div></div>;
  if (error) return <div className="booking-container"><div className="bk-error">{error}</div></div>;
  if (!booking) return null;

  return (
    <div className="booking-container">
      <div className="booking-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 className="booking-title">{booking.purpose || 'Meeting Booking'}</h1>
            <p className="booking-subtitle">Booking ID: {booking.id}</p>
          </div>
          {statusBadge(booking.status)}
        </div>
        <div className="booking-detail-actions">
          {canModify && (
            <>
              <Link to={`/bookings/edit/${booking.id}`} className="bk-btn bk-btn-ghost">
                <FaEdit /> Edit
              </Link>
              <button className="bk-btn bk-btn-danger" onClick={() => setShowCancelModal(true)}>
                <FaTimes /> Cancel
              </button>
            </>
          )}
          <Link to="/bookings" className="bk-btn bk-btn-ghost">
            <FaArrowLeft /> Back
          </Link>
        </div>
      </div>

      {/* Room & Schedule */}
      <div className="booking-detail-card">
        <div className="booking-detail-section-title">Room & Schedule</div>
        <div className="booking-detail-grid">
          <div className="booking-detail-item">
            <span className="booking-detail-key">Meeting Room</span>
            <span className="booking-detail-value">🏢 {booking.roomName || booking.resourceId || '—'}</span>
          </div>
          <div className="booking-detail-item">
            <span className="booking-detail-key">Date</span>
            <span className="booking-detail-value">📅 {formatDate(booking.date)}</span>
          </div>
          <div className="booking-detail-item">
            <span className="booking-detail-key">Start Time</span>
            <span className="booking-detail-value">🕐 {booking.startTime || '—'}</span>
          </div>
          <div className="booking-detail-item">
            <span className="booking-detail-key">End Time</span>
            <span className="booking-detail-value">🕐 {booking.endTime || '—'}</span>
          </div>
          {booking.attendees && (
            <div className="booking-detail-item">
              <span className="booking-detail-key">Attendees</span>
              <span className="booking-detail-value">👥 {booking.attendees} people</span>
            </div>
          )}
        </div>
      </div>

      {/* Meeting Info */}
      <div className="booking-detail-card">
        <div className="booking-detail-section-title">Meeting Information</div>
        <div className="booking-detail-grid">
          <div className="booking-detail-item full-width">
            <span className="booking-detail-key">Purpose</span>
            <span className="booking-detail-value">{booking.purpose || '—'}</span>
          </div>
          {booking.notes && (
            <div className="booking-detail-item full-width">
              <span className="booking-detail-key">Notes</span>
              <span className="booking-detail-value" style={{ whiteSpace: 'pre-wrap' }}>{booking.notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Booking Meta */}
      <div className="booking-detail-card">
        <div className="booking-detail-section-title">Booking Info</div>
        <div className="booking-detail-grid">
          {booking.bookedByName && (
            <div className="booking-detail-item">
              <span className="booking-detail-key">Booked By</span>
              <span className="booking-detail-value">{booking.bookedByName}</span>
            </div>
          )}
          {booking.createdAt && (
            <div className="booking-detail-item">
              <span className="booking-detail-key">Created</span>
              <span className="booking-detail-value">{formatCreated(booking.createdAt)}</span>
            </div>
          )}
          <div className="booking-detail-item">
            <span className="booking-detail-key">Status</span>
            <span className="booking-detail-value">{statusBadge(booking.status)}</span>
          </div>
        </div>
      </div>

      {showCancelModal && (
        <div className="bk-modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="bk-modal-title">Cancel Booking</h3>
            <p className="bk-modal-body">
              Are you sure you want to cancel <strong style={{ color: '#e2e8f0' }}>
                {booking.purpose || 'this meeting'}
              </strong> on {formatDate(booking.date)}? This action cannot be undone.
            </p>
            <div className="bk-modal-actions">
              <button className="bk-btn bk-btn-ghost" onClick={() => setShowCancelModal(false)}>
                Keep It
              </button>
              <button
                className="bk-btn bk-btn-danger"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingDetail;
