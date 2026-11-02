// frontend/src/services/formationService.js
import api from './api';

export const getFormations = () => api.get('/formations').then((res) => res.data);

export const createFormation = (data) =>
  api.post('/formations', data).then((res) => res.data);

export const updateFormation = (id, data) =>
  api.put(`/formations/${id}`, data).then((res) => res.data);

export const archiveFormation = (id) =>
  api.put(`/formations/${id}/archiver`).then((res) => res.data);