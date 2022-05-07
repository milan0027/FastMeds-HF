import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/v1/',
  // Use http://localhost:5000/v1/ in development
  // Use https://cdc-portal-believers.herokuapp.com/ in production
});

export const signIn = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);
export const forgotPassword = (formData) => API.post('/auth/forgot-password', formData);
export const resetPassword = (formData, token) => API.post(`/auth/reset-password?token=${token}`, formData);
export const signOut = (formData) => API.post('/auth/logout', formData);

export const getUserById = (id) => API.get(`/users/${id}`);

export const updateInv = (formData) => API.put('/search/addItem', formData);
