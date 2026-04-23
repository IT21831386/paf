import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUserShield, FaHome, FaSignInAlt, FaUsers, FaTools } from 'react-icons/fa';
import NotificationPanel from '../pages/notification/NotificationPanel';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname.startsWith(path);

  // Get logged in user from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

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
        {user && user.role === 'ADMIN' && (
          <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
            <FaUsers /> <span>Users</span>
          </Link>
        )}
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <NotificationPanel userId={user.id} />
            <div className="nav-user">
              <span className="nav-user-name">{user.name}</span>
              <span className="nav-user-role">{user.role}</span>
            </div>
            <button className="nav-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            <FaSignInAlt /> Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
