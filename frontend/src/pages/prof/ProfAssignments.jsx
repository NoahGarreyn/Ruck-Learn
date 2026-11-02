import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssignments, createAssignment } from '../../services/assignmentService';
import { getFormations } from '../../services/formationService';
import styles from './ProfAssignments.module.css';

function ProfAssignments() {
  const [formData, setFormData] = useState({
    titre: '', description: '', formation: '', dateLimit: '',
  });
  const [fichiers, setFichiers] = useState([]);
  const [formations, setFormations] = useState([]);
  const [devoirs, setDevoirs] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDevoirs = () => {
    getAssignments()
      .then(setDevoirs)
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger les devoirs.' }));
  };

  useEffect(() => {
    getFormations().then(setFormations).catch(() => {});
    loadDevoirs();
  }, []);

  const formationsMap = formations.reduce((acc, f) => {
    acc[f._id] = f.nom;
    return acc;
  }, {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFichiers(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      await createAssignment({ ...formData, fichiers });
      setMessage({ type: 'success', text: 'Devoir créé avec succès.' });
      setFormData({ titre: '', description: '', formation: '', dateLimit: '' });
      setFichiers([]);
      e.target.reset();
      loadDevoirs();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la création du devoir.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div>
      <h1>Devoirs</h1>
      <p className={styles.subtitle}>Créer un nouveau devoir avec une date limite.</p>

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
          <label htmlFor="description">Consigne</label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formData.description}
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

        <div className={styles.field}>
          <label htmlFor="fichiers">Fichiers joints (5 max, 10 Mo/fichier)</label>
          <input id="fichiers" name="fichiers" type="file" multiple onChange={handleFileChange} />
          {fichiers.length > 0 && (
            <ul className={styles.fileList}>
              {fichiers.map((f, i) => (
                <li key={i}>{f.name} ({(f.size / 1024).toFixed(0)} Ko)</li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Création...' : 'Créer le devoir'}
        </button>
      </form>

      <h2 className={styles.listTitle}>Devoirs existants</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Formation</th>
            <th>Date limite</th>
            <th>Fichiers</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {devoirs.map((d) => (
            <tr key={d._id}>
              <td>{d.titre}</td>
              <td>{formationsMap[d.formation] || '—'}</td>
              <td>{formatDate(d.dateLimit)}</td>
              <td>{d.fichiers?.length || 0}</td>
              <td>
                <Link to={`/prof/devoirs/${d._id}/soumissions`} className={styles.viewLink}>
                  Voir les soumissions
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProfAssignments;