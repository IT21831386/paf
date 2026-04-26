import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, googleSignIn } from '../../api/services';
import { FaSignInAlt, FaUserPlus } from 'react-icons/fa';
import { GoogleLogin } from '@react-oauth/google';
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

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      const response = await googleSignIn(credentialResponse.credential);
      const user = response.data;
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError('Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/');
        window.location.reload();
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

        <div className="google-auth-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError('Google Sign-In was unsuccessful')}
            theme="filled_black"
            text={isRegister ? "signup_with" : "signin_with"}
            shape="rectangular"
          />
        </div>
        
        <div className="auth-divider" style={{ textAlign: 'center', margin: '1rem 0', color: '#64748b', fontSize: '0.85rem' }}>
          <span style={{ background: '#1e1b3a', padding: '0 10px', position: 'relative', zIndex: 1 }}>or continue with email</span>
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginTop: '-10px' }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: '1.5rem' }}>
          {isRegister && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" name="name" type="text" required={isRegister} maxLength={50}
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
            <input id="password" name="password" type="password" required minLength={isRegister ? 6 : undefined}
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
