import api from './axiosInstance';

// ==================== MODULE A: RESOURCES ====================

export const getAllResources = (params) => api.get('/resources', { params });
export const getResourceById = (id) => api.get(`/resources/${id}`);
export const createResource = (data) => api.post('/resources', data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);

// ==================== MODULE D: NOTIFICATIONS ====================

export const getUserNotifications = (userId) => api.get(`/notifications/${userId}`);
export const getUnreadNotifications = (userId) => api.get(`/notifications/${userId}/unread`);
export const getUnreadCount = (userId) => api.get(`/notifications/${userId}/unread-count`);
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllNotificationsRead = (userId) => api.put(`/notifications/${userId}/read-all`);
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ==================== MODULE E: AUTH ====================

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const getCurrentUser = (id) => api.get(`/auth/me/${id}`);
export const getAllUsers = () => api.get('/auth/users');
export const updateUserRole = (id, role) => api.put(`/auth/users/${id}/role`, { role });
export const updateUserProfile = (id, data) => api.put(`/auth/users/${id}/profile`, data);
export const deleteUser = (id) => api.delete(`/auth/users/${id}`);


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
