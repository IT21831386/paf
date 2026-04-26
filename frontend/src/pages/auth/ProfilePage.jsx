import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, updateUserProfile } from '../../api/services';
import api from '../../api/axiosInstance';
import { FaUser, FaSave, FaKey } from 'react-icons/fa';

function ProfilePage() {
  const navigate = useNavigate();
  const stored = localStorage.getItem('user');
  const loggedIn = stored ? JSON.parse(stored) : null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!loggedIn) { navigate('/login'); return; }
    const fetch = async () => {
      try {
        const res = await getCurrentUser(loggedIn.id);
        setName(res.data.name);
        setEmail(res.data.email);
        setRole(res.data.role);
      } catch { setError('Failed to load profile'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    try {
      const res = await updateUserProfile(loggedIn.id, { name });
      const updatedUser = { ...loggedIn, name: res.data.name };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setMessage(''); setError('');
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    try {
      await api.put(`/auth/users/${loggedIn.id}/change-password`, { oldPassword, newPassword });
      setMessage('Password changed successfully!');
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner">Loading profile...</div></div>;

  return (
    <div className="page-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title"><FaUser /> My Profile</h1>
          <p className="page-subtitle">{email} — {role}</p>
        </div>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      {/* Profile Info */}
      <div className="form-container" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}>Profile Information</h3>
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label>Role</label>
            <input type="text" value={role} disabled style={{ opacity: 0.6 }} />
          </div>
          <button type="submit" className="btn btn-primary">
            <FaSave /> Save Changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="form-container">
        <h3 style={{ color: '#e2e8f0', marginBottom: '1rem' }}><FaKey /> Change Password</h3>
        <form onSubmit={handleChangePassword}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary">
            <FaKey /> Change Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;
