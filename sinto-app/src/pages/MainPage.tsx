import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCycles } from '../hooks/useCycles';
import { usePrediction } from '../hooks/usePrediction';
import { usePhaseContent } from '../hooks/usePhaseContent';
import { useDashboardLayout } from '../hooks/useDashboardLayout';
import type { DashboardWidgetDefinition } from '../types/dashboard';
import CycleOverview from '../components/CycleOverview';
import DashboardGrid from '../components/DashboardGrid';
import FertilityWindow from '../components/FertilityWindow';
import PhaseCard from '../components/PhaseCard';
import QuickLogForm from '../components/QuickLogForm';
import TemperatureChart from '../components/TemperatureChart';
import CreateCycleModal from '../components/CreateCycleModal';
import styles from './MainPage.module.css';

interface DailyLog {
  id: string;
  date: string;
  temperature: number | null;
  isMenstruating: boolean;
  [key: string]: unknown;
}

function getPhaseFromDay(day: number): string {
  if (day <= 5) return 'Menstrual';
  if (day <= 13) return 'Follicular';
  if (day <= 16) return 'Ovulatory';
  return 'Luteal';
}

const widgetDefinitions: DashboardWidgetDefinition[] = [
  {
    id: 'temperature',
    title: 'Temperature trend',
    description: 'Basal body temperature history and pattern changes.',
    minColSpan: 4,
    maxColSpan: 12,
    minRowSpan: 1,
    maxRowSpan: 2,
    defaultLayout: { id: 'temperature', colSpan: 8, rowSpan: 2, visible: true },
  },
  {
    id: 'phase',
    title: 'Current phase',
    description: 'Phase status and guidance snippet.',
    minColSpan: 4,
    maxColSpan: 6,
    minRowSpan: 1,
    maxRowSpan: 2,
    defaultLayout: { id: 'phase', colSpan: 4, rowSpan: 1, visible: true },
  },
  {
    id: 'quick-log',
    title: 'Quick log',
    description: 'Fast entry for today’s cycle data.',
    minColSpan: 4,
    maxColSpan: 6,
    minRowSpan: 1,
    maxRowSpan: 2,
    defaultLayout: { id: 'quick-log', colSpan: 4, rowSpan: 1, visible: true },
  },
  {
    id: 'cycle-overview',
    title: 'Cycle overview',
    description: 'Cycle day, phase summary, and fertility progress.',
    minColSpan: 4,
    maxColSpan: 6,
    minRowSpan: 1,
    maxRowSpan: 2,
    defaultLayout: { id: 'cycle-overview', colSpan: 6, rowSpan: 1, visible: true },
  },
  {
    id: 'fertility-window',
    title: 'Fertility window',
    description: 'Window timing, ovulation estimate, and countdown.',
    minColSpan: 4,
    maxColSpan: 6,
    minRowSpan: 1,
    maxRowSpan: 2,
    defaultLayout: { id: 'fertility-window', colSpan: 6, rowSpan: 1, visible: true },
  },
];

