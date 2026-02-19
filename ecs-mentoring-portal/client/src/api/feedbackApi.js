import api from './axiosInstance';
export const submitFeedback = (data) => api.post('/feedback', data);
export const getSessionFeedback = (sessionId) => api.get(`/feedback/session/${sessionId}`);
export const getStudentFeedback = (studentId) => api.get(`/feedback/student/${studentId}`);
