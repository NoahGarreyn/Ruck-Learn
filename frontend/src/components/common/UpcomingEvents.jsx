import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../../services/agendaService';
import styles from './Dashboard.module.css';

const TYPE_LABELS = {
  cours: 'Cours',
  devoir: 'Devoir',
  quiz: 'Quiz',
  evenement: 'Événement',
};

const formatWhen = (d) =>
  new Date(d).toLocaleString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
  });

// Panneau "Prochains événements", identique pour les 3 rôles :
// le backend filtre déjà l'agenda selon la formation de l'élève.
function UpcomingEvents({ agendaPath, limit = 5 }) {
  const [events, setEvents] = useState(null); // null = en cours de chargement
  const [error, setError] = useState(false);

  useEffect(() => {
    getEvents()
      .then((data) => {
        const now = new Date();
        const upcoming = data
          // un événement en cours (fin pas encore atteinte) reste affiché
          .filter((ev) => new Date(ev.dateFin) >= now)
          .sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut))
          .slice(0, limit);
        setEvents(upcoming);
      })
      .catch(() => setError(true));
  }, [limit]);

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <h2 className={styles.panelTitle}>Prochains événements</h2>
        <Link to={agendaPath} className={styles.more}>Voir l'agenda</Link>
      </div>

      {error && <p className={styles.error}>Impossible de charger l'agenda.</p>}
      {!error && events === null && <p className={styles.empty}>Chargement...</p>}
      {events && events.length === 0 && <p className={styles.empty}>Aucun événement à venir.</p>}

      {events && events.length > 0 && (
        <ul className={styles.list}>
          {events.map((ev) => (
            <li key={ev._id} className={styles.item}>
              <div className={styles.itemMain}>
                <span className={styles.itemTitle}>{ev.titre}</span>
                <span className={styles.itemMeta}>{formatWhen(ev.dateDebut)}</span>
              </div>
              <span className={`${styles.kind} ${styles[`kind_${ev.type}`]}`}>
                {TYPE_LABELS[ev.type] || ev.type}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default UpcomingEvents;