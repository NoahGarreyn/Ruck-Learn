// frontend/src/pages/prof/ProfCourses.jsx
import { useState, useEffect } from 'react';
import { getCourses, createCourse } from '../../services/courseService';
import { getFormations } from '../../services/formationService';
import styles from './ProfCourses.module.css';

function ProfCourses() {
  const [formData, setFormData] = useState({
    titre: '', description: '', contenu: '', formation: '',
  });
  const [fichiers, setFichiers] = useState([]); // objets File natifs du navigateur
  const [formations, setFormations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadCourses = () => {
    getCourses()
      .then(setCourses)
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger les cours.' }));
  };

  useEffect(() => {
    getFormations().then(setFormations).catch(() => {});
    loadCourses();
  }, []);

  const formationsMap = formations.reduce((acc, f) => {
    acc[f._id] = f.nom;
    return acc;
  }, {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // e.target.files est une FileList (pas un vrai tableau) — Array.from
  // la convertit pour qu'on puisse ensuite la manipuler normalement
  // (map, forEach...) et l'envoyer dans le FormData au submit.
  const handleFileChange = (e) => {
    setFichiers(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await createCourse({ ...formData, fichiers });
      setMessage({ type: 'success', text: 'Cours créé avec succès.' });
      setFormData({ titre: '', description: '', contenu: '', formation: '' });
      setFichiers([]);
      // Réinitialise visuellement l'input file (React ne peut pas contrôler
      // sa valeur directement pour des raisons de sécurité navigateur).
      e.target.reset();
      loadCourses();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la création du cours.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Mes cours</h1>
      <p className={styles.subtitle}>Créer un nouveau cours pour une formation.</p>

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

        <div className={styles.field}>
          <label htmlFor="contenu">Contenu</label>
          <textarea
            id="contenu"
            name="contenu"
            rows={6}
            value={formData.contenu}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="formation">Formation</label>
          <select id="formation" name="formation" value={formData.formation} onChange={handleChange} required>
            <option value="">-- Choisir une formation --</option>
            {formations.map((f) => (
              <option key={f._id} value={f._id}>{f.nom}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label htmlFor="fichiers">Fichiers joints (PDF, Word, images... — 5 max, 10 Mo/fichier)</label>
          <input
            id="fichiers"
            name="fichiers"
            type="file"
            multiple
            onChange={handleFileChange}
          />
          {fichiers.length > 0 && (
            <ul className={styles.fileList}>
              {fichiers.map((f, i) => (
                <li key={i}>{f.name} ({(f.size / 1024).toFixed(0)} Ko)</li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Création...' : 'Créer le cours'}
        </button>
      </form>

      <h2 className={styles.listTitle}>Cours existants</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Formation</th>
            <th>Fichiers</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c._id}>
              <td>{c.titre}</td>
              <td>{formationsMap[c.formation] || '—'}</td>
              <td>{c.fichiers?.length || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProfCourses;