import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAssignments } from '../../services/assignmentService';
import { getQuizzes } from '../../services/quizService';
import { getSubmissionsDevoir } from '../../services/submissionService';
import { getCourses } from '../../services/courseService';
import { getSuivi } from '../../services/progressService';
import { getNonLus } from '../../services/messageService';
import StatCard from '../../components/common/StatCard';
import UpcomingEvents from '../../components/common/UpcomingEvents';
import styles from '../../components/common/Dashboard.module.css';

const safe = (promise, fallback) => promise.catch(() => fallback);

function ProfDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    // `cancelled` évite de mettre à jour l'état si on quitte la page
    // avant la fin des requêtes.
    let cancelled = false;

    const load = async () => {
      const [courses, devoirs, quizzes, unread, suivi] = await Promise.all([
        safe(getCourses(), []),
        safe(getAssignments(), []),
        safe(getQuizzes(), []),
        safe(getNonLus(), { nonLus: 0 }),
        safe(getSuivi(), []),
      ]);

      // Soumissions de chaque devoir (une requête par devoir, en parallèle).
      // Une soumission est "à corriger" tant que sa note est vide.
      const lists = await Promise.all(
        devoirs.map((d) => safe(getSubmissionsDevoir(d._id), []))
      );
      const pending = devoirs
        .map((d, i) => ({ devoir: d, count: lists[i].filter((s) => s.note == null).length }))
        .filter((x) => x.count > 0);

      // Progression moyenne, uniquement sur les élèves qui ont au moins un cours
      const withCourses = suivi.filter((s) => s.total > 0);
      const average = withCourses.length
        ? Math.round(
            (withCourses.reduce((sum, s) => sum + s.completed / s.total, 0) / withCourses.length) * 100
          )
        : null;

      if (!cancelled) {
        setData({
          pending,
          totalPending: pending.reduce((sum, x) => sum + x.count, 0),
          courses: courses.length,
          devoirs: devoirs.length,
          quizzes: quizzes.length,
          unread: unread.nonLus,
          average,
        });
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  if (!data) return <p className={styles.empty}>Chargement...</p>;

  return (
    <div>
      <div className={styles.header}>
        <h1>Bonjour {user.prenom}</h1>
        <p className={styles.subtitle}>Voici l'activité de tes formations.</p>
      </div>

      <div className={styles.stats}>
        <StatCard
          label="Devoirs à corriger"
          value={data.totalPending}
          to="/prof/devoirs"
          tone={data.totalPending > 0 ? 'warn' : 'default'}
        />
        <StatCard
          label="Messages non lus"
          value={data.unread}
          to="/prof/messages"
          tone={data.unread > 0 ? 'warn' : 'default'}
        />
        <StatCard
          label="Progression moyenne"
          value={data.average === null ? '—' : `${data.average} %`}
          to="/prof/suivi"
          tone="green"
        />
        <StatCard label="Cours" value={data.courses} to="/prof/cours" />
        <StatCard label="Devoirs" value={data.devoirs} to="/prof/devoirs" />
        <StatCard label="Quiz" value={data.quizzes} to="/prof/quiz" />
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>À corriger</h2>
          </div>

          {data.pending.length === 0 ? (
            <p className={styles.empty}>Toutes les soumissions sont corrigées.</p>
          ) : (
            <ul className={styles.list}>
              {data.pending.map(({ devoir, count }) => (
                <li key={devoir._id} className={styles.item}>
                  <div className={styles.itemMain}>
                    <Link to={`/prof/devoirs/${devoir._id}/soumissions`} className={styles.itemTitle}>
                      {devoir.titre}
                    </Link>
                    <span className={styles.itemMeta}>
                      {count} soumission{count > 1 ? 's' : ''} en attente
                    </span>
                  </div>
                  <span className={styles.count}>{count}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <UpcomingEvents agendaPath="/prof/agenda" />
      </div>
    </div>
  );
}

export default ProfDashboard;