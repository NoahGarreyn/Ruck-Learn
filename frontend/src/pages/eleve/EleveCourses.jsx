import { useState, useEffect } from 'react';
import { getCourses } from '../../services/courseService';
import { getMyProgress, openCourse, finishCourse } from '../../services/progressService';
import styles from './EleveCourses.module.css';

const BACKEND_URL = import.meta.env.VITE_API_URL.replace('/api', '');

const STATUS_LABELS = {
  not_started: 'Non commencé',
  in_progress: 'En cours',
  completed: 'Terminé',
};

// Nom de la classe CSS associée à chaque statut
const STATUS_CLASS = {
  not_started: 'statusNone',
  in_progress: 'statusProgress',
  completed: 'statusDone',
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });

function CourseCard({ course, progress, onProgress }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Pas de progression enregistrée = cours jamais ouvert
  const status = progress?.status || 'not_started';

  // Ouvrir le cours = on prévient le serveur, qui crée ou met à jour la progression
  const toggleOpen = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    setError(null);
    try {
      onProgress(await openCourse(course._id));
    } catch {
      setError('Ta progression n\'a pas pu être enregistrée.');
    }
  };

  const handleFinish = async () => {
    setBusy(true);
    setError(null);
    try {
      const data = await finishCourse(course._id);
      onProgress(data.progress);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setBusy(false);
    }
  };

  const openLabel = open
    ? 'Fermer le cours'
    : status === 'not_started' ? 'Commencer le cours' : 'Ouvrir le cours';

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{course.titre}</h2>
        <span className={`${styles.status} ${styles[STATUS_CLASS[status]]}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <p className={styles.cardDesc}>{course.description}</p>

      {status === 'completed' && progress?.completedAt && (
        <p className={styles.meta}>Terminé le {formatDate(progress.completedAt)}</p>
      )}

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.openBtn} onClick={toggleOpen}>{openLabel}</button>

      {open && (
        <div className={styles.body}>
          <p className={styles.cardContenu}>{course.contenu}</p>

          {course.fichiers?.length > 0 && (
            <div className={styles.files}>
              <p className={styles.filesLabel}>Fichiers joints :</p>
              <ul>
                {course.fichiers.map((f, i) => (
                  <li key={i}>
                    <a href={`${BACKEND_URL}${f.url}`} target="_blank" rel="noopener noreferrer">
                      {f.nom}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {status !== 'completed' && (
            <button className={styles.finishBtn} onClick={handleFinish} disabled={busy}>
              {busy ? '...' : '✓ Marquer comme terminé'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EleveCourses() {
  const [courses, setCourses] = useState([]);
  // progressMap : { idDuCours: progression } pour retrouver le statut d'un cours directement
  const [progressMap, setProgressMap] = useState({});
  const [message, setMessage] = useState(null);

  useEffect(() => {
    Promise.all([getCourses(), getMyProgress()])
      .then(([coursesData, progressData]) => {
        setCourses(coursesData);
        const map = {};
        progressData.forEach((p) => {
          // course est peuplé ici (objet) ; null si le cours a été supprimé
          if (p.course?._id) map[p.course._id] = p;
        });
        setProgressMap(map);
      })
      .catch(() => setMessage('Impossible de charger tes cours.'));
  }, []);

  // Les réponses d'ouverture/fin renvoient course sous forme d'ID simple,
  // celle du chargement initial sous forme d'objet : on gère les deux.
  const updateProgress = (p) => {
    const id = p.course?._id || p.course;
    setProgressMap((prev) => ({ ...prev, [id]: p }));
  };

  if (message) return <p className={styles.errorPage}>{message}</p>;

  if (courses.length === 0) {
    return (
      <div>
        <h1>Mes cours</h1>
        <p className={styles.empty}>Aucun cours disponible pour ta formation pour le moment.</p>
      </div>
    );
  }

  const done = courses.filter((c) => progressMap[c._id]?.status === 'completed').length;
  const pct = Math.round((done / courses.length) * 100);

  return (
    <div>
      <h1>Mes cours</h1>

      <div className={styles.summary}>
        <p className={styles.summaryText}>
          <strong>{done}</strong> cours terminé{done > 1 ? 's' : ''} sur {courses.length}
        </p>
        <div className={styles.bar}>
          <div className={styles.barFill} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className={styles.grid}>
        {courses.map((c) => (
          <CourseCard
            key={c._id}
            course={c}
            progress={progressMap[c._id]}
            onProgress={updateProgress}
          />
        ))}
      </div>
    </div>
  );
}

export default EleveCourses;