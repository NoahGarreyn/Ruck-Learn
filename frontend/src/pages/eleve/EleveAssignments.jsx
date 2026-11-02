import { useState, useEffect } from 'react';
import { getAssignments } from '../../services/assignmentService';
import { getMesSoumissions, soumettreDevoir } from '../../services/submissionService';
import styles from './EleveAssignments.module.css';

const BACKEND_URL = import.meta.env.VITE_API_URL.replace('/api', '');

function AssignmentCard({ devoir, submission, onSubmitted }) {
  const [contenu, setContenu] = useState('');
  const [fichiers, setFichiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deadlineDepassee = new Date() > new Date(devoir.dateLimit);

  const handleFileChange = (e) => {
    setFichiers(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await soumettreDevoir(devoir._id, { contenu, fichiers });
      onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la soumission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{devoir.titre}</h2>
        <span className={deadlineDepassee ? styles.badgeLate : styles.badgeOpen}>
          {deadlineDepassee ? 'Deadline dépassée' : 'Ouvert'}
        </span>
      </div>

      <p className={styles.cardDesc}>{devoir.description}</p>
      <p className={styles.cardDeadline}>
        À rendre avant le {new Date(devoir.dateLimit).toLocaleDateString('fr-FR', {
          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })}
      </p>

      {devoir.fichiers?.length > 0 && (
        <div className={styles.files}>
          <p className={styles.filesLabel}>Ressources du devoir :</p>
          <ul>
            {devoir.fichiers.map((f, i) => (
              <li key={i}>
                <a href={`${BACKEND_URL}${f.url}`} target="_blank" rel="noopener noreferrer">
                  {f.nom}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {submission && (
        <div className={styles.submitted}>
          <p className={styles.submittedLabel}>✓ Soumis</p>
          {submission.note != null ? (
            <p className={styles.note}>Note : {submission.note}/20</p>
          ) : (
            <p className={styles.pending}>En attente de correction</p>
          )}
          {submission.commentaire && (
            <p className={styles.commentaire}>Commentaire du prof : {submission.commentaire}</p>
          )}
        </div>
      )}

      {!submission && deadlineDepassee && (
        <p className={styles.lateMessage}>Tu n'as pas rendu ce devoir avant la deadline.</p>
      )}

      {!submission && !deadlineDepassee && (
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          <textarea
            className={styles.textarea}
            rows={4}
            placeholder="Ta réponse..."
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
          />

          <input type="file" multiple onChange={handleFileChange} />
          {fichiers.length > 0 && (
            <ul className={styles.fileList}>
              {fichiers.map((f, i) => (
                <li key={i}>{f.name}</li>
              ))}
            </ul>
          )}

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Envoi...' : 'Soumettre le devoir'}
          </button>
        </form>
      )}
    </div>
  );
}

function EleveAssignments() {
  const [devoirs, setDevoirs] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState(null);

  const loadAll = () => {
    Promise.all([getAssignments(), getMesSoumissions()])
      .then(([devoirsData, submissionsData]) => {
        setDevoirs(devoirsData);
        setSubmissions(submissionsData.filter((s) => s.type === 'devoir'));
      })
      .catch(() => setMessage('Impossible de charger tes devoirs.'));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const findSubmission = (devoirId) =>
    submissions.find((s) => s.devoir?._id === devoirId || s.devoir === devoirId);

  if (message) return <p className={styles.errorPage}>{message}</p>;

  if (devoirs.length === 0) {
    return (
      <div>
        <h1>Mes devoirs</h1>
        <p className={styles.empty}>Aucun devoir pour ta formation pour le moment.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Mes devoirs</h1>
      <div className={styles.list}>
        {devoirs.map((d) => (
          <AssignmentCard
            key={d._id}
            devoir={d}
            submission={findSubmission(d._id)}
            onSubmitted={loadAll}
          />
        ))}
      </div>
    </div>
  );
}

export default EleveAssignments;