export default function MainPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const {
    activeCycle,
    loading: cyclesLoading,
    error: cyclesError,
    refetch: refetchCycles,
  } = useCycles();
  const { prediction, loading: predictionLoading } = usePrediction(activeCycle?.id);
  const { phaseContent } = usePhaseContent(activeCycle?.id);
  const [logsData, setLogsData] = useState<DailyLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const {
    state: dashboardState,
    isEditMode,
    setIsEditMode,
    moveWidget,
    toggleVisibility,
    setVisibility,
    cycleWidth,
    cycleHeight,
    resetLayout,
  } = useDashboardLayout(widgetDefinitions);

  useEffect(() => {
    async function handleCycleLoaded() {
      if (!activeCycle) {
        setLogsData([]);
        return;
      }

      try {
        setLogsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/cycles/${activeCycle.id}`,
          {
            headers: {
              Authorization: `Bearer ${
                document.cookie
                  .split('; ')
                  .find((row) => row.startsWith('accessToken='))
                  ?.split('=')[1] || ''
              }`,
            },
          },
        );
        const data = await response.json();
        setLogsData(data.logs || []);
      } catch (err) {
        console.error('Failed to load logs:', err);
      } finally {
        setLogsLoading(false);
      }
    }

    handleCycleLoaded();
  }, [activeCycle]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleLogSuccess() {
    await refetchCycles();
  }

  if (!user) return null;

  const isLoading = cyclesLoading || predictionLoading || logsLoading;
  const cycleDay =
    prediction?.dailyProbability?.[prediction.dailyProbability.length - 1]?.cycleDay || 1;
  const currentPhase = getPhaseFromDay(cycleDay);

  const widgets = useMemo(() => {
    if (!activeCycle || !prediction) {
      return [];
    }

    return widgetDefinitions.map((definition) => ({
      ...definition,
      render: () => {
        switch (definition.id) {
          case 'temperature':
            return (
              <div className={styles.chartCard}>
                <div className={styles.widgetHeader}>
                  <div>
                    <p className={styles.widgetEyebrow}>Biometrics</p>
                    <h3 className={styles.widgetTitle}>Temperature Trend</h3>
                  </div>
                  <span className={styles.widgetBadge}>BBT</span>
                </div>
                <TemperatureChart logs={logsData} />
              </div>
            );
          case 'phase':
            return (
              <PhaseCard
                phase={currentPhase}
                cycleDay={cycleDay}
                contentSnippet={
                  phaseContent?.content?.GENERAL?.[0]
                    ? {
                        title: phaseContent.content.GENERAL[0].title,
                        body: phaseContent.content.GENERAL[0].body,
                      }
                    : null
                }
              />
            );
          case 'quick-log':
            return <QuickLogForm cycleId={activeCycle.id} onSuccess={handleLogSuccess} />;
          case 'cycle-overview':
            return (
              <CycleOverview
                cycleDay={cycleDay}
                currentDayProbability={prediction.summary.currentDayProbability}
                isCurrentlyFertile={prediction.summary.isCurrentlyFertile}
              />
            );
          case 'fertility-window':
            return (
              <FertilityWindow
                fertileStart={prediction.fertileWindow.fertileStart}
                fertileEnd={prediction.fertileWindow.fertileEnd}
                ovulationEstimate={prediction.fertileWindow.ovulationEstimate}
                isCurrentlyFertile={prediction.summary.isCurrentlyFertile}
                cycleDay={cycleDay}
              />
            );
          default:
            return null;
        }
      },
    }));
  }, [activeCycle, currentPhase, cycleDay, logsData, phaseContent, prediction]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.headerLabel}>Cycle Command Center</p>
          <span className={styles.logo}>Sinto</span>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={`${styles.toggleEditBtn} ${isEditMode ? styles.toggleEditBtnActive : ''}`}
            onClick={() => setIsEditMode(!isEditMode)}
          >
            {isEditMode ? 'Done editing' : 'Customize layout'}
          </button>
          <Link to="/settings" className={styles.settingsLink}>
            Settings
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Log out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.heroEyebrow}>Personal dashboard</p>
            <h1 className={styles.heroTitle}>Shape the app around the signals you track.</h1>
            <p className={styles.heroText}>
              Deep focus for daily logging, cycle prediction, and phase guidance with a layout
              you can tune over time.
            </p>
          </div>

          {prediction && (
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatLabel}>Cycle day</span>
                <strong className={styles.heroStatValue}>{cycleDay}</strong>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatLabel}>Current phase</span>
                <strong className={styles.heroStatValue}>{currentPhase}</strong>
              </div>
              <div className={styles.heroStat}>
                <span className={styles.heroStatLabel}>Fertility</span>
                <strong className={styles.heroStatValue}>
                  {(prediction.summary.currentDayProbability * 100).toFixed(0)}%
                </strong>
              </div>
            </div>
          )}
        </section>

        {cyclesError && (
          <div className={styles.errorMessage}>
            <p>Unable to load cycle data. Please refresh and try again.</p>
          </div>
        )}

        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p>Loading your cycle data...</p>
          </div>
        )}

        {!isLoading && !activeCycle && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <p className={styles.emptyStateEyebrow}>Start here</p>
              <h2 className={styles.emptyStateTitle}>Build your first cycle dashboard.</h2>
              <p className={styles.emptyStateText}>
                Create a cycle to unlock widgets for temperature, fertility, quick logging,
                and phase guidance.
              </p>
              <button
                className={styles.createCycleButton}
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create your first cycle
              </button>
            </div>
          </div>
        )}

        {!isLoading && activeCycle && prediction && (
          <DashboardGrid
            definitions={widgets}
            items={dashboardState.items}
            isEditMode={isEditMode}
            onMoveWidget={moveWidget}
            onToggleVisibility={toggleVisibility}
            onSetVisibility={setVisibility}
            onCycleWidth={cycleWidth}
            onCycleHeight={cycleHeight}
            onResetLayout={resetLayout}
          />
        )}
      </main>

      <CreateCycleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={async () => {
          await refetchCycles();
        }}
      />
    </div>
  );
}
