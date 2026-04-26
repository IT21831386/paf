import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { getAllResources, getAllBookings, getAllVisitorRequests } from '../api/services';
import { FaUserShield, FaClock, FaUsers, FaTools, FaMapMarkerAlt, FaTimes, FaCalendarPlus, FaDirections, FaPlus, FaMinus, FaCrosshairs, FaLayerGroup } from 'react-icons/fa';
import './Map.css';

// Custom markers for different types
const createCustomIcon = (color, iconClass) => new L.DivIcon({
  className: 'custom-div-icon',
  html: `
    <div class="marker-pin-custom" style="background-color: ${color};">
      <i class="fa ${iconClass}"></i>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

// Hardcoded coordinates for sample campus (SLIIT Malabe)
const CAMPUS_LOCATIONS = [
  { id: 'lh-a1', name: 'Lecture Hall A1', coords: [6.9158, 79.9730], type: 'Lecture Halls', icon: 'fa-chair', description: 'Building A, Floor 1', capacity: '200 People', equipment: 'Projector, Sound' },
  { id: 'lh-a2', name: 'Lecture Hall A2', coords: [6.9161, 79.9731], type: 'Lecture Halls', icon: 'fa-chair', description: 'Building A, Floor 1', capacity: '180 People', equipment: 'Projector, AC' },
  { id: 'lh-b1', name: 'Lecture Hall B1', coords: [6.9160, 79.9734], type: 'Lecture Halls', icon: 'fa-chair', description: 'Building B, Floor 1', capacity: '150 People', equipment: 'Smart Board' },
  { id: 'lh-b2', name: 'Lecture Hall B2', coords: [6.9163, 79.9735], type: 'Lecture Halls', icon: 'fa-chair', description: 'Building B, Floor 1', capacity: '150 People', equipment: 'AV System' },
  { id: 'lab-101', name: 'Computer Lab 101', coords: [6.9155, 79.9738], type: 'Labs', icon: 'fa-desktop', description: 'Building B, Floor 1', capacity: '45 People', equipment: '45 PCs, Fiber' },
  { id: 'lab-201', name: 'Chemistry Lab 201', coords: [6.9153, 79.9740], type: 'Labs', icon: 'fa-flask', description: 'Science Block, Floor 2', capacity: '50 People', equipment: 'Safety Kits' },
  { id: 'lab-102', name: 'Electronics Lab 102', coords: [6.9150, 79.9742], type: 'Labs', icon: 'fa-microchip', description: 'Building B, Floor 1', capacity: '35 People', equipment: 'Oscilloscopes' },
  { id: 'lab-202', name: 'Research Lab 202', coords: [6.9148, 79.9745], type: 'Labs', icon: 'fa-microscope', description: 'Science Block, Floor 2', capacity: '30 People', equipment: 'Special Kits' },
  { id: 'room-b2', name: 'Conference Room B2', coords: [6.9152, 79.9735], type: 'Meeting Rooms', icon: 'fa-handshake', description: 'Building B, Floor 2', capacity: '20 People', equipment: 'Video Call' },
  { id: 'room-c1', name: 'Seminar Room C1', coords: [6.9150, 79.9732], type: 'Meeting Rooms', icon: 'fa-users', description: 'Building C, Floor 1', capacity: '35 People', equipment: 'Podium, Mic' },
  { id: 'room-d4', name: 'Boardroom D4', coords: [6.9145, 79.9730], type: 'Meeting Rooms', icon: 'fa-briefcase', description: 'Building D, Floor 4', capacity: '15 People', equipment: 'Executive' },
  { id: 'room-e2', name: 'Innovation Studio E2', coords: [6.9142, 79.9728], type: 'Meeting Rooms', icon: 'fa-lightbulb', description: 'Innovation Hub, Floor 2', capacity: '25 People', equipment: '3D Printer' },
  { id: 'canteen', name: 'Student Canteen', coords: [6.9145, 79.9740], type: 'Quiet Zones', icon: 'fa-utensils', description: 'Science Block, Floor 1', capacity: '300 People', equipment: 'Dining, WiFi' },
];

const CATEGORIES = ['All Spaces', 'Lecture Halls', 'Labs', 'Meeting Rooms', 'Quiet Zones'];

function CampusMap({ hideHeader = false, onSelectRoom, onViewIndoor }) {
  const [bookings, setBookings] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLocation, setActiveLocation] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All Spaces');
  const [mapInstance, setMapInstance] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [bkData, vsData] = await Promise.all([
          getAllBookings(),
          getAllVisitorRequests()
        ]);
        setBookings(bkData.data || []);
        setVisitors(vsData.data || []);
      } catch (err) {
        console.error('Failed to fetch live data for map:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getLocationStatus = (locName) => {
    const now = new Date();
    const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    const today = now.toISOString().split('T')[0];

    const currentBookings = bookings.filter(b => 
      (b.roomName === locName || b.resourceId === locName) && 
      b.status === 'CONFIRMED' &&
      b.date === today &&
      timeStr >= b.startTime && timeStr <= b.endTime
    );

    const activeVisitors = visitors.filter(v => 
      v.location === locName && v.status === 'CHECKED_IN'
    );

    return {
      isOccupied: currentBookings.length > 0,
      booking: currentBookings[0],
      visitorCount: activeVisitors.reduce((sum, v) => sum + v.numberOfVisitors, 0)
    };
  };

  const getRoomImage = (loc) => {
    const name = loc.name?.toLowerCase() || '';
    const type = loc.type?.toLowerCase() || '';
    
    if (name.includes('canteen')) return 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&q=80&w=600';
    if (name.includes('entrance') || name.includes('gate')) return 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600';
    if (type.includes('hall')) return 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=600';
    if (type.includes('lab')) return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600';
    if (type.includes('meeting')) return 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=600';
    
    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=600';
  };

  const filteredLocations = activeCategory === 'All Spaces' 
    ? CAMPUS_LOCATIONS 
    : CAMPUS_LOCATIONS.filter(l => l.type === activeCategory);

  const handleBookNow = (loc) => {
    if (onSelectRoom) {
      onSelectRoom(loc);
    }
  };

  return (
    <div className={`map-page ${hideHeader ? 'map-embedded' : ''}`}>
      <div className="map-overlay-header">
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            className={`map-category-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            style={activeCategory === cat ? { 
              backgroundColor: cat === 'Lecture Halls' ? '#a78bfa' :
                              cat === 'Labs' ? '#3b82f6' :
                              cat === 'Meeting Rooms' ? '#10b981' :
                              cat === 'Quiet Zones' ? '#f59e0b' : 
                              '#6366f1', // Indigo for All Spaces
              color: 'white'
            } : {}}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="map-container-wrapper">
        <MapContainer 
          center={[6.9150, 79.9735]} 
          zoom={17} 
          zoomControl={false}
          scrollWheelZoom={true} 
          className="leaflet-map"
          ref={setMapInstance}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {filteredLocations.map(loc => {
            const status = getLocationStatus(loc.name);
            
            // Base color by category
            let color = '#10b981'; // Default
            if (loc.type === 'Lecture Halls') color = '#a78bfa';
            if (loc.type === 'Labs') color = '#3b82f6';
            if (loc.type === 'Meeting Rooms') color = '#10b981';
            if (loc.type === 'Quiet Zones') color = '#f59e0b';

            // Override if occupied
            if (status.isOccupied) color = '#ef4444'; 

            return (
              <Marker 
                key={loc.id} 
                position={loc.coords}
                icon={createCustomIcon(color, loc.icon)}
                eventHandlers={{
                  click: () => setActiveLocation(loc),
                }}
              />
            );
          })}
        </MapContainer>

        {/* Floating Sidebar */}
        {activeLocation && (
          <div className="room-info-sidebar">
            <button className="sidebar-close" onClick={() => setActiveLocation(null)}>
              <FaTimes />
            </button>
            
            {(() => {
              const status = getLocationStatus(activeLocation.name);
              const isOccupied = status.isOccupied;
              const booking = status.booking;
              
              return (
                <>
                  <div className="room-image-placeholder">
                    <img src={getRoomImage(activeLocation)} alt={activeLocation.name} />
                    <div className={`room-status-badge ${isOccupied ? 'status-occupied' : 'status-available'}`}>
                      <span className="dot" style={{ backgroundColor: isOccupied ? '#ef4444' : '#10b981' }}></span>
                      {isOccupied ? `Occupied until ${booking?.endTime || '—'}` : 'Available Now'}
                    </div>
                  </div>

                  <div className="room-details-content">
                    <h2>{activeLocation.name}</h2>
                    <div className="room-location">
                      <FaMapMarkerAlt /> {activeLocation.description}
                    </div>

                    <div className="room-stats-grid">
                      <div className="room-stat-card">
                        <span className="stat-label">Capacity</span>
                        <span className="stat-value">👥 {activeLocation.capacity || 'N/A'}</span>
                      </div>
                      <div className="room-stat-card">
                        <span className="stat-label">Equipment</span>
                        <span className="stat-value">📦 {activeLocation.equipment || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="current-reservation-card">
                      <div className="reservation-title">Current Reservation</div>
                      {isOccupied && booking ? (
                        <div className="reservation-user">
                          <div className="user-avatar"></div>
                          <div className="user-info">
                            <h4>{booking.purpose || 'Private Event'}</h4>
                            <p>{booking.startTime || '—'} - {booking.endTime || '—'}</p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>No active bookings</p>
                      )}
                    </div>
                  </div>

                  <div className="sidebar-actions">
                    <button 
                      className={`btn-book-now ${onSelectRoom ? 'btn-select-mode' : ''}`}
                      onClick={() => handleBookNow(activeLocation)}
                    >
                      {onSelectRoom ? (
                        <><FaCalendarPlus /> Select {activeLocation.name}</>
                      ) : (
                        <><FaCalendarPlus /> Book Next Slot</>
                      )}
                    </button>
                    
                    {onViewIndoor && (activeLocation.id === 'hall_a' || activeLocation.id === 'admin_block' || activeLocation.id === 'hall_b') && (
                      <button className="btn-indoor-view" onClick={onViewIndoor} style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.2)', padding: '0.75rem', borderRadius: '8px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', marginBottom: '0.5rem' }}>
                        <FaLayerGroup /> View Indoor Map
                      </button>
                    )}

                    <button className="btn-directions">
                      <FaDirections /> Get Directions
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Map Controls */}
        <div className="map-controls-bottom">
          <button className="map-control-btn" onClick={() => mapInstance?.zoomIn()}><FaPlus /></button>
          <button className="map-control-btn" onClick={() => mapInstance?.zoomOut()}><FaMinus /></button>
          <button className="map-control-btn" onClick={() => mapInstance?.setView([6.9150, 79.9735], 17)}><FaCrosshairs /></button>
        </div>
      </div>
    </div>
  );
}

export default CampusMap;
