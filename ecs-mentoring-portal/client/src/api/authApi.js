import api from './axiosInstance';
export const loginUser = (data) => api.post('/auth/login', data);
export const refreshToken = (refreshToken) => api.post('/auth/refresh', { refreshToken });
export const logoutUser = () => api.post('/auth/logout');
export const getMe = () => api.get('/auth/me');
export const changePassword = (data) => api.put('/auth/change-password', data);
