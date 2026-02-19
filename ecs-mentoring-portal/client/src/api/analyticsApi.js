import api from './axiosInstance';
export const getOverview = () => api.get('/analytics/overview');
export const getAttendanceTrends = () => api.get('/analytics/attendance');
export const getHealthScoreDistribution = () => api.get('/analytics/health-scores');
export const getActivityTimeline = (params) => api.get('/analytics/activity-timeline', { params });
export const getMentorPerformance = () => api.get('/analytics/mentor-performance');
