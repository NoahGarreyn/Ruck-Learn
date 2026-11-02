import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}