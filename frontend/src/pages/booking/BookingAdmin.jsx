import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaClock, FaBuilding, FaUsers, FaEye, FaTimes, FaCheck, FaTrash, FaUser, FaMapMarkedAlt, FaThList } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getAllBookings, cancelBooking, updateBooking, deleteBooking, updateBookingStatus } from '../../api/services';
import CampusMap from '../../components/CampusMap';


import './Booking.css';

function BookingAdmin() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [actionTarget, setActionTarget] = useState(null);
  const [actionType, setActionType] = useState(null); // 'APPROVE', 'CANCEL', 'DELETE'
  const [processing, setProcessing] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.roomName = search;
      const res = await getAllBookings(params);
      setBookings(res.data);
      setError(null);
    } catch {
      setError('Failed to load bookings. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleAction = async () => {
    if (!actionTarget || !actionType) return;
    setProcessing(true);
    try {
      if (actionType === 'APPROVE') {
        await updateBookingStatus(actionTarget.id, 'CONFIRMED');
        setBookings((prev) =>
          prev.map((b) => b.id === actionTarget.id ? { ...b, status: 'CONFIRMED' } : b)
        );
        toast.success('Booking confirmed successfully!', { icon: '✅' });
      } else if (actionType === 'CANCEL') {
        await cancelBooking(actionTarget.id);
        setBookings((prev) =>
          prev.map((b) => b.id === actionTarget.id ? { ...b, status: 'CANCELLED' } : b)
        );
        toast.success('Booking cancelled successfully.');
      } else if (actionType === 'DELETE') {
        await deleteBooking(actionTarget.id);
        setBookings((prev) => prev.filter((b) => b.id !== actionTarget.id));
        toast.success('Booking record deleted forever.', { icon: '🗑️' });
      }
      setActionTarget(null);
      setActionType(null);
    } catch {
      toast.error(`Failed to perform ${actionType.toLowerCase()} action.`);
    } finally {
      setProcessing(false);
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
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });
  };

  // Auth check - keeping for potential use but removing restriction
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="booking-container">
      <div className="booking-header">
        <div>
          <h1 className="booking-title">Admin Booking Management</h1>
          <p className="booking-subtitle">View and manage all campus resource reservations</p>
        </div>
      </div>

      <form className="booking-search-bar" onSubmit={handleSearch}>
        <div className="booking-search-input-wrapper">
          <FaSearch className="booking-search-icon" />
          <input
            type="text"
            placeholder="Search by room or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="booking-search-input"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="booking-filter-select"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <div className="view-toggle-group">
          <button 
            type="button" 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="List View"
          >
            <FaThList />
          </button>
          <button 
            type="button" 
            className={`view-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
            title="Map View"
          >
            <FaMapMarkedAlt />
          </button>
        </div>

        <button type="submit" className="bk-btn bk-btn-primary">Search</button>
      </form>

      {viewMode === 'map' ? (
        <div className="booking-map-view">
          <CampusMap hideHeader={true} />

        </div>
      ) : (
        <>
          {loading && <div className="bk-loading">Loading all campus bookings...</div>}
          {error && <div className="bk-error">{error}</div>}

          {!loading && !error && bookings.length === 0 && (
            <div className="bk-empty">
              <div className="bk-empty-icon">📂</div>
              <p>No bookings found matching your criteria.</p>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="booking-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-card-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <h3 className="booking-card-title">{booking.purpose || 'Meeting'}</h3>
                      {statusBadge(booking.status)}
                    </div>
                    <div className="booking-card-meta">
                      <span><FaBuilding /> {booking.roomName || booking.resourceId}</span>
                      <span><FaCalendarAlt /> {formatDate(booking.date)}</span>
                      <span><FaClock /> {booking.startTime} – {booking.endTime}</span>
                      <span><FaUser /> {booking.bookedByName || booking.bookedBy || 'Unknown User'}</span>
                      {booking.attendees && <span><FaUsers /> {booking.attendees}</span>}
                    </div>
                  </div>
                  <div className="booking-card-actions">
                    <Link to={`/bookings/${booking.id}`} className="bk-btn bk-btn-ghost bk-btn-sm" title="View Details">
                      <FaEye />
                    </Link>
                    
                    {booking.status === 'PENDING' && (
                      <button
                        className="bk-btn bk-btn-primary bk-btn-sm"
                        onClick={() => { setActionTarget(booking); setActionType('APPROVE'); }}
                        title="Confirm Booking"
                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
                      >
                        <FaCheck /> Confirm
                      </button>
                    )}

                    {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                      <button
                        className="bk-btn bk-btn-danger bk-btn-sm"
                        onClick={() => { setActionTarget(booking); setActionType('CANCEL'); }}
                        title="Cancel Booking"
                      >
                        <FaTimes /> Cancel
                      </button>
                    )}

                    <button
                      className="bk-btn bk-btn-danger bk-btn-sm"
                      onClick={() => { setActionTarget(booking); setActionType('DELETE'); }}
                      title="Delete Record"
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {actionTarget && (
        <div className="bk-modal-overlay" onClick={() => setActionTarget(null)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="bk-modal-title">
              {actionType === 'APPROVE' ? 'Confirm Booking' : 
               actionType === 'CANCEL' ? 'Cancel Booking' : 'Delete Booking'}
            </h3>
            <p className="bk-modal-body">
              Are you sure you want to {actionType.toLowerCase()} the booking for <strong style={{ color: '#e2e8f0' }}>
                {actionTarget.purpose || 'this meeting'}
              </strong>?
            </p>
            <div className="bk-modal-actions">
              <button className="bk-btn bk-btn-ghost" onClick={() => setActionTarget(null)}>
                Go Back
              </button>
              <button
                className={`bk-btn ${actionType === 'APPROVE' ? 'bk-btn-primary' : 'bk-btn-danger'}`}
                onClick={handleAction}
                disabled={processing}
                style={actionType === 'APPROVE' ? { background: 'linear-gradient(135deg, #10b981, #059669)' } : {}}
              >
                {processing ? 'Processing...' : `Yes, ${actionType.charAt(0) + actionType.slice(1).toLowerCase()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingAdmin;
