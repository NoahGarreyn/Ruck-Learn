import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuizzes, createQuiz } from '../../services/quizService';
import { getFormations } from '../../services/formationService';
import styles from './ProfQuizzes.module.css';

const MIN_CHOIX = 2;
const MAX_CHOIX = 6;

// Question vierge : 2 choix vides, réponse unique, premier choix coché.
// bonnesReponses est TOUJOURS un tableau d'index, même pour une réponse unique.
const emptyQuestion = () => ({
  question: '',
  choix: ['', ''],
  multiple: false,
  bonnesReponses: [0],
});

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

function ProfQuizzes() {
  const [formData, setFormData] = useState({
    titre: '', description: '', formation: '', dateLimit: '',
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);
  const [formations, setFormations] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadQuizzes = () => {
    getQuizzes()
      .then(setQuizzes)
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger les quiz.' }));
  };

  useEffect(() => {
    getFormations().then(setFormations).catch(() => {});
    loadQuizzes();
  }, []);

  const formationsMap = formations.reduce((acc, f) => {
    acc[f._id] = f.nom;
    return acc;
  }, {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- Gestion du formulaire dynamique ---
  // On ne modifie jamais le tableau directement (règle de React) :
  // chaque fonction renvoie un NOUVEAU tableau via map/filter/spread.

  const updateQuestion = (qi, patch) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));

  const updateChoice = (qi, ci, value) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, choix: q.choix.map((c, j) => (j === ci ? value : c)) } : q
      )
    );

  // Bascule "plusieurs réponses possibles". En repassant en réponse unique,
  // on ne garde qu'UNE bonne réponse (la première cochée).
  const setMultiple = (qi, multiple) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, multiple, bonnesReponses: multiple ? q.bonnesReponses : [q.bonnesReponses[0] ?? 0] }
          : q
      )
    );

  // Coche/décoche une bonne réponse :
  // - réponse unique : remplace la sélection
  // - choix multiples : ajoute ou retire l'index de la liste
  const toggleCorrect = (qi, ci) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;
        if (!q.multiple) return { ...q, bonnesReponses: [ci] };
        const has = q.bonnesReponses.includes(ci);
        return {
          ...q,
          bonnesReponses: has
            ? q.bonnesReponses.filter((x) => x !== ci)
            : [...q.bonnesReponses, ci],
        };
      })
    );

  const addChoice = (qi) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi && q.choix.length < MAX_CHOIX ? { ...q, choix: [...q.choix, ''] } : q
      )
    );

  const removeChoice = (qi, ci) =>
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi || q.choix.length <= MIN_CHOIX) return q;
        const choix = q.choix.filter((_, j) => j !== ci);

        // bonnesReponses contient des INDEX : après suppression d'un choix,
        // on retire celui-ci et on décale ceux qui le suivaient (sinon ils
        // pointeraient vers la mauvaise réponse).
        let bonnesReponses = q.bonnesReponses
          .filter((x) => x !== ci)
          .map((x) => (x > ci ? x - 1 : x));
        if (bonnesReponses.length === 0) bonnesReponses = [0];

        return { ...q, choix, bonnesReponses };
      })
    );

  const addQuestion = () => setQuestions((prev) => [...prev, emptyQuestion()]);

  const removeQuestion = (qi) =>
    setQuestions((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== qi) : prev));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const incomplete = questions.some(
      (q) => !q.question.trim() || q.choix.some((c) => !c.trim())
    );
    if (incomplete) {
      setMessage({ type: 'error', text: 'Remplis toutes les questions et tous les choix.' });
      return;
    }

    if (questions.some((q) => q.bonnesReponses.length === 0)) {
      setMessage({ type: 'error', text: 'Chaque question doit avoir au moins une bonne réponse.' });
      return;
    }

    setLoading(true);
    try {
      await createQuiz({
        ...formData,
        questions: questions.map((q) => ({
          question: q.question.trim(),
          choix: q.choix.map((c) => c.trim()),
          multiple: q.multiple,
          bonnesReponses: [...q.bonnesReponses].sort((a, b) => a - b),
        })),
      });
      setMessage({ type: 'success', text: 'Quiz créé avec succès.' });
      setFormData({ titre: '', description: '', formation: '', dateLimit: '' });
      setQuestions([emptyQuestion()]);
      loadQuizzes();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la création du quiz.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Quiz</h1>
      <p className={styles.subtitle}>
        Crée un quiz à choix multiples : il est corrigé automatiquement.
      </p>

      {message && (
        <p className={message.type === 'success' ? styles.success : styles.error}>
          {message.text}
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="titre">Titre</label>
          <input id="titre" name="titre" value={formData.titre} onChange={handleChange} required />
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={2}
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.row}>
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

          <div className={styles.field}>
            <label htmlFor="dateLimit">Date limite</label>
            <input
              id="dateLimit"
              name="dateLimit"
              type="datetime-local"
              value={formData.dateLimit}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <h2 className={styles.sectionTitle}>Questions</h2>

        {questions.map((q, qi) => (
          <div key={qi} className={styles.questionBlock}>
            <div className={styles.questionHeader}>
              <span>Question {qi + 1}</span>
              {questions.length > 1 && (
                <button type="button" className={styles.removeBtn} onClick={() => removeQuestion(qi)}>
                  Supprimer la question
                </button>
              )}
            </div>

            <input
              className={styles.textInput}
              placeholder="Énoncé de la question"
              value={q.question}
              onChange={(e) => updateQuestion(qi, { question: e.target.value })}
            />

            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={q.multiple}
                onChange={(e) => setMultiple(qi, e.target.checked)}
              />
              Plusieurs réponses possibles
            </label>

            <p className={styles.hint}>
              {q.multiple ? 'Coche toutes les bonnes réponses.' : 'Coche la bonne réponse.'}
            </p>

            {q.choix.map((c, ci) => (
              <div key={ci} className={styles.choiceRow}>
                <input
                  type={q.multiple ? 'checkbox' : 'radio'}
                  name={`correct-${qi}`}
                  aria-label={`Bonne réponse : choix ${ci + 1}`}
                  checked={q.bonnesReponses.includes(ci)}
                  onChange={() => toggleCorrect(qi, ci)}
                />
                <input
                  className={styles.textInput}
                  placeholder={`Choix ${ci + 1}`}
                  value={c}
                  onChange={(e) => updateChoice(qi, ci, e.target.value)}
                />
                {q.choix.length > MIN_CHOIX && (
                  <button
                    type="button"
                    className={styles.removeBtn}
                    aria-label={`Supprimer le choix ${ci + 1}`}
                    onClick={() => removeChoice(qi, ci)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className={styles.ghostBtn}
              onClick={() => addChoice(qi)}
              disabled={q.choix.length >= MAX_CHOIX}
            >
              + Ajouter un choix
            </button>
          </div>
        ))}

        <button type="button" className={styles.ghostBtn} onClick={addQuestion}>
          + Ajouter une question
        </button>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Création...' : 'Créer le quiz'}
        </button>
      </form>

      <h2 className={styles.listTitle}>Quiz existants</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Formation</th>
            <th>Date limite</th>
            <th>Questions</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {quizzes.map((qz) => (
            <tr key={qz._id}>
              <td>{qz.titre}</td>
              <td>{formationsMap[qz.formation] || '—'}</td>
              <td>{formatDate(qz.dateLimit)}</td>
              <td>{qz.questions?.length || 0}</td>
              <td>
                <Link to={`/prof/quiz/${qz._id}/resultats`} className={styles.viewLink}>
                  Voir les résultats
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProfQuizzes;