import { useState } from 'react';
import { apiFetch } from '../api/client';
import styles from './QuickLogForm.module.css';

interface QuickLogFormProps {
  cycleId: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function QuickLogForm({
  cycleId,
  onSuccess,
  onError,
}: QuickLogFormProps) {
  const [temperature, setTemperature] = useState('');
  const [isMenstruating, setIsMenstruating] = useState(false);
  const [flowLevel, setFlowLevel] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const today = new Date().toISOString().split('T')[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const body = {
        date: today,
        temperature: temperature ? parseFloat(temperature) : undefined,
        isMenstruating,
        menstrualLog:
          isMenstruating && flowLevel
            ? { flowLevel, color: 'DARK_RED', consistency: 'NORMAL' }
            : undefined,
      };

      await apiFetch(`/cycles/${cycleId}/logs`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      setMessage({ type: 'success', text: 'Log saved!' });
      setTemperature('');
      setIsMenstruating(false);
      setFlowLevel('');

      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save log');
      setMessage({ type: 'error', text: error.message });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.heading}>Quick Log</h3>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="temperature" className={styles.label}>
            Temperature (°C)
          </label>
          <input
            id="temperature"
            type="number"
            step="0.1"
            min="35"
            max="42"
            value={temperature}
            onChange={e => setTemperature(e.target.value)}
            placeholder="36.5"
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="menstruating" className={styles.checkboxLabel}>
            <input
              id="menstruating"
              type="checkbox"
              checked={isMenstruating}
              onChange={e => setIsMenstruating(e.target.checked)}
              className={styles.checkbox}
            />
            <span>Menstruating today</span>
          </label>
        </div>

        {isMenstruating && (
          <div className={styles.formGroup}>
            <label htmlFor="flowLevel" className={styles.label}>
              Flow Level
            </label>
            <select
              id="flowLevel"
              value={flowLevel}
              onChange={e => setFlowLevel(e.target.value)}
              className={styles.select}
            >
              <option value="">Select...</option>
              <option value="SPOTTING">Spotting</option>
              <option value="LIGHT">Light</option>
              <option value="MEDIUM">Medium</option>
              <option value="HEAVY">Heavy</option>
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={styles.submitBtn}
        >
          {loading ? 'Saving...' : 'Log Entry'}
        </button>
      </form>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
