import { Link, useLocation } from 'react-router-dom';
import { FaBuilding, FaUserShield, FaHome, FaTools } from 'react-icons/fa';
import './Navbar.css';

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">🏛️</span>
          <span className="brand-text">Smart Campus Hub</span>
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <FaHome /> <span>Home</span>
        </Link>
        <Link to="/resources" className={`nav-link ${isActive('/resources') ? 'active' : ''}`}>
          <FaBuilding /> <span>Facilities</span>
        </Link>
        <Link to="/tickets" className={`nav-link ${isActive('/tickets') ? 'active' : ''}`}>
          <FaTools /> <span>Tickets</span>
        </Link>
        <Link to="/visitor-requests" className={`nav-link ${isActive('/visitor-requests') ? 'active' : ''}`}>
          <FaUserShield /> <span>Visitor Access</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;
