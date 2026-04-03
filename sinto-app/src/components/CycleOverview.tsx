import styles from './CycleOverview.module.css';

interface CycleOverviewProps {
  cycleDay: number;
  currentDayProbability: number;
  isCurrentlyFertile: boolean;
}

const phaseEmojis: Record<number, string> = {
  1: '🔴',
  2: '🌱',
  3: '🌱',
  4: '🌱',
  5: '🌱',
  6: '🌱',
  7: '🌕',
  8: '🌕',
  9: '🌕',
  10: '🌙',
  11: '🌙',
  12: '🌙',
};

const phaseNames: Record<number, string> = {
  1: 'Menstrual',
  2: 'Follicular',
  3: 'Follicular',
  4: 'Follicular',
  5: 'Follicular',
  6: 'Follicular',
  7: 'Ovulatory',
  8: 'Ovulatory',
  9: 'Ovulatory',
  10: 'Luteal',
  11: 'Luteal',
  12: 'Luteal',
};

export default function CycleOverview({
  cycleDay,
  currentDayProbability,
  isCurrentlyFertile,
}: CycleOverviewProps) {
  const avgCycleLength = 28;
  const progressPercent = (cycleDay / avgCycleLength) * 100;
  const emoji = phaseEmojis[cycleDay] || '📊';
  const phaseName = phaseNames[cycleDay] || 'Unknown';
  const badgeClassName = isCurrentlyFertile
    ? `${styles.badge} ${styles.badgeActive}`
    : `${styles.badge} ${styles.badgeMuted}`;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>
          <span className={styles.emoji}>{emoji}</span>
          <div>
            <h3 className={styles.heading}>Cycle Status</h3>
            <p className={styles.phase}>{phaseName}</p>
          </div>
        </div>
        <div className={badgeClassName}>
          {isCurrentlyFertile ? '🔥 Fertile' : '◯ Not Fertile'}
        </div>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.label}>Day</span>
          <span className={styles.value}>{cycleDay}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>Fertile</span>
          <span className={styles.value}>
            {(currentDayProbability * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progress}>
          <div
            className={styles.progressBar}
            style={{
              width: `${Math.min(progressPercent, 100)}%`,
            }}
          />
        </div>
        <span className={styles.progressText}>
          {cycleDay} / {avgCycleLength} days
        </span>
      </div>
    </div>
  );
}
