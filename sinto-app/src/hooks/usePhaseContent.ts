import { useState, useEffect } from 'react';
import { apiFetch } from '../api/client';

export interface PhaseContent {
  phase: 'MENSTRUAL' | 'FOLLICULAR' | 'OVULATORY' | 'LUTEAL';
  cycleDay: number;
  content: {
    EXERCISE: ContentItem[];
    NUTRITION: ContentItem[];
    TIPS: ContentItem[];
    DANGERS: ContentItem[];
    GENERAL: ContentItem[];
  };
}

export interface ContentItem {
  id: string;
  phase: string;
  category: string;
  title: string;
  body: string;
  locale: string;
}

interface UsePhaseContentReturn {
  phaseContent: PhaseContent | null;
  loading: boolean;
  error: Error | null;
}

export function usePhaseContent(cycleId?: string, locale = 'en'): UsePhaseContentReturn {
  const [phaseContent, setPhaseContent] = useState<PhaseContent | null>(null);
  const [loading, setLoading] = useState(!!cycleId);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!cycleId) {
      setPhaseContent(null);
      return;
    }

    const fetchPhaseContent = async () => {
      try {
        setLoading(true);
        const data = await apiFetch<PhaseContent>(
          `/phases/current?cycleId=${cycleId}&locale=${locale}`
        );
        setPhaseContent(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch phase content'));
      } finally {
        setLoading(false);
      }
    };

    fetchPhaseContent();
  }, [cycleId, locale]);

  return {
    phaseContent,
    loading,
    error,
  };
}
