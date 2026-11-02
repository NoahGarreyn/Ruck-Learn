// frontend/src/layouts/MainLayout.jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './MainLayout.module.css';

// Layout partagé par les 3 rôles : affiche une barre en haut avec
// le nom de l'utilisateur connecté et un bouton de déconnexion.
// Chaque dashboard (admin/prof/eleve) sera "enveloppé" dans ce layout.
function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <header className={styles.navbar}>
        <span className={styles.logo}>RuckLearn</span>
        <div className={styles.userInfo}>
          <span>{user?.prenom} {user?.nom} <em className={styles.role}>({user?.role})</em></span>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>
      <main className={styles.content}>{children}</main>
    </div>
  );
}

export default MainLayout;