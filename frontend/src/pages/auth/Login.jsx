import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'prof') navigate('/prof');
      else navigate('/eleve');

    } catch (err) {
      setError(err.response?.data?.message || 'Erreur de connexion, réessaie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <form className={styles.card} onSubmit={handleSubmit}>
        <h1 className={styles.title}>RuckLearn</h1>
        <p className={styles.subtitle}>Connecte-toi à ton espace</p>

        {error && <p className={styles.error}>{error}</p>}

        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className={styles.label} htmlFor="password">Mot de passe</label>
        <input
          id="password"
          type="password"
          className={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

export default Login;