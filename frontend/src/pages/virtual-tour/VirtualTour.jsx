import { Link } from 'react-router-dom';
import { FaBuilding, FaCity, FaUniversity, FaMicrochip, FaBriefcase, FaBookReader, FaParking, FaFutbol, FaSwimmer } from 'react-icons/fa';
import './VirtualTour.css';

function VirtualTour() {
  const tourLocations = [
    { id: 'main-building', title: 'Main Building', icon: <FaUniversity size={40} />, color: 'var(--primary)' },
    { id: 'new-building', title: 'New Building', icon: <FaBuilding size={40} />, color: 'var(--info)' },
    { id: 'william-angilis', title: 'William Angilis', icon: <FaCity size={40} />, color: 'var(--success)' },
    { id: 'engineering-faculty', title: 'Engineering Faculty', icon: <FaMicrochip size={40} />, color: 'var(--danger)' },
    { id: 'business-school', title: 'Business School', icon: <FaBriefcase size={40} />, color: 'var(--warning-alt)' },
    { id: 'study-areas', title: 'Study Areas', icon: <FaBookReader size={40} />, color: 'var(--pink)' },
    { id: 'student-car-park', title: 'Student Car Park', icon: <FaParking size={40} />, color: 'var(--primary-light)' },
    { id: 'sports-complex', title: 'Sports Complex', icon: <FaFutbol size={40} />, color: 'var(--success)' },
    { id: 'swimming-pool', title: 'Swimming Pool', icon: <FaSwimmer size={40} />, color: 'var(--info)' },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Campus Tour</h1>
          <p className="page-subtitle">Explore the campus facilities and buildings interactively</p>
        </div>
      </div>

      <div className="tour-grid">
        {tourLocations.map((loc, index) => (
          <Link key={index} to={`/virtual-tour/${loc.id}`} className="tour-card" style={{ textDecoration: 'none' }}>
            <div className="tour-card-icon" style={{ color: loc.color }}>
              {loc.icon}
            </div>
            <h2 className="tour-card-title">{loc.title}</h2>
            <button className="btn btn-primary btn-sm btn-tour">Enter Tour</button>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default VirtualTour;
