// frontend/src/pages/admin/AdminFormations.jsx
import { useState, useEffect } from 'react';
import {
  getFormations,
  createFormation,
  updateFormation,
  archiveFormation,
} from '../../services/formationService';
import styles from './AdminFormations.module.css';

function AdminFormations() {
  const [formations, setFormations] = useState([]);
  const [formData, setFormData] = useState({ nom: '', slug: '', description: '' });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // editingId = null → mode création. editingId = un id → on édite
  // cette formation précise, le formulaire ci-dessous devient un
  // formulaire d'édition (même form, comportement différent au submit).
  const [editingId, setEditingId] = useState(null);

  const loadFormations = () => {
    getFormations()
      .then(setFormations)
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger les formations.' }));
  };

  useEffect(() => {
    loadFormations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ nom: '', slug: '', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      if (editingId) {
        await updateFormation(editingId, formData);
        setMessage({ type: 'success', text: 'Formation modifiée avec succès.' });
      } else {
        await createFormation(formData);
        setMessage({ type: 'success', text: 'Formation créée avec succès.' });
      }
      resetForm();
      loadFormations();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de l\'enregistrement.',
      });
    } finally {
      setLoading(false);
    }
  };

  // Remplit le formulaire avec les données existantes pour permettre
  // la modification, plutôt que d'ouvrir une modale séparée — plus
  // simple à défendre pour un premier jet de CRUD.
  const handleEditClick = (formation) => {
    setEditingId(formation._id);
    setFormData({
      nom: formation.nom,
      slug: formation.slug,
      description: formation.description || '',
    });
  };

  const handleArchive = async (id, nom) => {
    const confirme = window.confirm(
      `Archiver la formation "${nom}" ? Elle n'apparaîtra plus dans l'application (mais reste conservée en base).`
    );
    if (!confirme) return;

    try {
      await archiveFormation(id);
      setMessage({ type: 'success', text: 'Formation archivée.' });
      loadFormations();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de l\'archivage.',
      });
    }
  };

  return (
    <div>
      <h1>Gestion des formations</h1>
      <p className={styles.subtitle}>
        {editingId ? 'Modifier une formation existante.' : 'Créer une nouvelle formation.'}
      </p>

      {message && (
        <p className={message.type === 'success' ? styles.success : styles.error}>
          {message.text}
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label htmlFor="nom">Nom complet</label>
          <input
            id="nom"
            name="nom"
            placeholder="ex: Technicien Paie - Gestion de la Paie"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            name="slug"
            placeholder="ex: tp-gp"
            value={formData.slug}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            rows={3}
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? 'Enregistrement...' : editingId ? 'Modifier' : 'Créer la formation'}
          </button>
          {editingId && (
            <button type="button" className={styles.cancelButton} onClick={resetForm}>
              Annuler
            </button>
          )}
        </div>
      </form>

      <h2 className={styles.listTitle}>Formations actives</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Slug</th>
            <th>Description</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {formations.map((f) => (
            <tr key={f._id}>
              <td>{f.nom}</td>
              <td>{f.slug}</td>
              <td className={styles.descCell}>{f.description || '—'}</td>
              <td className={styles.rowActions}>
                <button className={styles.editBtn} onClick={() => handleEditClick(f)}>
                  Modifier
                </button>
                <button className={styles.archiveBtn} onClick={() => handleArchive(f._id, f.nom)}>
                  Archiver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminFormations;