import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUsers } from '../../services/userService';
import { getFormations } from '../../services/formationService';
import { getCourses } from '../../services/courseService';
import { getAssignments } from '../../services/assignmentService';
import { getQuizzes } from '../../services/quizService';
import { getNonLus } from '../../services/messageService';
import StatCard from '../../components/common/StatCard';
import UpcomingEvents from '../../components/common/UpcomingEvents';
import styles from '../../components/common/Dashboard.module.css';

const safe = (promise, fallback) => promise.catch(() => fallback);

function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      safe(getUsers(), []),
      safe(getFormations(), []),
      safe(getCourses(), []),
      safe(getAssignments(), []),
      safe(getQuizzes(), []),
      safe(getNonLus(), { nonLus: 0 }),
    ]).then(([users, formations, courses, devoirs, quizzes, unread]) => {
      const eleves = users.filter((u) => u.role === 'eleve');

      // Élèves par formation : GET /users renvoie l'id de la formation
      // (non peuplé), on le compare donc à l'id de chaque formation active.
      const parFormation = formations.map((f) => ({
        id: f._id,
        nom: f.nom,
        count: eleves.filter((e) => e.formation === f._id).length,
      }));
      const rattaches = parFormation.reduce((sum, f) => sum + f.count, 0);

      setData({
        eleves: eleves.length,
        profs: users.filter((u) => u.role === 'prof').length,
        formations: formations.length,
        courses: courses.length,
        devoirs: devoirs.length,
        quizzes: quizzes.length,
        unread: unread.nonLus,
        parFormation,
        // élèves sans formation, ou rattachés à une formation archivée
        sansFormation: eleves.length - rattaches,
      });
    });
  }, []);

  if (!data) return <p className={styles.empty}>Chargement...</p>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Bonjour {user.prenom}</h1>
        <p className={styles.subtitle}>Vue d'ensemble de la plateforme.</p>
      </div>

      <div className={styles.stats}>
        <StatCard label="Élèves" value={data.eleves} to="/admin/utilisateurs" />
        <StatCard label="Professeurs" value={data.profs} to="/admin/utilisateurs" />
        <StatCard label="Formations actives" value={data.formations} to="/admin/formations" tone="green" />
        <StatCard label="Cours" value={data.courses} />
        <StatCard label="Devoirs" value={data.devoirs} />
        <StatCard label="Quiz" value={data.quizzes} />
        <StatCard
          label="Messages non lus"
          value={data.unread}
          to="/admin/messages"
          tone={data.unread > 0 ? 'warn' : 'default'}
        />
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Élèves par formation</h2>
            <Link to="/admin/formations" className={styles.more}>Gérer</Link>
          </div>

          {data.parFormation.length === 0 ? (
            <p className={styles.empty}>Aucune formation active.</p>
          ) : (
            <ul className={styles.list}>
              {data.parFormation.map((f) => (
                <li key={f.id} className={styles.item}>
                  <span className={styles.itemTitle}>{f.nom}</span>
                  <span className={styles.count}>{f.count}</span>
                </li>
              ))}
              {data.sansFormation > 0 && (
                <li className={styles.item}>
                  <span className={styles.itemMeta}>Sans formation active</span>
                  <span className={styles.count}>{data.sansFormation}</span>
                </li>
              )}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Raccourcis</h2>
          </div>
          <div className={styles.shortcuts}>
            <Link to="/admin/utilisateurs" className={styles.shortcut}>Créer un compte</Link>
            <Link to="/admin/formations" className={styles.shortcut}>Gérer les formations</Link>
            <Link to="/admin/suivi" className={styles.shortcut}>Suivi des élèves</Link>
            <Link to="/admin/agenda" className={styles.shortcut}>Agenda</Link>
          </div>
        </section>

        <UpcomingEvents agendaPath="/admin/agenda" />
      </div>
    </div>
  );
}

export default AdminDashboard;