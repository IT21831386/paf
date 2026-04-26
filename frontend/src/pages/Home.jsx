import { Link } from 'react-router-dom';
import { FaBuilding, FaUserShield, FaTools, FaArrowRight, FaStreetView } from 'react-icons/fa';
import './Home.css';

function Home() {
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart Campus
            <span className="hero-highlight"> Operations Hub</span>
          </h1>
          <p className="hero-subtitle">
            Streamline your university's facility management, visitor access, and campus operations in one unified platform.
          </p>
        </div>
      </section>

      <section className="modules-section">
        <h2 className="section-title">Modules</h2>
        <div className="modules-grid">
          <Link to="/resources" className="module-card">
            <div className="module-icon" style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)' }}>
              <FaBuilding size={28} />
            </div>
            <h3>Facilities & Assets</h3>
            <p>Manage bookable resources — lecture halls, labs, meeting rooms, and equipment.</p>
            <span className="module-link">
              Explore <FaArrowRight size={12} />
            </span>
          </Link>

          <Link to="/tickets" className="module-card">
            <div className="module-icon" style={{ background: 'linear-gradient(135deg, #f97316, #eab308)' }}>
              <FaTools size={28} />
            </div>
            <h3>Maintenance & Tickets</h3>
            <p>Report incidents, track repairs, and communicate with technicians.</p>
            <span className="module-link">
              Explore <FaArrowRight size={12} />
            </span>
          </Link>

          <Link to="/visitor-requests" className="module-card">
            <div className="module-icon" style={{ background: 'linear-gradient(135deg, #f093fb, #f5576c)' }}>
              <FaUserShield size={28} />
            </div>
            <h3>Visitor & Event Access</h3>
            <p>Submit and manage visitor access requests with digital passes and QR verification.</p>
            <span className="module-link">
              Explore <FaArrowRight size={12} />
            </span>
          </Link>

          <Link to="/virtual-tour" className="module-card">
            <div className="module-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <FaStreetView size={28} />
            </div>
            <h3>Virtual Tour</h3>
            <p>Explore the campus with interactive 360° views and guided navigation maps.</p>
            <span className="module-link">
              Explore <FaArrowRight size={12} />
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
