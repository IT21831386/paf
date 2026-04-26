import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, FaDesktop, FaUsers, FaMicrophone, FaServer, 
  FaCoffee, FaLightbulb, FaUtensils, FaBed, FaCogs, FaRobot, 
  FaChalkboardTeacher, FaChartLine, FaBookOpen, FaCouch, 
  FaCar, FaChargingStation, FaBasketballBall, FaDumbbell, 
  FaSwimmer, FaWater, FaBuilding
} from 'react-icons/fa';
import './VirtualTour.css';

const tourDetailsMap = {
  'main-building': {
    title: 'Main Building',
    floors: {
      'ground-floor': {
        title: 'Ground Floor',
        facilities: [
          { name: 'Reception Area', icon: <FaUsers size={40} />, color: 'var(--primary)', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800' },
          { name: 'Admin Offices', icon: <FaDesktop size={40} />, color: 'var(--info)', image: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800' },
        ]
      },
      'first-floor': {
        title: 'First Floor',
        facilities: [
          { name: 'Grand Auditorium', icon: <FaMicrophone size={40} />, color: 'var(--warning-alt)', image: 'https://images.unsplash.com/photo-1546484396-fb3fc6f95f98?auto=format&fit=crop&w=800' },
          { name: 'IT Service Desk', icon: <FaServer size={40} />, color: 'var(--danger)', image: 'https://images.unsplash.com/photo-1550565118-3a14e8d0386f?auto=format&fit=crop&w=800' },
        ]
      },
      'second-floor': {
        title: 'Second Floor',
        facilities: [
          { name: 'University Library', icon: <FaBookOpen size={40} />, color: 'var(--primary)', image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800' },
          { name: 'Faculty Conference Room', icon: <FaUsers size={40} />, color: 'var(--info)', image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=800' },
        ]
      },
      'third-floor': {
        title: 'Third Floor',
        facilities: [
          { name: 'Executive Boardroom', icon: <FaDesktop size={40} />, color: 'var(--warning)', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800' },
          { name: 'Rooftop Terrace', icon: <FaCoffee size={40} />, color: 'var(--pink)', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800' },
        ]
      }
    }
  },
  'new-building': {
    title: 'New Building',
    floors: {
      'ground-floor': {
        title: 'Ground Floor',
        facilities: [
          { name: 'Student Lounges', icon: <FaCouch size={40} />, color: 'var(--pink)' },
        ]
      },
      'first-floor': {
        title: 'First Floor',
        facilities: [
          { name: 'Lecture Hall A', icon: <FaChalkboardTeacher size={40} />, color: 'var(--primary)' },
          { name: 'Lecture Hall B', icon: <FaChalkboardTeacher size={40} />, color: 'var(--info)' },
          { name: 'Innovation Hub', icon: <FaLightbulb size={40} />, color: 'var(--warning)' },
        ]
      }
    }
  },
  'william-angilis': {
    title: 'William Angilis',
    facilities: [
      { name: 'Culinary Lab', icon: <FaUtensils size={40} />, color: 'var(--danger-light)' },
      { name: 'Hospitality Suite', icon: <FaBed size={40} />, color: 'var(--primary-light)' },
      { name: 'Training Restaurant', icon: <FaCoffee size={40} />, color: 'var(--warning-alt)' },
      { name: 'Event Hall', icon: <FaMicrophone size={40} />, color: 'var(--success)' },
    ]
  },
  'engineering-faculty': {
    title: 'Engineering Faculty',
    floors: {
      'level-1': {
        title: 'Level 1',
        facilities: [
          { name: 'Robotics Lab', icon: <FaRobot size={40} />, color: 'var(--danger)' },
          { name: 'Civil Workshop', icon: <FaCogs size={40} />, color: 'var(--warning-alt)' },
        ]
      },
      'level-2': {
        title: 'Level 2',
        facilities: [
          { name: 'Computer Science Labs', icon: <FaDesktop size={40} />, color: 'var(--primary)' },
          { name: 'Hardware Prototyping', icon: <FaServer size={40} />, color: 'var(--info)' },
        ]
      }
    }
  },
  'business-school': {
    title: 'Business School',
    facilities: [
      { name: 'Case Study Rooms', icon: <FaUsers size={40} />, color: 'var(--primary)' },
      { name: 'Finance Trading Lab', icon: <FaChartLine size={40} />, color: 'var(--success)' },
      { name: 'Marketing Studio', icon: <FaLightbulb size={40} />, color: 'var(--pink)' },
      { name: 'Executive Lounge', icon: <FaCoffee size={40} />, color: 'var(--warning-alt)' },
    ]
  },
  'study-areas': {
    title: 'Study Areas',
    facilities: [
      { name: 'Silent Reading Room', icon: <FaBookOpen size={40} />, color: 'var(--primary)' },
      { name: 'Group Pods', icon: <FaUsers size={40} />, color: 'var(--info)' },
      { name: 'Digital Media Library', icon: <FaDesktop size={40} />, color: 'var(--pink)' },
      { name: '24/7 Study Space', icon: <FaCouch size={40} />, color: 'var(--warning)' },
    ]
  },
  'student-car-park': {
    title: 'Student Car Park',
    facilities: [
      { name: 'Electric Vehicle Charging', icon: <FaChargingStation size={40} />, color: 'var(--success)' },
      { name: 'Undercover Parking', icon: <FaCar size={40} />, color: 'var(--primary)' },
      { name: 'Main Lot', icon: <FaCar size={40} />, color: 'var(--info)' },
      { name: 'Overflow Parking', icon: <FaCar size={40} />, color: 'var(--text-muted)' },
    ]
  },
  'sports-complex': {
    title: 'Sports Complex',
    facilities: [
      { name: 'Indoor Basketball Court', icon: <FaBasketballBall size={40} />, color: 'var(--warning-alt)' },
      { name: 'Gymnasium', icon: <FaDumbbell size={40} />, color: 'var(--danger)' },
      { name: 'Squash Courts', icon: <FaUsers size={40} />, color: 'var(--primary)' },
      { name: 'Yoga Studio', icon: <FaCouch size={40} />, color: 'var(--pink-light)' },
    ]
  },
  'swimming-pool': {
    title: 'Swimming Pool',
    facilities: [
      { name: 'Olympic Size Pool', icon: <FaSwimmer size={40} />, color: 'var(--info)' },
      { name: 'Beginner Pool', icon: <FaWater size={40} />, color: 'var(--success)' },
      { name: 'Spectator Stands', icon: <FaUsers size={40} />, color: 'var(--primary)' },
      { name: 'Change Rooms', icon: <FaCogs size={40} />, color: 'var(--warning)' },
    ]
  }
};

function VirtualTourDetail() {
  const { buildingId, floorId } = useParams();
  const navigate = useNavigate();
  const [selectedImage, setSelectedImage] = useState(null);

  const building = tourDetailsMap[buildingId];

  if (!building) {
    return (
      <div className="page-container">
        <h2>Location not found</h2>
        <button className="btn btn-ghost" onClick={() => navigate('/virtual-tour')}>Go Back</button>
      </div>
    );
  }

  const hasFloors = Boolean(building.floors);
  
  let currentTitle = building.title;
  let items = [];
  let backPath = '/virtual-tour';
  let backText = 'Back to Campus Tour';

  if (hasFloors && !floorId) {
    // Show floors overview
    items = Object.entries(building.floors).map(([key, floorData]) => ({
      id: key,
      name: floorData.title,
      icon: <FaBuilding size={40} />,
      color: 'var(--primary-light)',
      isFloor: true
    }));
  } else if (hasFloors && floorId) {
    // Show facilities for the specific floor
    const floor = building.floors[floorId];
    if (!floor) {
      return (
        <div className="page-container">
          <h2>Floor not found</h2>
          <button className="btn btn-ghost" onClick={() => navigate(`/virtual-tour/${buildingId}`)}>Go Back</button>
        </div>
      );
    }
    
    currentTitle = `${building.title} - ${floor.title}`;
    items = floor.facilities.map(fac => ({ ...fac, isFloor: false }));
    backPath = `/virtual-tour/${buildingId}`;
    backText = `Back to ${building.title}`;
  } else {
    // No floors, just show facilities
    items = building.facilities.map(fac => ({ ...fac, isFloor: false }));
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <div className="breadcrumbs" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/virtual-tour')}>Tour</span> &gt;{' '}
            {floorId ? (
              <>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/virtual-tour/${buildingId}`)}>{building.title}</span> &gt;{' '}
                <span style={{ color: 'var(--text-primary)' }}>{building.floors[floorId]?.title}</span>
              </>
            ) : (
              <span style={{ color: 'var(--text-primary)' }}>{building.title}</span>
            )}
          </div>
          <h1 className="page-title">{currentTitle}</h1>
          <p className="page-subtitle">
            {hasFloors && !floorId ? 'Select a floor to view facilities.' : 'Inside view: explore the facilities within this area.'}
          </p>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(backPath)}>
          <FaArrowLeft /> {backText}
        </button>
      </div>

      <div className="tour-grid">
        {items.map((item, index) => (
          <div 
            key={index} 
            className="tour-card" 
            tabIndex="0" 
            onClick={() => {
              if (item.isFloor) {
                navigate(`/virtual-tour/${buildingId}/${item.id}`);
              } else if (item.image) {
                setSelectedImage({ src: item.image, title: item.name });
              } else {
                alert(`No photo available for ${item.name} currently.`);
              }
            }}
            style={item.isFloor || item.image ? { cursor: 'pointer' } : {}}
          >
            <div className="tour-card-icon" style={{ color: item.color }}>
              {item.icon}
            </div>
            <h2 className="tour-card-title">{item.name}</h2>
            <button className={`btn btn-sm btn-tour ${item.isFloor ? 'btn-primary' : 'btn-ghost'}`}>
              {item.isFloor ? 'Enter Floor' : 'View Area'}
            </button>
          </div>
        ))}
      </div>

      {selectedImage && (
        <div className="tour-modal" onClick={() => setSelectedImage(null)}>
          <div className="tour-modal-content" onClick={e => e.stopPropagation()}>
            <div className="tour-modal-header">
              <h3>{selectedImage.title}</h3>
              <button className="tour-modal-close" onClick={() => setSelectedImage(null)}>&times;</button>
            </div>
            <img src={selectedImage.src} alt={selectedImage.title} className="tour-modal-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualTourDetail;
