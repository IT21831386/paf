import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaSearch, FaCalendarAlt, FaClock, FaBuilding, FaUsers, FaEye, FaTimes, FaMapMarkedAlt, FaThList } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { getAllBookings, cancelBooking } from '../../api/services';
import CampusMap from '../../components/CampusMap';


import './Booking.css';

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'

  const getDisplayStatus = (booking) => {
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') return booking.status;
    
    try {
      const now = new Date();
      const [endH, endM] = (booking.endTime || "00:00").split(':').map(Number);
      
      const bookingEnd = new Date(booking.date);
      bookingEnd.setHours(endH, endM, 0, 0);
      
      if (now > bookingEnd) return 'COMPLETED';
    } catch (e) {
      console.error("Status check error", e);
    }
    return booking.status;
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // Fetch more bookings to allow local filtering
      const res = await getAllBookings({}); 
      let data = Array.isArray(res.data) ? res.data : [];
      
      // Apply search and status filter locally for real-time "COMPLETED" logic
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(b => 
          (b.roomName && b.roomName.toLowerCase().includes(s)) || 
          (b.purpose && b.purpose.toLowerCase().includes(s))
        );
      }

      if (statusFilter) {
        data = data.filter(b => getDisplayStatus(b) === statusFilter);
      } 
      
      // Sort by the time it was added (Newest first)
      data.sort((a, b) => {
        // 1. Try sorting by createdAt timestamp if available
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        
        // 2. Fallback: Robust ID descending sort (handles strings like BK-10, BK-2)
        const idA = String(a.id || "");
        const idB = String(b.id || "");
        return idB.localeCompare(idA, undefined, { numeric: true, sensitivity: 'base' });
      });

      setBookings(data);
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

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelBooking(cancelTarget.id);
      toast.success('Booking cancelled successfully.');
      setCancelTarget(null);
      fetchBookings(); // Refresh list
    } catch {
      toast.error('Failed to cancel booking.');
    } finally {
      setCancelling(false);
    }
  };

  const statusBadge = (booking) => {
    const status = getDisplayStatus(booking);
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

  return (
    <div className="booking-container">
      <div className="booking-header">
        <div>
          <h1 className="booking-title">Reserve Your Spot</h1>
          <p className="booking-subtitle">Effortlessly book and manage campus facilities for your collaborative needs</p>
        </div>
        <Link to="/bookings/new" className="bk-btn bk-btn-primary">
          <FaPlus /> New Booking
        </Link>
      </div>

      <form className="booking-search-bar" onSubmit={handleSearch}>
        <div className="booking-search-input-wrapper">
          <FaSearch className="booking-search-icon" />
          <input
            type="text"
            placeholder="Search by room name..."
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
          {loading && <div className="bk-loading">Loading bookings...</div>}
          {error && <div className="bk-error">{error}</div>}

          {!loading && !error && bookings.length === 0 && (
            <div className="bk-empty">
              <div className="bk-empty-icon">📅</div>
              <p>No bookings found. Make your first meeting room reservation!</p>
              <Link to="/bookings/new" className="bk-btn bk-btn-primary">
                <FaPlus /> New Booking
              </Link>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="booking-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-card-left">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <h3 className="booking-card-title">{booking.purpose || 'Meeting'}</h3>
                      {statusBadge(booking)}
                    </div>
                    <div className="booking-card-meta">
                      <span><FaBuilding /> {booking.roomName || booking.resourceId}</span>
                      <span><FaCalendarAlt /> {formatDate(booking.date)}</span>
                      <span><FaClock /> {booking.startTime} – {booking.endTime}</span>
                      {booking.attendees && <span><FaUsers /> {booking.attendees} attendees</span>}
                      <span>👤 {booking.firstName && booking.lastName ? `${booking.firstName} ${booking.lastName}` : (booking.bookedByName || '—')}</span>
                    </div>
                  </div>
                  <div className="booking-card-actions">
                    <Link to={`/bookings/${booking.id}`} className="bk-btn bk-btn-ghost bk-btn-sm">
                      <FaEye /> View
                    </Link>
                    {(getDisplayStatus(booking) === 'PENDING' || getDisplayStatus(booking) === 'CONFIRMED') && (
                      <button
                        className="bk-btn bk-btn-danger bk-btn-sm"
                        onClick={() => setCancelTarget(booking)}
                      >
                        <FaTimes /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {cancelTarget && (
        <div className="bk-modal-overlay" onClick={() => setCancelTarget(null)}>
          <div className="bk-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="bk-modal-title">Cancel Booking</h3>
            <p className="bk-modal-body">
              Are you sure you want to cancel the booking for <strong style={{ color: '#e2e8f0' }}>
                {cancelTarget.purpose || 'this meeting'}
              </strong> on {formatDate(cancelTarget.date)}?
            </p>
            <div className="bk-modal-actions">
              <button className="bk-btn bk-btn-ghost" onClick={() => setCancelTarget(null)}>
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

export default BookingList;
