import api from './api';

export const getAssignments = () => api.get('/devoirs').then((res) => res.data);
export const getAssignmentById = (id) => api.get(`/devoirs/${id}`).then((res) => res.data);

// Upload de fichiers = obligatoirement multipart/form-data, pas du JSON.
export const createAssignment = (data) => {
  const formData = new FormData();
  formData.append('titre', data.titre);
  formData.append('description', data.description);
  formData.append('formation', data.formation);
  formData.append('dateLimit', data.dateLimit);

  data.fichiers.forEach((file) => {
    formData.append('fichiers', file);
  });

  return api.post('/devoirs', formData).then((res) => res.data);
};

export const updateAssignment = (id, data) =>
  api.put(`/devoirs/${id}`, data).then((res) => res.data);

export const deleteAssignment = (id) =>
  api.delete(`/devoirs/${id}`).then((res) => res.data);