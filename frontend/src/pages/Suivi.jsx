import { useState, useEffect } from 'react';
import { getSuivi } from '../services/progressService';
import { getFormations } from '../services/formationService';
import styles from './Suivi.module.css';

const STATUS_LABELS = {
  not_started: 'Non commencé',
  in_progress: 'En cours',
  completed: 'Terminé',
};

const STATUS_CLASS = {
  not_started: 'statusNone',
  in_progress: 'statusProgress',
  completed: 'statusDone',
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

// Une ligne par élève, dépliable pour voir le détail cours par cours
function StudentRow({ item, formationName }) {
  const [open, setOpen] = useState(false);
  const { eleve, total, completed, inProgress, courses } = item;
  const pct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className={styles.row}>
      <button className={styles.rowHead} onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <div className={styles.who}>
          <span className={styles.name}>{eleve.prenom} {eleve.nom}</span>
          <span className={styles.sub}>{eleve.email} · {formationName || '—'}</span>
        </div>

        <div className={styles.progressCol}>
          {total === 0 ? (
            <span className={styles.sub}>Aucun cours dans sa formation</span>
          ) : (
            <>
              <div className={styles.bar}>
                <div className={styles.barFill} style={{ width: `${pct}%` }} />
              </div>
              <span className={styles.sub}>
                {completed}/{total} terminé{completed > 1 ? 's' : ''}
                {inProgress > 0 && ` · ${inProgress} en cours`}
              </span>
            </>
          )}
        </div>

        <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
      </button>

      {open && total > 0 && (
        <ul className={styles.detail}>
          {courses.map((c) => (
            <li key={c.course._id} className={styles.detailItem}>
              <span className={styles.detailTitle}>{c.course.titre}</span>
              <span className={styles.detailMeta}>
                {c.status === 'completed' && c.completedAt && `le ${formatDate(c.completedAt)}`}
                {c.status === 'in_progress' && c.lastViewedAt && `vu le ${formatDate(c.lastViewedAt)}`}
              </span>
              <span className={`${styles.status} ${styles[STATUS_CLASS[c.status]]}`}>
                {STATUS_LABELS[c.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Suivi() {
  const [students, setStudents] = useState([]);
  const [formations, setFormations] = useState([]);
  const [filter, setFilter] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSuivi(), getFormations()])
      .then(([suiviData, formationsData]) => {
        setStudents(suiviData);
        setFormations(formationsData);
      })
      .catch(() => setError('Impossible de charger le suivi.'))
      .finally(() => setLoading(false));
  }, []);

  const formationsMap = formations.reduce((acc, f) => {
    acc[f._id] = f.nom;
    return acc;
  }, {});

  const visible = filter ? students.filter((s) => s.eleve.formation === filter) : students;

  // Progression moyenne, calculée uniquement sur les élèves qui ont des cours
  const withCourses = visible.filter((s) => s.total > 0);
  const average = withCourses.length
    ? Math.round(
        (withCourses.reduce((sum, s) => sum + s.completed / s.total, 0) / withCourses.length) * 100
      )
    : null;

  return (
    <div>
      <h1>Suivi des élèves</h1>
      <p className={styles.subtitle}>
        Avancement de chaque élève sur les cours de sa formation.
      </p>

      {error && <p className={styles.error}>{error}</p>}
      {loading && !error && <p className={styles.empty}>Chargement...</p>}

      {!loading && !error && (
        <>
          <div className={styles.toolbar}>
            <select
              className={styles.select}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filtrer par formation"
            >
              <option value="">Toutes les formations</option>
              {formations.map((f) => (
                <option key={f._id} value={f._id}>{f.nom}</option>
              ))}
            </select>

            <p className={styles.stats}>
              {visible.length} élève{visible.length > 1 ? 's' : ''}
              {average !== null && <> · progression moyenne <strong>{average}%</strong></>}
            </p>
          </div>

          {visible.length === 0 ? (
            <p className={styles.empty}>Aucun élève à afficher.</p>
          ) : (
            <div className={styles.list}>
              {visible.map((item) => (
                <StudentRow
                  key={item.eleve._id}
                  item={item}
                  formationName={formationsMap[item.eleve.formation]}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Suivi;