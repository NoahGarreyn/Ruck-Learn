// frontend/src/components/common/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

// Sidebar générique : reçoit une liste de liens en props.
// Réutilisable pour admin/prof/élève, chacun passera ses propres liens.
// "end" force NavLink à ne considérer le lien actif QUE si l'URL
// correspond exactement (sinon /admin resterait actif même sur /admin/formations).
function Sidebar({ links }) {
  return (
    <nav className={styles.sidebar}>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.active}` : styles.link
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

export default Sidebar;