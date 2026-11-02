import api from './api';

// --- Élève ---
export const getMesSoumissions = () =>
  api.get('/submissions/mes-soumissions').then((res) => res.data);

export const soumettreDevoir = (devoirId, data) => {
  const formData = new FormData();
  formData.append('contenu', data.contenu);
  data.fichiers.forEach((file) => {
    formData.append('fichiers', file);
  });
  return api.post(`/submissions/devoir/${devoirId}`, formData).then((res) => res.data);
};

// --- Prof ---
export const getSubmissionsDevoir = (devoirId) =>
  api.get(`/submissions/devoir/${devoirId}`).then((res) => res.data);

export const noterDevoir = (submissionId, data) =>
  api.put(`/submissions/${submissionId}/noter`, data).then((res) => res.data);