import api from './api';

export const getQuizzes = () => api.get('/quiz').then((res) => res.data);
export const getQuizById = (id) => api.get(`/quiz/${id}`).then((res) => res.data);

export const createQuiz = (data) => api.post('/quiz', data).then((res) => res.data);

// reponses = tableau de tableaux d'index, un par question (ex: [[2], [0, 3]])
export const submitQuiz = (id, reponses) =>
  api.post(`/quiz/${id}/soumettre`, { reponses }).then((res) => res.data);

// Correction détaillée (élève, uniquement après avoir soumis le quiz)
export const getCorrection = (id) =>
  api.get(`/quiz/${id}/correction`).then((res) => res.data);

export const getQuizResults = (id) =>
  api.get(`/quiz/${id}/resultats`).then((res) => res.data);