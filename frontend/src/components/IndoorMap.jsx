import { useState } from 'react';
import { FaPlus, FaMinus, FaCheckCircle, FaUserFriends, FaClock, FaWifi, FaDesktop, FaUsers, FaUserShield, FaFlask, FaChalkboardTeacher, FaTools } from 'react-icons/fa';
import './IndoorMap.css';

const FLOORS = ['L1', 'L2', 'L3'];

const BLUEPRINT_ROOMS = [
  { id: 'lh-a1', name: 'Lecture Hall A1', x: 50, y: 50, width: 250, height: 180, type: 'Lecture Hall', status: 'available', capacity: 200, icon: <FaChalkboardTeacher /> },
  { id: 'lh-a2', name: 'Lecture Hall A2', x: 320, y: 50, width: 120, height: 180, type: 'Lecture Hall', status: 'occupied', capacity: 180, icon: <FaChalkboardTeacher /> },
  { id: 'lab-101', name: 'Computer Lab 101', x: 460, y: 50, width: 240, height: 280, type: 'Lab', status: 'available', capacity: 45, icon: <FaFlask /> },
  { id: 'lab-201', name: 'Chemistry Lab 201', x: 710, y: 50, width: 240, height: 280, type: 'Lab', status: 'available', capacity: 50, icon: <FaFlask /> },
  { id: 'lab-102', name: 'Electronics Lab 102', x: 50, y: 250, width: 180, height: 120, type: 'Lab', status: 'available', capacity: 35, icon: <FaTools /> },
  { id: 'lab-202', name: 'Research Lab 202', x: 50, y: 390, width: 180, height: 120, type: 'Lab', status: 'available', capacity: 30, icon: <FaFlask /> },
  { id: 'room-b2', name: 'Conference Room B2', x: 250, y: 250, width: 200, height: 120, type: 'Meeting Room', status: 'soon', capacity: 20, icon: <FaUsers /> },
  { id: 'lh-b1', name: 'Lecture Hall B1', x: 250, y: 390, width: 200, height: 180, type: 'Lecture Hall', status: 'available', capacity: 150, icon: <FaChalkboardTeacher /> },
  { id: 'lh-b2', name: 'Lecture Hall B2', x: 470, y: 390, width: 200, height: 180, type: 'Lecture Hall', status: 'available', capacity: 150, icon: <FaChalkboardTeacher /> },
  { id: 'room-c1', name: 'Seminar Room C1', x: 470, y: 150, width: 210, height: 100, type: 'Meeting Room', status: 'available', capacity: 35, icon: <FaUsers /> },
  { id: 'room-d4', name: 'Boardroom D4', x: 700, y: 350, width: 120, height: 100, type: 'Meeting Room', status: 'occupied', capacity: 15, icon: <FaUsers /> },
  { id: 'room-e2', name: 'Innovation Studio E2', x: 840, y: 350, width: 120, height: 100, type: 'Meeting Room', status: 'available', capacity: 25, icon: <FaTools /> },
  { id: 'canteen', name: 'Student Canteen', x: 700, y: 470, width: 260, height: 100, type: 'Quiet Zone', status: 'available', capacity: 300, icon: <FaTools /> },
];

function IndoorMap({ onSelectRoom, isEmbedded = false }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [activeFloor, setActiveFloor] = useState('L2');

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'occupied': return '#ef4444';
      case 'soon': return '#f59e0b';
      default: return '#94a3b8';
    }
  };

  return (
    <div className={`indoor-map-blueprint ${isEmbedded ? 'embedded' : ''}`}>
      {!isEmbedded && (
        <div className="blueprint-header">
          <div className="floor-selector">
            {['L1', 'L2', 'L3'].map(f => (
              <button key={f} className={`floor-btn ${activeFloor === f ? 'active' : ''}`} onClick={() => setActiveFloor(f)}>
                {f}
              </button>
            ))}
          </div>
          <div className="blueprint-title">
            <h1>Campus Floor Plan</h1>
            <p>Select a room to see details and availability</p>
          </div>
        </div>
      )}

      <div className="blueprint-main-container">
        <div className="blueprint-viewer">
          <div className="blueprint-canvas-wrapper">
            <svg viewBox="0 0 1000 600" className="blueprint-svg">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="1000" height="600" fill="url(#grid)" />
              <rect x="20" y="20" width="960" height="560" className="floor-base" rx="8" />
              
              {BLUEPRINT_ROOMS.map(room => (
                <g 
                  key={room.id} 
                  className={`room-group ${selectedRoom?.id === room.id ? 'selected' : ''} ${room.status}`}
                  onClick={() => handleRoomClick(room)}
                >
                  <rect 
                    x={room.x} y={room.y} width={room.width} height={room.height} 
                    className="room-rect"
                    style={{ borderLeft: `4px solid ${getStatusColor(room.status)}` }}
                  />
                  
                  <rect 
                    x={room.x} y={room.y} width="4" height={room.height} 
                    fill={getStatusColor(room.status)}
                  />

                  <text x={room.x + 15} y={room.y + 30} className="room-label-id">{room.id}</text>
                  <text x={room.x + 15} y={room.y + 55} className="room-label-name">
                    {room.name.length > 15 ? room.name.substring(0, 15) + '...' : room.name}
                  </text>

                  {room.icon && (
                    <g transform={`translate(${room.x + room.width - 35}, ${room.y + 15}) scale(1.2)`}>
                       <foreignObject width="20" height="20">
                          <div style={{ color: getStatusColor(room.status) }}>
                            {room.icon}
                          </div>
                       </foreignObject>
                    </g>
                  )}
                </g>
              ))}
            </svg>

          </div>
          <div className="map-legend">
            <span className="legend-title">Room Status</span>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#10b981' }}></span> Open
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#ef4444' }}></span> In Use
            </div>
            <div className="legend-item">
              <span className="legend-dot" style={{ backgroundColor: '#f59e0b' }}></span> Reserved
            </div>
          </div>
        </div>

        {selectedRoom && (
          <div className="map-sidebar-blueprint">
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="sidebar-header-bp">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h2>{selectedRoom.name}</h2>
                  <button className="sidebar-close-btn" onClick={() => setSelectedRoom(null)}>×</button>
                </div>
                <p>{selectedRoom.type} • {activeFloor}</p>
              </div>

              <div style={{ marginTop: '2rem' }}>
                <div className="bp-stat-card">
                  <div className="bp-stat-label">Seating Capacity</div>
                  <div className="bp-stat-value">
                    <FaUserFriends style={{ marginRight: '8px' }} /> 
                    {selectedRoom.capacity > 0 ? `${selectedRoom.capacity} People` : 'N/A'}
                  </div>
                </div>

                <div className="bp-stat-card">
                  <div className="bp-stat-label">Facilities</div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                    <FaWifi title="High-speed WiFi" />
                    <FaDesktop title="Presentation Screen" />
                  </div>
                </div>

                <div className="bp-stat-card">
                  <div className="bp-stat-label">Current Availability</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                    {selectedRoom.status === 'available' ? 'Available until 8:00 PM' : 'Booked until 2:00 PM'}
                  </div>
                </div>
              </div>

              <button className="btn-bp-primary" type="button" onClick={() => onSelectRoom && onSelectRoom(selectedRoom)}>
                Select for Booking
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndoorMap;
