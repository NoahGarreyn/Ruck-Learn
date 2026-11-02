import { Outlet } from 'react-router-dom';
import MainLayout from './MainLayout';
import Sidebar from '../components/common/Sidebar';
import styles from './AdminLayout.module.css';

const adminLinks = [
  { to: '/admin', label: 'Tableau de bord', end: true },
  { to: '/admin/utilisateurs', label: 'Utilisateurs' },
  { to: '/admin/formations', label: 'Formations' },
  { to: '/admin/suivi', label: 'Suivi des élèves' },
  { to: '/admin/agenda', label: 'Agenda' },
  { to: '/admin/messages', label: 'Messagerie' },
];

function AdminLayout() {
  return (
    <MainLayout>
      <div className={styles.layout}>
        <Sidebar links={adminLinks} />
        <div className={styles.page}>
          <Outlet />
        </div>
      </div>
    </MainLayout>
  );
}

export default AdminLayout;