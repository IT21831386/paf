import api from './axiosInstance';

// ==================== MODULE A: RESOURCES ====================

export const getAllResources = (params) => api.get('/resources', { params });
export const getResourceById = (id) => api.get(`/resources/${id}`);
export const createResource = (data) => api.post('/resources', data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);

// ==================== MODULE F: VISITOR REQUESTS ====================

export const getAllVisitorRequests = (params) => api.get('/visitor-requests', { params });
export const getVisitorRequestById = (id) => api.get(`/visitor-requests/${id}`);
export const getMyVisitorRequests = (userId) => api.get(`/visitor-requests/my/${userId}`);
export const createVisitorRequest = (data) => api.post('/visitor-requests', data);
export const updateVisitorRequest = (id, data) => api.put(`/visitor-requests/${id}`, data);
export const deleteVisitorRequest = (id) => api.delete(`/visitor-requests/${id}`);
export const approveVisitorRequest = (id) => api.put(`/visitor-requests/${id}/approve`);
export const rejectVisitorRequest = (id, reason) => api.put(`/visitor-requests/${id}/reject`, { reason });
export const checkInVisitorRequest = (id) => api.put(`/visitor-requests/${id}/check-in`);
export const checkOutVisitorRequest = (id) => api.put(`/visitor-requests/${id}/check-out`);
