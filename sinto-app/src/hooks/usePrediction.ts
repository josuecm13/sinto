import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

export interface FertileWindow {
  fertileStart: string;
  fertileEnd: string;
  ovulationEstimate: string;
  peakMucusDay: string;
  bbtRiseDay: string;
}

export interface DailyProbability {
  date: string;
  cycleDay: number;
  probability: number;
  isFertile: boolean;
}

export interface PredictionSummary {
  estimatedOvulation: string;
  currentDayProbability: number;
  isCurrentlyFertile: boolean;
}

export interface CyclePredictionResult {
  cycleId: string;
  cycleStart: string;
  fertileWindow: FertileWindow;
  dailyProbability: DailyProbability[];
  summary: PredictionSummary;
}

interface UsePredictionReturn {
  prediction: CyclePredictionResult | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePrediction(cycleId?: string): UsePredictionReturn {
  const [prediction, setPrediction] = useState<CyclePredictionResult | null>(null);
  const [loading, setLoading] = useState(!!cycleId);
  const [error, setError] = useState<Error | null>(null);

  const fetchPrediction = async () => {
    if (!cycleId) {
      setPrediction(null);
      return;
    }

    try {
      setLoading(true);
      const data = await apiFetch<CyclePredictionResult>(
        `/cycles/${cycleId}/prediction`
      );
      setPrediction(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch prediction'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction();
  }, [cycleId]);

  return {
    prediction,
    loading,
    error,
    refetch: fetchPrediction,
  };
}
