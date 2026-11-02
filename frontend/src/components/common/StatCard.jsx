import { Link } from 'react-router-dom';
import styles from './StatCard.module.css';

// Carte de chiffre clé, réutilisée par les 3 dashboards.
// Si `to` est fourni, toute la carte devient un lien vers la page concernée.
// tone : 'default' (mauve) | 'green' | 'warn' (met la carte en évidence)
function StatCard({ label, value, hint, to, tone = 'default' }) {
  const inner = (
    <>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
    </>
  );

  const className = `${styles.card} ${styles[tone]}`;

  if (to) {
    return (
      <Link to={to} className={`${className} ${styles.clickable}`}>
        {inner}
      </Link>
    );
  }
  return <div className={className}>{inner}</div>;
}

export default StatCard;