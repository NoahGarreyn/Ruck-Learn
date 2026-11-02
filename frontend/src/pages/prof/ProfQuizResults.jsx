import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getQuizById, getQuizResults } from '../../services/quizService';
import styles from './ProfQuizzes.module.css';

function ProfQuizResults() {
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getQuizById(id).then(setQuiz).catch(() => {});
    getQuizResults(id)
      .then(setResults)
      .catch(() => setError('Impossible de charger les résultats.'));
  }, [id]);

  const total = quiz?.questions?.length ?? 0;
  const moyenne = results.length
    ? (results.reduce((sum, r) => sum + (r.score ?? 0), 0) / results.length).toFixed(1)
    : null;

  return (
    <div>
      <Link to="/prof/quiz" className={styles.backLink}>← Retour aux quiz</Link>
      <h1>Résultats {quiz ? `— ${quiz.titre}` : ''}</h1>

      {error && <p className={styles.error}>{error}</p>}

      {results.length === 0 && !error ? (
        <p className={styles.empty}>Aucun élève n'a encore passé ce quiz.</p>
      ) : (
        <>
          {moyenne !== null && (
            <p className={styles.stats}>
              {results.length} participation{results.length > 1 ? 's' : ''} · moyenne{' '}
              <strong>{moyenne}/{total}</strong>
            </p>
          )}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Élève</th>
                <th>Email</th>
                <th>Score</th>
                <th>Passé le</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r._id}>
                  <td>{r.eleve?.prenom} {r.eleve?.nom}</td>
                  <td>{r.eleve?.email}</td>
                  <td>{r.score}/{total}</td>
                  <td>
                    {new Date(r.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ProfQuizResults;