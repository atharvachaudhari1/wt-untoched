import api from './axiosInstance';
export const getSessionAttendance = (sessionId) => api.get(`/attendance/session/${sessionId}`);
export const bulkMarkAttendance = (sessionId, records) => api.post(`/attendance/session/${sessionId}`, { records });
export const updateAttendance = (id, data) => api.put(`/attendance/${id}`, data);
export const getStudentAttendanceSummary = (studentId) => api.get(`/attendance/student/${studentId}/summary`);
