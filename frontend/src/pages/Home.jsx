// frontend/src/pages/Home.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Cette page ne s'affiche jamais réellement — elle sert uniquement
// de "routeur" : elle redirige immédiatement vers le bon dashboard
// selon le rôle de l'utilisateur connecté.
function Home() {
  const { user } = useAuth();

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'prof') return <Navigate to="/prof" replace />;
  return <Navigate to="/eleve" replace />;
}

export default Home;