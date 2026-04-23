import { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole, deleteUser } from '../../api/services';
import { FaUsers, FaTrash } from 'react-icons/fa';
import './Auth.css';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      setUsers(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserRole(id, newRole);
      setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role.');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete user "${name}"? This cannot be undone.`)) {
      try {
        await deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const getRoleBadge = (role) => {
    const map = {
      ADMIN: 'role-badge role-admin',
      USER: 'role-badge role-user',
      TECHNICIAN: 'role-badge role-tech',
      SECURITY: 'role-badge role-security',
    };
    return <span className={map[role] || 'role-badge'}>{role}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title"><FaUsers /> User Management</h1>
          <p className="page-subtitle">Manage user accounts and role assignments</p>
        </div>
      </div>

      {loading && <div className="loading-spinner">Loading users...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="cell-bold">{user.name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="role-select"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                      <option value="TECHNICIAN">Technician</option>
                      <option value="SECURITY">Security</option>
                    </select>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(user.id, user.name)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default UserManagement;
