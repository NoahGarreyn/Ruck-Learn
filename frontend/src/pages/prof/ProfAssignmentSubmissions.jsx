import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSubmissionsDevoir, noterDevoir } from '../../services/submissionService';
import { getAssignmentById } from '../../services/assignmentService';
import styles from './ProfAssignmentSubmissions.module.css';

const BACKEND_URL = import.meta.env.VITE_API_URL.replace('/api', '');

function SubmissionRow({ submission, onGraded }) {
  const [note, setNote] = useState(submission.note ?? '');
  const [commentaire, setCommentaire] = useState(submission.commentaire ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleNoter = async () => {
    setError(null);
    setLoading(true);
    try {
      await noterDevoir(submission._id, { note: Number(note), commentaire });
      onGraded();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la notation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.row}>
      <div className={styles.studentInfo}>
        <p className={styles.studentName}>
          {submission.eleve?.prenom} {submission.eleve?.nom}
        </p>
        <p className={styles.studentEmail}>{submission.eleve?.email}</p>
      </div>

      <div className={styles.content}>
        <p className={styles.contentLabel}>Réponse :</p>
        <p className={styles.contentText}>{submission.contenu || '(aucun texte)'}</p>

        {submission.fichiers?.length > 0 && (
          <div className={styles.files}>
            {submission.fichiers.map((f, i) => (
              <a key={i} href={`${BACKEND_URL}${f.url}`} target="_blank" rel="noopener noreferrer" className={styles.fileLink}>
                {f.nom}
              </a>
            ))}
          </div>
        )}
      </div>

      <div className={styles.gradeForm}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.gradeInputs}>
          <input
            type="number"
            min="0"
            max="20"
            placeholder="/20"
            className={styles.noteInput}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <input
            type="text"
            placeholder="Commentaire (optionnel)"
            className={styles.commentInput}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
          />
          <button className={styles.gradeButton} onClick={handleNoter} disabled={loading || note === ''}>
            {loading ? '...' : submission.note != null ? 'Modifier' : 'Noter'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfAssignmentSubmissions() {
  const { id } = useParams();
  const [devoir, setDevoir] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState(null);

  const loadSubmissions = () => {
    getSubmissionsDevoir(id)
      .then(setSubmissions)
      .catch(() => setMessage('Impossible de charger les soumissions.'));
  };

  useEffect(() => {
    getAssignmentById(id).then(setDevoir).catch(() => {});
    loadSubmissions();
  }, [id]);

  return (
    <div>
      <Link to="/prof/devoirs" className={styles.backLink}>← Retour aux devoirs</Link>
      <h1>Soumissions {devoir ? `— ${devoir.titre}` : ''}</h1>

      {message && <p className={styles.error}>{message}</p>}

      {submissions.length === 0 && !message ? (
        <p className={styles.empty}>Aucune soumission reçue pour ce devoir pour le moment.</p>
      ) : (
        <div className={styles.list}>
          {submissions.map((s) => (
            <SubmissionRow key={s._id} submission={s} onGraded={loadSubmissions} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfAssignmentSubmissions;