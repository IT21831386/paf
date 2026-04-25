import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, allowedRoles }) {
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check (if specified)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="page-container">
        <div className="error-message" style={{ textAlign: 'center', marginTop: '4rem' }}>
          <h2>🚫 Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Required role: {allowedRoles.join(' or ')} — Your role: {user.role}
          </p>
        </div>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;
