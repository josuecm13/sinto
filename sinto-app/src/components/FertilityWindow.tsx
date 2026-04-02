import styles from './FertilityWindow.module.css';

interface FertilityWindowProps {
  fertileStart: string;
  fertileEnd: string;
  ovulationEstimate: string;
  isCurrentlyFertile: boolean;
  cycleDay: number;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const today = new Date();
  const diffMs = target.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export default function FertilityWindow({
  fertileStart,
  fertileEnd,
  ovulationEstimate,
  isCurrentlyFertile,
}: FertilityWindowProps) {
  const daysUntilOvulation = getDaysUntil(ovulationEstimate);
  const daysRemaining = getDaysUntil(fertileEnd);
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.heading}>Fertility Window</h3>
          <div className={styles.status}>
            <span
              className={`${styles.indicator} ${isCurrentlyFertile ? styles.fertile : ''}`}
            />
            <span className={styles.statusText}>
              {isCurrentlyFertile ? 'Currently Fertile 🔥' : 'Not Fertile'}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Fertility Period</span>
          <span className={styles.value}>
            {formatDate(fertileStart)} – {formatDate(fertileEnd)}
          </span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Days Remaining</span>
          <span className={styles.value}>{daysRemaining} days</span>
        </div>

        <div className={styles.divider} />

        <div className={styles.infoRow}>
          <span className={styles.label}>Estimated Ovulation</span>
          <span className={styles.value}>{formatDate(ovulationEstimate)}</span>
        </div>

        <div className={styles.infoRow}>
          <span className={styles.label}>Days Until</span>
          <span className={styles.value}>{daysUntilOvulation} days</span>
        </div>
      </div>
    </div>
  );
}
