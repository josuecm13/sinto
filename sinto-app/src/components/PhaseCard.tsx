import styles from './PhaseCard.module.css';

interface ContentSnippet {
  title: string;
  body: string;
}

interface PhaseCardProps {
  phase: string;
  cycleDay: number;
  contentSnippet?: ContentSnippet | null;
}

const phaseEmojis: Record<string, string> = {
  menstrual: '🔴',
  follicular: '🌱',
  ovulatory: '🌕',
  luteal: '🌙',
};

export default function PhaseCard({
  phase,
  cycleDay,
  contentSnippet,
}: PhaseCardProps) {
  const emoji = phaseEmojis[phase.toLowerCase()] || '📊';
  const phaseTone = phase.toLowerCase();

  return (
    <div className={`${styles.card} ${styles[phaseTone] ?? ''}`}>
      <div className={styles.header}>
        <div className={styles.phaseInfo}>
          <span className={styles.emoji}>{emoji}</span>
          <div>
            <h3 className={styles.phaseName}>{phase}</h3>
            <p className={styles.cycleDay}>Day {cycleDay}</p>
          </div>
        </div>
      </div>

      {contentSnippet && (
        <div className={styles.content}>
          <h4 className={styles.contentTitle}>{contentSnippet.title}</h4>
          <p className={styles.contentBody}>{contentSnippet.body}</p>
        </div>
      )}
    </div>
  );
}
