import api from './api';

export const getConversations = () => api.get('/messages').then((res) => res.data);
export const getConversation = (userId) => api.get(`/messages/${userId}`).then((res) => res.data);
export const getContacts = () => api.get('/messages/contacts').then((res) => res.data);
export const getNonLus = () => api.get('/messages/non-lus').then((res) => res.data);

export const sendMessage = (destinataire, contenu) =>
  api.post('/messages', { destinataire, contenu }).then((res) => res.data);