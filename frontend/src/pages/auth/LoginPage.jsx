import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../../api/services';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import './Auth.css';

function LoginPage() {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      let response;
      if (isRegister) {
        response = await registerUser(formData);
        setSuccess('Account created! You can now log in.');
        setIsRegister(false);
      } else {
        response = await loginUser({ email: formData.email, password: formData.password });
        const user = response.data;
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
        window.location.reload(); // refresh navbar
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <span className="auth-logo">🏛️</span>
          <h1>{isRegister ? 'Create Account' : 'Welcome Back'}</h1>
          <p>{isRegister ? 'Sign up for Smart Campus Hub' : 'Sign in to your account'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" required={isRegister}
                value={formData.name} onChange={handleChange} placeholder="Your full name" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input id="email" name="email" type="email" required
              value={formData.email} onChange={handleChange} placeholder="you@example.com" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required
              value={formData.password} onChange={handleChange} placeholder="••••••••" />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {isRegister ? <FaUserPlus /> : <FaSignInAlt />}
            {loading ? 'Please wait...' : (isRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="auth-switch">
          {isRegister ? (
            <p>Already have an account? <button onClick={() => { setIsRegister(false); setError(null); }}>Sign In</button></p>
          ) : (
            <p>Don't have an account? <button onClick={() => { setIsRegister(true); setError(null); }}>Sign Up</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
