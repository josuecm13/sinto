import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

export interface Cycle {
  id: string;
  userId: string;
  startDate: string;
  endDate: string | null;
  cycleLength: number | null;
  lutealPhaseLength: number | null;
  createdAt: string;
  updatedAt: string;
  logsCount: number;
}

interface UseCyclesReturn {
  cycles: Cycle[];
  activeCycle: Cycle | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useCycles(): UseCyclesReturn {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Cycle[]>('/cycles');
      setCycles(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch cycles'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycles();
  }, []);

  const activeCycle = cycles.find(c => !c.endDate) || null;

  return {
    cycles,
    activeCycle,
    loading,
    error,
    refetch: fetchCycles,
  };
}
