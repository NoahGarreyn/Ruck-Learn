import api from './api';

export const createUser = (userData) =>
  api.post('/auth/register', userData).then((res) => res.data);

export const getUsers = () => api.get('/users').then((res) => res.data);