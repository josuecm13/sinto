import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { User } from '../types/user';
import { apiFetch } from '../api/client';
import { useAuth } from '../context/AuthContext';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const { user } = useAuth();

  // ── Profile section state ─────────────────────────────────────────────────
  const [profileData, setProfileData] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [avatarBroken, setAvatarBroken] = useState(false);

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileUsernameError, setProfileUsernameError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // ── Notifications section state ───────────────────────────────────────────
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('');

  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState(false);

  // ── Initialize from user on mount ────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setProfileData(user);
      setName(user.name);
      setUsername(user.username ?? '');
      setAvatarUrl(user.avatarUrl ?? '');
      setIsPublic(user.isPublic);
      setRemindersEnabled(user.remindersEnabled);
      setReminderTime(user.reminderTime ?? '');
    }
  }, [user]);

  // Reset avatar broken state when avatarUrl changes
  useEffect(() => {
    setAvatarBroken(false);
  }, [avatarUrl]);

  // ── Profile save ─────────────────────────────────────────────────────────
  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profileData) return;

    setProfileError(null);
    setProfileUsernameError(null);
    setProfileSuccess(false);

    // Build payload with only changed fields
    const payload: Record<string, string | boolean> = {};

    if (name !== profileData.name) {
      payload.name = name;
    }
    const trimmedUsername = username.trim();
    const originalUsername = profileData.username ?? '';
    if (trimmedUsername !== originalUsername) {
      if (trimmedUsername !== '') {
        payload.username = trimmedUsername;
      } else {
        payload.username = '';
      }
    }
    const trimmedAvatarUrl = avatarUrl.trim();
    const originalAvatarUrl = profileData.avatarUrl ?? '';
    if (trimmedAvatarUrl !== originalAvatarUrl) {
      if (trimmedAvatarUrl !== '') {
        payload.avatarUrl = trimmedAvatarUrl;
      }
      // Empty string avatarUrl → omit from payload (no change sent)
    }
    if (isPublic !== profileData.isPublic) {
      payload.isPublic = isPublic;
    }

    // No-op: nothing changed
    if (Object.keys(payload).length === 0) {
      setProfileSuccess(true);
      return;
    }

    setProfileLoading(true);
    try {
      const updated = await apiFetch<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setProfileData(updated);
      setName(updated.name);
      setUsername(updated.username ?? '');
      setAvatarUrl(updated.avatarUrl ?? '');
      setIsPublic(updated.isPublic);
      setProfileSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // 409 conflict → username taken
      if (msg.toLowerCase().includes('409') || msg.toLowerCase().includes('conflict') || msg.toLowerCase().includes('username')) {
        setProfileUsernameError('Username is already taken');
      } else if (err instanceof TypeError) {
        setProfileError('Network error — please check your connection and try again.');
      } else {
        setProfileError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setProfileLoading(false);
    }
  }

  // ── Notifications save ───────────────────────────────────────────────────
  async function handleNotifSave(e: React.FormEvent) {
    e.preventDefault();
    setNotifError(null);
    setNotifSuccess(false);

    const body: { remindersEnabled: boolean; reminderTime?: string } = { remindersEnabled };
    if (remindersEnabled && reminderTime.trim() !== '') {
      body.reminderTime = reminderTime.trim();
    }

    setNotifLoading(true);
    try {
      await apiFetch<User>('/users/me/notifications', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setNotifSuccess(true);
    } catch (err: unknown) {
      if (err instanceof TypeError) {
        setNotifError('Network error — please check your connection and try again.');
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        setNotifError(msg || 'Something went wrong. Please try again.');
      }
    } finally {
      setNotifLoading(false);
    }
  }

  // ── Avatar display helper ─────────────────────────────────────────────────
  const displayName = profileData?.name ?? user?.name ?? '';
  const displayAvatarUrl = profileData?.avatarUrl ?? null;
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <Link to="/" className={styles.backLink}>← Back</Link>
        <span className={styles.logo}>Sinto</span>
      </header>

      <main className={styles.main}>
        {/* Profile section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Profile</h2>

          {/* Avatar preview */}
          <div className={styles.avatarPreview}>
            {displayAvatarUrl && !avatarBroken ? (
              <img
                src={displayAvatarUrl}
                alt="Avatar"
                onError={() => setAvatarBroken(true)}
              />
            ) : (
              <span className={styles.avatarInitial}>{avatarInitial}</span>
            )}
          </div>

          <form onSubmit={handleProfileSave} noValidate>
            {/* Name */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="settings-name">Name *</label>
              <input
                id="settings-name"
                className={styles.input}
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                minLength={2}
                maxLength={100}
                disabled={profileLoading}
              />
            </div>

            {/* Username */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="settings-username">
                Username <span className={styles.hint}>(3–30 chars, lowercase letters/numbers/underscore)</span>
              </label>
              <input
                id="settings-username"
                className={styles.input}
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); setProfileUsernameError(null); }}
                minLength={3}
                maxLength={30}
                disabled={profileLoading}
              />
              {profileUsernameError && (
                <p className={styles.fieldError}>{profileUsernameError}</p>
              )}
            </div>

            {/* Avatar URL */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="settings-avatar">Avatar URL</label>
              <input
                id="settings-avatar"
                className={styles.input}
                type="url"
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                disabled={profileLoading}
                placeholder="https://…"
              />
            </div>

            {/* Public profile toggle */}
            <div className={styles.toggle}>
              <input
                id="settings-public"
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                disabled={profileLoading}
              />
              <label htmlFor="settings-public">Public profile</label>
            </div>

            {profileError && <p className={styles.errorMsg}>{profileError}</p>}

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={profileLoading}
            >
              {profileLoading ? 'Saving…' : 'Save profile'}
            </button>

            {profileSuccess && !profileError && (
              <p className={styles.successMsg}>Saved!</p>
            )}
          </form>
        </section>

        {/* Notifications section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notifications</h2>

          <form onSubmit={handleNotifSave} noValidate>
            {/* Reminders enabled toggle */}
            <div className={styles.toggle}>
              <input
                id="settings-reminders"
                type="checkbox"
                checked={remindersEnabled}
                onChange={e => setRemindersEnabled(e.target.checked)}
                disabled={notifLoading}
              />
              <label htmlFor="settings-reminders">Enable reminders</label>
            </div>

            {/* Reminder time — only shown when remindersEnabled */}
            {remindersEnabled && (
              <div className={styles.field}>
                <label className={styles.label} htmlFor="settings-reminder-time">
                  Reminder time
                </label>
                <input
                  id="settings-reminder-time"
                  className={styles.input}
                  type="time"
                  value={reminderTime}
                  onChange={e => setReminderTime(e.target.value)}
                  disabled={notifLoading}
                />
              </div>
            )}

            {notifError && <p className={styles.errorMsg}>{notifError}</p>}

            <button
              type="submit"
              className={styles.saveBtn}
              disabled={notifLoading}
            >
              {notifLoading ? 'Saving…' : 'Save notifications'}
            </button>

            {notifSuccess && !notifError && (
              <p className={styles.successMsg}>Saved!</p>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
