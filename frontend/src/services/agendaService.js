import api from './api';

export const getEvents = () => api.get('/agenda').then((res) => res.data);

export const createEvent = (data) => api.post('/agenda', data).then((res) => res.data);

export const deleteEvent = (id) => api.delete(`/agenda/${id}`).then((res) => res.data);