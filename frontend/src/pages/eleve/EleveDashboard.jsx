import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAssignments } from '../../services/assignmentService';
import { getQuizzes } from '../../services/quizService';
import { getMesSoumissions } from '../../services/submissionService';
import { getCourses } from '../../services/courseService';
import { getMyProgress } from '../../services/progressService';
import { getNonLus } from '../../services/messageService';
import StatCard from '../../components/common/StatCard';
import UpcomingEvents from '../../components/common/UpcomingEvents';
import styles from '../../components/common/Dashboard.module.css';

// Si un appel échoue, on remplace son résultat par une valeur vide au lieu de
// casser tout le dashboard : les autres blocs continuent de s'afficher.
const safe = (promise, fallback) => promise.catch(() => fallback);

// "dans 5 h", "dans 3 j"...
const remaining = (dateStr) => {
  const hours = Math.floor((new Date(dateStr) - new Date()) / 3600000);
  if (hours < 1) return 'dans moins d\'1 h';
  if (hours < 24) return `dans ${hours} h`;
  return `dans ${Math.floor(hours / 24)} j`;
};

// Moins de 48 h avant l'échéance = urgent
const isUrgent = (dateStr) => new Date(dateStr) - new Date() < 48 * 3600000;

function EleveDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      safe(getAssignments(), []),
      safe(getQuizzes(), []),
      safe(getMesSoumissions(), []),
      safe(getCourses(), []),
      safe(getMyProgress(), []),
      safe(getNonLus(), { nonLus: 0 }),
    ]).then(([devoirs, quizzes, subs, courses, progress, unread]) => {
      const now = new Date();

      // Ensembles d'ids déjà rendus (un Set permet un test d'appartenance direct)
      const devoirsRendus = new Set(
        subs.filter((s) => s.type === 'devoir').map((s) => s.devoir?._id || s.devoir)
      );
      const quizPasses = new Set(
        subs.filter((s) => s.type === 'quiz').map((s) => s.quiz?._id || s.quiz)
      );

      // "À faire" = pas encore rendu ET échéance pas dépassée.
      // Devoirs et quiz sont fusionnés dans une seule liste triée par échéance.
      const todo = [
        ...devoirs
          .filter((d) => !devoirsRendus.has(d._id) && new Date(d.dateLimit) > now)
          .map((d) => ({ id: d._id, kind: 'devoir', titre: d.titre, dateLimit: d.dateLimit, to: '/eleve/devoirs' })),
        ...quizzes
          .filter((q) => !quizPasses.has(q._id) && new Date(q.dateLimit) > now)
          .map((q) => ({ id: q._id, kind: 'quiz', titre: q.titre, dateLimit: q.dateLimit, to: '/eleve/quiz' })),
      ].sort((a, b) => new Date(a.dateLimit) - new Date(b.dateLimit));

      // Cours terminés : on ne compte que ceux qui existent encore dans sa formation
      const courseIds = new Set(courses.map((c) => c._id));
      const completed = progress.filter(
        (p) => p.status === 'completed' && courseIds.has(p.course?._id)
      ).length;

      setData({
        todo,
        devoirsTodo: todo.filter((t) => t.kind === 'devoir').length,
        quizTodo: todo.filter((t) => t.kind === 'quiz').length,
        completed,
        totalCourses: courses.length,
        unread: unread.nonLus,
      });
    });
  }, []);

  if (!data) return <p className={styles.empty}>Chargement...</p>;

  const pct = data.totalCourses ? Math.round((data.completed / data.totalCourses) * 100) : 0;

  return (
    <div>
      <div className={styles.header}>
        <h1>Bonjour {user.prenom}</h1>
        <p className={styles.subtitle}>Voici où tu en es.</p>
      </div>

      <div className={styles.stats}>
        <StatCard
          label="Devoirs à rendre"
          value={data.devoirsTodo}
          to="/eleve/devoirs"
          tone={data.devoirsTodo > 0 ? 'warn' : 'default'}
        />
        <StatCard label="Quiz à passer" value={data.quizTodo} to="/eleve/quiz" />
        <StatCard
          label="Messages non lus"
          value={data.unread}
          to="/eleve/messages"
          tone={data.unread > 0 ? 'warn' : 'default'}
        />
        <StatCard
          label="Cours terminés"
          value={`${data.completed}/${data.totalCourses}`}
          to="/eleve/cours"
          tone="green"
        />
      </div>

      <div className={styles.columns}>
        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>À faire</h2>
          </div>

          {data.todo.length === 0 ? (
            <p className={styles.empty}>Rien à rendre pour le moment.</p>
          ) : (
            <ul className={styles.list}>
              {data.todo.slice(0, 6).map((t) => (
                <li key={`${t.kind}-${t.id}`} className={styles.item}>
                  <div className={styles.itemMain}>
                    <Link to={t.to} className={styles.itemTitle}>{t.titre}</Link>
                    <span className={isUrgent(t.dateLimit) ? styles.urgent : styles.itemMeta}>
                      {remaining(t.dateLimit)}
                    </span>
                  </div>
                  <span className={`${styles.kind} ${styles[`kind_${t.kind}`]}`}>
                    {t.kind === 'devoir' ? 'Devoir' : 'Quiz'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Ma progression</h2>
            <Link to="/eleve/cours" className={styles.more}>Mes cours</Link>
          </div>
          {data.totalCourses === 0 ? (
            <p className={styles.empty}>Aucun cours dans ta formation pour le moment.</p>
          ) : (
            <>
              <p className={styles.progressText}>
                {data.completed} cours terminé{data.completed > 1 ? 's' : ''} sur {data.totalCourses} ({pct} %)
              </p>
              <div className={styles.bar}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
            </>
          )}
        </section>

        <UpcomingEvents agendaPath="/eleve/agenda" />
      </div>
    </div>
  );
}

export default EleveDashboard;