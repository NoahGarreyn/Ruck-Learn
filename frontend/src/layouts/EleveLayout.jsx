import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';
import Sidebar from '../components/common/Sidebar';
import styles from './AdminLayout.module.css';

const eleveLinks = [
  { to: '/eleve', label: 'Tableau de bord', end: true },
  { to: '/eleve/cours', label: 'Mes cours' },
  { to: '/eleve/devoirs', label: 'Mes devoirs' },
  { to: '/eleve/quiz', label: 'Mes quiz' },
  { to: '/eleve/agenda', label: 'Agenda' },
  { to: '/eleve/messages', label: 'Messagerie' },
];

function EleveLayout() {
  return (
    <MainLayout>
      <div className={styles.layout}>
        <Sidebar links={eleveLinks} />
        <div className={styles.page}>
          <Outlet />
        </div>
      </div>
    </MainLayout>
  );
}

export default EleveLayout;