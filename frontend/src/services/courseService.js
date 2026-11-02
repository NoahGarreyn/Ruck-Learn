// frontend/src/services/courseService.js
import api from './api';

export const getCourses = () => api.get('/cours').then((res) => res.data);
export const getCourseById = (id) => api.get(`/cours/${id}`).then((res) => res.data);

// Upload de fichiers = obligatoirement multipart/form-data, pas du JSON.
// On utilise FormData au lieu d'un objet classique, et axios détecte
// automatiquement le bon Content-Type quand on lui passe un FormData.
export const createCourse = (data) => {
  const formData = new FormData();
  formData.append('titre', data.titre);
  formData.append('description', data.description);
  formData.append('contenu', data.contenu);
  formData.append('formation', data.formation);

  // Chaque fichier est ajouté sous la même clé "fichiers" —
  // c'est ce qui permet à multer de les recevoir tous via upload.array('fichiers').
  data.fichiers.forEach((file) => {
    formData.append('fichiers', file);
  });

  return api.post('/cours', formData).then((res) => res.data);
};

export const updateCourse = (id, data) => api.put(`/cours/${id}`, data).then((res) => res.data);
export const deleteCourse = (id) => api.delete(`/cours/${id}`).then((res) => res.data);