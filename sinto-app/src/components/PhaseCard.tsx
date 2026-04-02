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

const phaseColors: Record<string, { bg: string; accent: string }> = {
  menstrual: { bg: '#fee2e2', accent: '#dc2626' },
  follicular: { bg: '#dbeafe', accent: '#2563eb' },
  ovulatory: { bg: '#fef3c7', accent: '#f59e0b' },
  luteal: { bg: '#f3e8ff', accent: '#a855f7' },
};

export default function PhaseCard({
  phase,
  cycleDay,
  contentSnippet,
}: PhaseCardProps) {
  const emoji = phaseEmojis[phase.toLowerCase()] || '📊';
  const colors = phaseColors[phase.toLowerCase()] || {
    bg: '#f5f5f7',
    accent: '#7c3aed',
  };

  return (
    <div className={styles.card} style={{ backgroundColor: colors.bg }}>
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
          <h4 className={styles.contentTitle} style={{ color: colors.accent }}>
            {contentSnippet.title}
          </h4>
          <p className={styles.contentBody}>{contentSnippet.body}</p>
        </div>
      )}
    </div>
  );
}
