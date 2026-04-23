import api from './axiosInstance';

// ==================== MODULE A: RESOURCES ====================

export const getAllResources = (params) => api.get('/resources', { params });
export const getResourceById = (id) => api.get(`/resources/${id}`);
export const createResource = (data) => api.post('/resources', data);
export const updateResource = (id, data) => api.put(`/resources/${id}`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}`);


// ==================== MODULE C: TICKETS ====================

export const getAllTickets = (params) => api.get('/tickets', { params });
export const getTicketById = (id) => api.get(`/tickets/${id}`);
export const getMyTickets = (userId) => api.get(`/tickets/my/${userId}`);
export const createTicket = (formData) => api.post('/tickets', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateTicket = (id, data) => api.put(`/tickets/${id}`, data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`);
export const assignTicket = (id, technicianId) => api.put(`/tickets/${id}/assign`, { technicianId });
export const updateTicketStatus = (id, status, notes) => api.put(`/tickets/${id}/status`, { status, notes });

// ==================== MODULE C: COMMENTS ====================

export const getComments = (ticketId) => api.get(`/tickets/${ticketId}/comments`);
export const addComment = (ticketId, comment) => api.post(`/tickets/${ticketId}/comments`, comment);
export const updateComment = (ticketId, commentId, userId, content) =>
  api.put(`/tickets/${ticketId}/comments/${commentId}`, { userId, content });
export const deleteComment = (ticketId, commentId, userId) =>
  api.delete(`/tickets/${ticketId}/comments/${commentId}`, { params: { userId } });


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
