import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaBuilding, FaUserShield, FaHome, FaSignInAlt, FaUsers, FaTools, FaChartBar, FaUser, FaBell, FaCalendarAlt, FaSignOutAlt, FaCog } from 'react-icons/fa';
import NotificationPanel from '../pages/notification/NotificationPanel';
import './Navbar.css';

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname.startsWith(path);

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // Get initials from user name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
        {user && (
          <>
            <Link to="/resources" className={`nav-link ${isActive('/resources') ? 'active' : ''}`}>
              <FaBuilding /> <span>Facilities</span>
            </Link>
            <Link to="/bookings" className={`nav-link ${isActive('/bookings') ? 'active' : ''}`}>
              <FaCalendarAlt /> <span>Bookings</span>
            </Link>
            <Link to="/tickets" className={`nav-link ${isActive('/tickets') ? 'active' : ''}`}>
              <FaTools /> <span>Tickets</span>
            </Link>
            <Link to="/visitor-requests" className={`nav-link ${isActive('/visitor-requests') ? 'active' : ''}`}>
              <FaUserShield /> <span>Visitor Access</span>
            </Link>
          </>
        )}
        {user && user.role === 'ADMIN' && (
          <Link to="/users" className={`nav-link ${isActive('/users') ? 'active' : ''}`}>
            <FaUsers /> <span>Users</span>
          </Link>
        )}
      </div>
      <div className="navbar-right">
        <button 
          className="btn btn-ghost" 
          onClick={toggleTheme} 
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          style={{ fontSize: '1.2rem', padding: '0.4rem', marginRight: '0.5rem' }}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>

        {user ? (
          <>
            <NotificationPanel userId={user.id} />

            {/* User Avatar Dropdown */}
            <div className="user-dropdown-wrapper" ref={dropdownRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="user-avatar">{getInitials(user.name)}</span>
                <span className="user-avatar-name">{user.name}</span>
                <svg className={`user-chevron ${dropdownOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 12 12">
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <span className="user-avatar user-avatar-lg">{getInitials(user.name)}</span>
                    <div>
                      <div className="user-dropdown-name">{user.name}</div>
                      <div className="user-dropdown-role">{user.role}</div>
                    </div>
                  </div>
                  <div className="user-dropdown-divider" />
                  <Link to="/profile" className="user-dropdown-item">
                    <FaUser /> My Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link to="/admin" className="user-dropdown-item">
                      <FaChartBar /> Dashboard
                    </Link>
                  )}
                  <Link to="/notifications" className="user-dropdown-item">
                    <FaBell /> Notifications
                  </Link>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                    <FaSignOutAlt /> Logout
                  </button>
                </div>
              )}
            </div>
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
