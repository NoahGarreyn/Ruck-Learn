import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';
import Sidebar from '../components/common/Sidebar';
import styles from './AdminLayout.module.css';

const profLinks = [
  { to: '/prof', label: 'Tableau de bord', end: true },
  { to: '/prof/cours', label: 'Cours' },
  { to: '/prof/devoirs', label: 'Devoirs' },
  { to: '/prof/quiz', label: 'Quiz' },
  { to: '/prof/suivi', label: 'Suivi des élèves' },
  { to: '/prof/agenda', label: 'Agenda' },
  { to: '/prof/messages', label: 'Messagerie' },
];

function ProfLayout() {
  return (
    <MainLayout>
      <div className={styles.layout}>
        <Sidebar links={profLinks} />
        <div className={styles.page}>
          <Outlet />
        </div>
      </div>
    </MainLayout>
  );
}

export default ProfLayout;