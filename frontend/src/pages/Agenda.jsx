import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEvents, createEvent, deleteEvent } from '../services/agendaService';
import { getFormations } from '../services/formationService';
import styles from './Agenda.module.css';

const TYPES = [
  { value: 'cours', label: 'Cours' },
  { value: 'devoir', label: 'Devoir' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'evenement', label: 'Événement' },
];

const emptyForm = {
  titre: '', description: '', type: 'cours', formation: '', dateDebut: '', dateFin: '',
};

// --- Helpers d'affichage des dates ---
const dayLabel = (d) =>
  new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

const timeLabel = (d) =>
  new Date(d).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

const sameDay = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();

const rangeLabel = (ev) =>
  sameDay(ev.dateDebut, ev.dateFin)
    ? `${timeLabel(ev.dateDebut)} – ${timeLabel(ev.dateFin)}`
    : `${timeLabel(ev.dateDebut)} → ${new Date(ev.dateFin).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit',
      })} ${timeLabel(ev.dateFin)}`;

// Regroupe une liste DÉJÀ triée par date en blocs "un bloc par jour".
// Comme la liste est triée, les événements d'un même jour sont consécutifs :
// il suffit de comparer avec le dernier bloc créé.
const groupByDay = (list) => {
  const groups = [];
  list.forEach((ev) => {
    const label = dayLabel(ev.dateDebut);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(ev);
    } else {
      groups.push({ label, items: [ev] });
    }
  });
  return groups;
};

function Agenda() {
  const { user } = useAuth();
  // Seuls prof et admin peuvent créer/supprimer (le backend le vérifie aussi,
  // ici on masque juste ce qui ne sert à rien pour un élève).
  const canEdit = user.role === 'prof' || user.role === 'admin';

  const [events, setEvents] = useState([]);
  const [formations, setFormations] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadEvents = () => {
    getEvents()
      .then(setEvents)
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger l\'agenda.' }));
  };

  useEffect(() => {
    loadEvents();
    // Les formations ne servent qu'au formulaire de création
    if (canEdit) getFormations().then(setFormations).catch(() => {});
  }, [canEdit]);

  const formationsMap = formations.reduce((acc, f) => {
    acc[f._id] = f.nom;
    return acc;
  }, {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (new Date(formData.dateFin) < new Date(formData.dateDebut)) {
      setMessage({ type: 'error', text: 'La date de fin doit être après la date de début.' });
      return;
    }

    setLoading(true);
    try {
      await createEvent(formData);
      setMessage({ type: 'success', text: 'Événement ajouté à l\'agenda.' });
      setFormData(emptyForm);
      loadEvents();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la création.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, titre) => {
    if (!window.confirm(`Supprimer l'événement "${titre}" ?`)) return;

    try {
      await deleteEvent(id);
      setMessage({ type: 'success', text: 'Événement supprimé.' });
      loadEvents();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la suppression.',
      });
    }
  };

  // Tri chronologique, puis séparation "à venir" / "passés".
  // Un événement est "à venir" tant que sa date de fin n'est pas atteinte
  // (donc un événement en cours reste dans "à venir").
  const now = new Date();
  const sorted = [...events].sort((a, b) => new Date(a.dateDebut) - new Date(b.dateDebut));
  const upcoming = sorted.filter((ev) => new Date(ev.dateFin) >= now);
  const past = sorted.filter((ev) => new Date(ev.dateFin) < now).reverse(); // plus récent d'abord

  const renderGroups = (groups, muted) =>
    groups.map((group) => (
      <div key={group.label} className={styles.dayBlock}>
        <h3 className={styles.dayLabel}>{group.label}</h3>
        {group.items.map((ev) => (
          <div key={ev._id} className={muted ? `${styles.event} ${styles.muted}` : styles.event}>
            <div className={styles.eventMain}>
              <div className={styles.eventTop}>
                <span className={`${styles.badge} ${styles[`type_${ev.type}`]}`}>
                  {TYPES.find((t) => t.value === ev.type)?.label || ev.type}
                </span>
                <span className={styles.eventTime}>{rangeLabel(ev)}</span>
              </div>
              <p className={styles.eventTitle}>{ev.titre}</p>
              {ev.description && <p className={styles.eventDesc}>{ev.description}</p>}
              {canEdit && formationsMap[ev.formation] && (
                <p className={styles.eventFormation}>{formationsMap[ev.formation]}</p>
              )}
            </div>
            {canEdit && (
              <button className={styles.deleteBtn} onClick={() => handleDelete(ev._id, ev.titre)}>
                Supprimer
              </button>
            )}
          </div>
        ))}
      </div>
    ));

  return (
    <div>
      <h1>Agenda</h1>

      {message && (
        <p className={message.type === 'success' ? styles.success : styles.error}>
          {message.text}
        </p>
      )}

      {canEdit && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="titre">Titre</label>
            <input id="titre" name="titre" value={formData.titre} onChange={handleChange} required />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description (optionnel)</label>
            <textarea
              id="description"
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="type">Type</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange}>
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label htmlFor="formation">Formation</label>
              <select
                id="formation"
                name="formation"
                value={formData.formation}
                onChange={handleChange}
                required
              >
                <option value="">-- Choisir --</option>
                {formations.map((f) => (
                  <option key={f._id} value={f._id}>{f.nom}</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="dateDebut">Début</label>
              <input
                id="dateDebut"
                name="dateDebut"
                type="datetime-local"
                value={formData.dateDebut}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="dateFin">Fin</label>
              <input
                id="dateFin"
                name="dateFin"
                type="datetime-local"
                value={formData.dateFin}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Ajout...' : 'Ajouter à l\'agenda'}
          </button>
        </form>
      )}

      <h2 className={styles.sectionTitle}>À venir</h2>
      {upcoming.length === 0 ? (
        <p className={styles.empty}>Aucun événement à venir.</p>
      ) : (
        renderGroups(groupByDay(upcoming), false)
      )}

      {past.length > 0 && (
        <>
          <h2 className={styles.sectionTitle}>Passés</h2>
          {renderGroups(groupByDay(past), true)}
        </>
      )}
    </div>
  );
}

export default Agenda;