import api from './api';

// Élève : enregistre l'ouverture d'un cours (crée ou met à jour la progression)
export const openCourse = (courseId) =>
  api.post(`/progress/${courseId}`).then((res) => res.data);

// Élève : marque un cours comme terminé (la réponse contient { progress })
export const finishCourse = (courseId) =>
  api.put(`/progress/${courseId}/terminer`).then((res) => res.data);

// Élève : sa progression sur tous ses cours
export const getMyProgress = () => api.get('/progress').then((res) => res.data);

// Prof / admin : suivi agrégé par élève
export const getSuivi = () => api.get('/progress/suivi').then((res) => res.data);