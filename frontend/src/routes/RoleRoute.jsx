import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function RoleRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Chargement...</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
}