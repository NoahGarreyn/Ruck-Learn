import { useState, useEffect } from 'react';
import { getQuizzes, submitQuiz, getCorrection } from '../../services/quizService';
import { getMesSoumissions } from '../../services/submissionService';
import styles from './EleveQuizzes.module.css';

const formatDateTime = (d) =>
  new Date(d).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

function QuizCard({ quiz, submission, onSubmitted }) {
  const total = quiz.questions.length;
  const [open, setOpen] = useState(false);
  const [answers, setAnswers] = useState(() => quiz.questions.map(() => []));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Correction : null tant qu'elle n'a pas été chargée.
  const [correction, setCorrection] = useState(null);
  const [showCorrection, setShowCorrection] = useState(false);

  const deadlinePassed = new Date() > new Date(quiz.dateLimit);
  const allAnswered = answers.every((a) => a.length > 0);

  const toggleAnswer = (qi, ci, multiple) =>
    setAnswers((prev) =>
      prev.map((a, i) => {
        if (i !== qi) return a;
        if (!multiple) return [ci];
        return a.includes(ci) ? a.filter((x) => x !== ci) : [...a, ci];
      })
    );

  // Le serveur refuse (403) tant que la date limite n'est pas passée :
  // on affiche simplement son message. Le bouton n'est de toute façon
  // proposé qu'après la date limite.
  const loadCorrection = async () => {
    setError(null);
    try {
      const data = await getCorrection(quiz._id);
      setCorrection(data);
      setShowCorrection(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Impossible de charger la correction.');
    }
  };

  const toggleCorrection = () => {
    if (showCorrection) {
      setShowCorrection(false);
    } else if (correction) {
      setShowCorrection(true);
    } else {
      loadCorrection();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!window.confirm('Envoyer tes réponses ? Tu ne pourras pas repasser ce quiz.')) return;

    setError(null);
    setLoading(true);
    try {
      await submitQuiz(quiz._id, answers);
      setOpen(false);
      onSubmitted(); // recharge les soumissions : le score s'affiche
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'envoi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.cardTitle}>{quiz.titre}</h2>
        <span className={deadlinePassed ? styles.badgeLate : styles.badgeOpen}>
          {deadlinePassed ? 'Terminé' : 'Ouvert'}
        </span>
      </div>

      <p className={styles.cardDesc}>{quiz.description}</p>
      <p className={styles.cardMeta}>
        {total} question{total > 1 ? 's' : ''} · à passer avant le {formatDateTime(quiz.dateLimit)}
      </p>

      {error && !open && <p className={styles.error}>{error}</p>}

      {submission && (
        <div className={styles.result}>
          <p className={styles.resultLabel}>✓ Quiz passé</p>
          <p className={styles.score}>Score : {submission.score}/{total}</p>

          {deadlinePassed ? (
            <button className={styles.ghostBtn} onClick={toggleCorrection}>
              {showCorrection ? 'Masquer la correction' : 'Voir la correction'}
            </button>
          ) : (
            <p className={styles.hint}>
              La correction sera disponible après le {formatDateTime(quiz.dateLimit)}.
            </p>
          )}
        </div>
      )}

      {/* --- Correction détaillée --- */}
      {submission && showCorrection && correction && (
        <div className={styles.correction}>
          {correction.questions.map((q, qi) => (
            <div key={qi} className={styles.corrQuestion}>
              <p className={styles.corrTitle}>
                {qi + 1}. {q.question}
                <span className={q.correct ? styles.tagOk : styles.tagKo}>
                  {q.correct ? '✓ Correct' : '✗ Incorrect'}
                </span>
              </p>

              {q.choix.map((c, ci) => {
                const isCorrect = q.bonnesReponses.includes(ci);
                const isChosen = q.reponses.includes(ci);
                // vert = bonne réponse, rouge = choix de l'élève qui est faux
                let cls = styles.corrChoice;
                if (isCorrect) cls += ` ${styles.corrRight}`;
                else if (isChosen) cls += ` ${styles.corrWrong}`;

                return (
                  <div key={ci} className={cls}>
                    <span>{c}</span>
                    <span className={styles.corrNote}>
                      {isChosen && 'Ta réponse'}
                      {isChosen && isCorrect && ' · '}
                      {isCorrect && 'Bonne réponse'}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {!submission && deadlinePassed && (
        <p className={styles.lateMessage}>Tu n'as pas passé ce quiz avant la date limite.</p>
      )}

      {!submission && !deadlinePassed && total === 0 && (
        <p className={styles.lateMessage}>Ce quiz ne contient pas encore de question.</p>
      )}

      {!submission && !deadlinePassed && total > 0 && !open && (
        <button className={styles.button} onClick={() => setOpen(true)}>
          Passer le quiz
        </button>
      )}

      {!submission && !deadlinePassed && total > 0 && open && (
        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}

          {quiz.questions.map((q, qi) => (
            <fieldset key={q._id || qi} className={styles.question}>
              <legend className={styles.legend}>{qi + 1}. {q.question}</legend>

              {q.multiple && (
                <span className={styles.multipleTag}>Plusieurs réponses possibles</span>
              )}

              {q.choix.map((c, ci) => (
                <label key={ci} className={styles.choice}>
                  <input
                    type={q.multiple ? 'checkbox' : 'radio'}
                    name={`q-${quiz._id}-${qi}`}
                    checked={answers[qi].includes(ci)}
                    onChange={() => toggleAnswer(qi, ci, q.multiple)}
                  />
                  {c}
                </label>
              ))}
            </fieldset>
          ))}

          <div className={styles.actions}>
            <button type="submit" className={styles.button} disabled={loading || !allAnswered}>
              {loading ? 'Envoi...' : 'Valider mes réponses'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => setOpen(false)}>
              Annuler
            </button>
          </div>
          {!allAnswered && (
            <p className={styles.hint}>Réponds à toutes les questions pour valider.</p>
          )}
        </form>
      )}
    </div>
  );
}

function EleveQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [message, setMessage] = useState(null);

  const loadAll = () => {
    Promise.all([getQuizzes(), getMesSoumissions()])
      .then(([quizData, submissionData]) => {
        setQuizzes(quizData);
        setSubmissions(submissionData.filter((s) => s.type === 'quiz'));
      })
      .catch(() => setMessage('Impossible de charger tes quiz.'));
  };

  useEffect(() => {
    loadAll();
  }, []);

  const findSubmission = (quizId) =>
    submissions.find((s) => s.quiz?._id === quizId || s.quiz === quizId);

  if (message) return <p className={styles.errorPage}>{message}</p>;

  if (quizzes.length === 0) {
    return (
      <div>
        <h1>Mes quiz</h1>
        <p className={styles.empty}>Aucun quiz pour ta formation pour le moment.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Mes quiz</h1>
      <div className={styles.list}>
        {quizzes.map((qz) => (
          <QuizCard
            key={qz._id}
            quiz={qz}
            submission={findSubmission(qz._id)}
            onSubmitted={loadAll}
          />
        ))}
      </div>
    </div>
  );
}

export default EleveQuizzes;