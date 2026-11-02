import { useState, useEffect } from 'react';
import { createUser, getUsers } from '../../services/userService';
import { getFormations } from '../../services/formationService';
import styles from './AdminUsers.module.css';

function AdminUsers() {
  const [formData, setFormData] = useState({
    prenom: '', nom: '', email: '', password: '', role: 'eleve', formation: '',
  });
  const [formations, setFormations] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUsers = () => {
    getUsers()
      .then(setUsers)
      .catch(() => setMessage({ type: 'error', text: 'Impossible de charger les utilisateurs.' }));
  };

  useEffect(() => {
    getFormations().then(setFormations).catch(() => {});
    loadUsers();
  }, []);

  // Map id → nom, construite côté frontend puisque le backend ne renvoie
  // pas la formation "peuplée" (juste l'ObjectId brut) sur GET /api/users.
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
    setLoading(true);

    try {
      const payload = { ...formData };
      if (formData.role === 'admin') delete payload.formation;

      await createUser(payload);
      setMessage({ type: 'success', text: `Compte ${formData.role} créé avec succès.` });
      setFormData({ prenom: '', nom: '', email: '', password: '', role: 'eleve', formation: '' });
      loadUsers();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Erreur lors de la création du compte.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Gestion des utilisateurs</h1>
      <p className={styles.subtitle}>Créer un compte professeur ou élève.</p>

      {message && (
        <p className={message.type === 'success' ? styles.success : styles.error}>
          {message.text}
        </p>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <div className={styles.field}>
            <label htmlFor="prenom">Prénom</label>
            <input id="prenom" name="prenom" value={formData.prenom} onChange={handleChange} required />
          </div>
          <div className={styles.field}>
            <label htmlFor="nom">Nom</label>
            <input id="nom" name="nom" value={formData.nom} onChange={handleChange} required />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>

        <div className={styles.field}>
          <label htmlFor="password">Mot de passe provisoire</label>
          <input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>

        <div className={styles.field}>
          <label htmlFor="role">Rôle</label>
          <select id="role" name="role" value={formData.role} onChange={handleChange}>
            <option value="eleve">Élève</option>
            <option value="prof">Professeur</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {formData.role !== 'admin' && (
          <div className={styles.field}>
            <label htmlFor="formation">Formation</label>
            <select id="formation" name="formation" value={formData.formation} onChange={handleChange} required>
              <option value="">-- Choisir une formation --</option>
              {formations.map((f) => (
                <option key={f._id} value={f._id}>{f.nom}</option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Création...' : 'Créer le compte'}
        </button>
      </form>

      <h2 className={styles.listTitle}>Comptes existants</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nom</th>
            <th>Email</th>
            <th>Rôle</th>
            <th>Formation</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.prenom} {u.nom}</td>
              <td>{u.email}</td>
              <td className={styles.roleCell}>{u.role}</td>
              <td>{formationsMap[u.formation] || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminUsers;