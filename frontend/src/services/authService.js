import api from './api';

export const login = (email, password) =>
  api.post('/auth/login', { email, password }).then((res) => res.data);