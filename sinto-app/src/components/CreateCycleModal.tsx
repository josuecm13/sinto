import { useState } from 'react';
import { apiFetch } from '../api/client';
import Calendar from './Calendar';
import styles from './CreateCycleModal.module.css';

interface CreateCycleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCycleModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCycleModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const isValidDate = selectedDate && selectedDate <= today;

  async function handleCreateCycle() {
    if (!isValidDate) return;

    try {
      setLoading(true);
      setError(null);

      await apiFetch('/cycles', {
        method: 'POST',
        body: JSON.stringify({ startDate: selectedDate }),
      });

      onSuccess();
      onClose();
      setSelectedDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cycle');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Start Your First Cycle</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.description}>
            Select the date your cycle started to begin tracking.
          </p>

          <Calendar onSelectDate={setSelectedDate} selectedDate={selectedDate} />

          {selectedDate && (
            <div className={styles.selectedInfo}>
              <p>
                <strong>Cycle start date:</strong> {new Date(selectedDate).toLocaleDateString()}
              </p>
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={styles.createBtn}
            onClick={handleCreateCycle}
            disabled={!isValidDate || loading}
          >
            {loading ? 'Creating...' : 'Create Cycle'}
          </button>
        </div>
      </div>
    </div>
  );
}
