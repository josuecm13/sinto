import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useCycles } from '../hooks/useCycles';
import { usePrediction } from '../hooks/usePrediction';
import { usePhaseContent } from '../hooks/usePhaseContent';
import CycleOverview from '../components/CycleOverview';
import TemperatureChart from '../components/TemperatureChart';
import FertilityWindow from '../components/FertilityWindow';
import PhaseCard from '../components/PhaseCard';
import QuickLogForm from '../components/QuickLogForm';
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

export default function MainPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { activeCycle, loading: cyclesLoading, error: cyclesError, refetch: refetchCycles } = useCycles();
  const { prediction, loading: predictionLoading } = usePrediction(activeCycle?.id);
  const { phaseContent } = usePhaseContent(activeCycle?.id);
  const [logsData, setLogsData] = useState<DailyLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch logs when active cycle changes
  const handleCycleLoaded = async () => {
    if (!activeCycle) return;

    try {
      setLogsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/cycles/${activeCycle.id}`,
        {
          headers: {
            Authorization: `Bearer ${document.cookie
              .split('; ')
              .find(row => row.startsWith('accessToken='))
              ?.split('=')[1] || ''}`,
          },
        }
      );
      const data = await response.json();
      setLogsData(data.logs || []);
    } catch (err) {
      console.error('Failed to load logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Trigger logs fetch when active cycle updates
  if (activeCycle && logsData.length === 0 && !logsLoading) {
    handleCycleLoaded();
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  async function handleLogSuccess() {
    await refetchCycles();
    await handleCycleLoaded();
  }

  if (!user) return null;

  const isLoading = cyclesLoading || predictionLoading || logsLoading;
  const cycleDay = prediction?.dailyProbability?.[prediction.dailyProbability.length - 1]?.cycleDay || 1;

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
              <h2 className={styles.emptyStateTitle}>👋 Welcome to Sinto</h2>
              <p className={styles.emptyStateText}>
                You don't have an active cycle yet. Let's get started by creating your first cycle.
              </p>
              <button
                className={styles.createCycleButton}
                onClick={() => setIsCreateModalOpen(true)}
              >
                + Create Your First Cycle
              </button>
            </div>
          </div>
        )}

        {!isLoading && activeCycle && prediction && (
          <>
            <div className={styles.dashboard}>
              <div className={styles.chartSection}>
                <div className={styles.chartCard}>
                  <h3 className={styles.sectionTitle}>Temperature Trend</h3>
                  <TemperatureChart
                    logs={logsData}
                  />
                </div>
              </div>

              <div className={styles.sidebar}>
                <PhaseCard
                  phase={getPhaseFromDay(cycleDay)}
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

                <QuickLogForm
                  cycleId={activeCycle.id}
                  onSuccess={handleLogSuccess}
                />
              </div>
            </div>

            <div className={styles.cardsGrid}>
              <CycleOverview
                cycleDay={cycleDay}
                currentDayProbability={prediction.summary.currentDayProbability}
                isCurrentlyFertile={prediction.summary.isCurrentlyFertile}
              />

              <FertilityWindow
                fertileStart={prediction.fertileWindow.fertileStart}
                fertileEnd={prediction.fertileWindow.fertileEnd}
                ovulationEstimate={prediction.fertileWindow.ovulationEstimate}
                isCurrentlyFertile={prediction.summary.isCurrentlyFertile}
                cycleDay={cycleDay}
              />
            </div>
          </>
        )}
      </main>

      <CreateCycleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={async () => {
          await refetchCycles();
          await handleCycleLoaded();
        }}
      />
    </div>
  );
}
