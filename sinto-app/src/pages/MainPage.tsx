import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './MainPage.module.css';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function MainPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  if (!user) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.logo}>Sinto</span>
        <div className={styles.headerActions}>
          <Link to="/settings" className={styles.settingsLink}>
            Settings
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Log out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <span className={styles.avatarInitial}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <h2 className={styles.name}>{user.name}</h2>
          {user.username && (
            <p className={styles.username}>@{user.username}</p>
          )}

          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Email</span>
              <span className={styles.detailValue}>{user.email}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Profile</span>
              <span className={styles.detailValue}>
                {user.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Member since</span>
              <span className={styles.detailValue}>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
