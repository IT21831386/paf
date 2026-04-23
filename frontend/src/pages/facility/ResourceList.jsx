import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllResources, deleteResource } from '../../api/services';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import './Facility.css';

function ResourceList() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchName) params.name = searchName;
      if (filterType) params.type = filterType;
      if (filterStatus) params.status = filterStatus;
      if (filterLocation) params.location = filterLocation;

      const response = await getAllResources(params);
      setResources(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load resources. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteResource(id);
        setResources(resources.filter(r => r.id !== id));
      } catch (err) {
        alert('Failed to delete resource.');
        console.error(err);
      }
    }
  };

  const clearFilters = () => {
    setSearchName('');
    setFilterType('');
    setFilterStatus('');
    setFilterLocation('');
    setTimeout(() => fetchResources(), 0);
  };

  const getStatusBadge = (status) => {
    const classes = {
      ACTIVE: 'badge badge-success',
      OUT_OF_SERVICE: 'badge badge-danger',
    };
    return <span className={classes[status] || 'badge'}>{status}</span>;
  };

  const getTypeBadge = (type) => {
    const labels = {
      LECTURE_HALL: '🏫 Lecture Hall',
      LAB: '🔬 Lab',
      MEETING_ROOM: '🤝 Meeting Room',
      EQUIPMENT: '📷 Equipment',
    };
    return <span className="badge badge-type">{labels[type] || type}</span>;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Facilities & Assets</h1>
          <p className="page-subtitle">Manage bookable campus resources</p>
        </div>
        <Link to="/resources/new" className="btn btn-primary">
          <FaPlus /> Add Resource
        </Link>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="search-input"
          />
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> Filters
        </button>
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {showFilters && (
        <div className="filters-panel">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
            <option value="">All Types</option>
            <option value="LECTURE_HALL">Lecture Hall</option>
            <option value="LAB">Lab</option>
            <option value="MEETING_ROOM">Meeting Room</option>
            <option value="EQUIPMENT">Equipment</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="OUT_OF_SERVICE">Out of Service</option>
          </select>
          <input
            type="text"
            placeholder="Filter by location..."
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            className="filter-select"
          />
          <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear</button>
        </div>
      )}

      {loading && <div className="loading-spinner">Loading resources...</div>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && resources.length === 0 && (
        <div className="empty-state">
          <p>No resources found. Add your first resource to get started!</p>
          <Link to="/resources/new" className="btn btn-primary"><FaPlus /> Add Resource</Link>
        </div>
      )}

      {!loading && !error && resources.length > 0 && (
        <div className="resource-grid">
          {resources.map((resource) => (
            <div key={resource.id} className="resource-card">
              <div className="card-header">
                <h3 className="card-title">{resource.name}</h3>
                {getStatusBadge(resource.status)}
              </div>
              <div className="card-body">
                {getTypeBadge(resource.type)}
                <div className="card-details">
                  <span>📍 {resource.location}</span>
                  <span>👥 Capacity: {resource.capacity}</span>
                </div>
                {resource.description && (
                  <p className="card-description">{resource.description}</p>
                )}
                {resource.availabilityWindows && resource.availabilityWindows.length > 0 && (
                  <div className="card-availability">
                    <span className="availability-label">Availability:</span>
                    {resource.availabilityWindows.map((window, i) => (
                      <span key={i} className="availability-tag">{window}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="card-actions">
                <Link to={`/resources/edit/${resource.id}`} className="btn btn-sm btn-ghost">
                  <FaEdit /> Edit
                </Link>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(resource.id, resource.name)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResourceList;
