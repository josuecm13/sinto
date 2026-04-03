import { useEffect, useMemo, useState } from 'react';
import type {
  DashboardLayoutState,
  DashboardWidgetDefinition,
  DashboardWidgetId,
  DashboardWidgetLayout,
} from '../types/dashboard';

const STORAGE_KEY = 'sinto.dashboard-layout.v1';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function buildDefaultState(
  definitions: DashboardWidgetDefinition[],
): DashboardLayoutState {
  return {
    version: 1,
    items: definitions.map((definition) => ({ ...definition.defaultLayout })),
  };
}

function sanitizeState(
  state: DashboardLayoutState | null,
  definitions: DashboardWidgetDefinition[],
): DashboardLayoutState {
  const definitionMap = new Map(
    definitions.map((definition) => [definition.id, definition]),
  );

  const incomingItems = state?.items ?? [];
  const sanitizedItems: DashboardWidgetLayout[] = [];

  for (const item of incomingItems) {
    const definition = definitionMap.get(item.id);

    if (!definition) {
      continue;
    }

    sanitizedItems.push({
      id: item.id,
      visible: item.visible ?? true,
      colSpan: clamp(
        item.colSpan ?? definition.defaultLayout.colSpan,
        definition.minColSpan,
        definition.maxColSpan,
      ),
      rowSpan: clamp(
        item.rowSpan ?? definition.defaultLayout.rowSpan,
        definition.minRowSpan,
        definition.maxRowSpan,
      ),
    });

    definitionMap.delete(item.id);
  }

  for (const definition of definitionMap.values()) {
    sanitizedItems.push({ ...definition.defaultLayout });
  }

  return {
    version: 1,
    items: sanitizedItems,
  };
}

function loadState(
  definitions: DashboardWidgetDefinition[],
): DashboardLayoutState {
  if (typeof window === 'undefined') {
    return buildDefaultState(definitions);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return buildDefaultState(definitions);
    }

    const parsed = JSON.parse(raw) as DashboardLayoutState;
    return sanitizeState(parsed, definitions);
  } catch {
    return buildDefaultState(definitions);
  }
}

export function useDashboardLayout(definitions: DashboardWidgetDefinition[]) {
  const [state, setState] = useState<DashboardLayoutState>(() =>
    loadState(definitions),
  );
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setState((current) => sanitizeState(current, definitions));
  }, [definitions]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const definitionMap = useMemo(
    () => new Map(definitions.map((definition) => [definition.id, definition])),
    [definitions],
  );

  function updateItem(
    id: DashboardWidgetId,
    updater: (item: DashboardWidgetLayout) => DashboardWidgetLayout,
  ) {
    setState((current) => ({
      ...current,
      items: current.items.map((item) => (item.id === id ? updater(item) : item)),
    }));
  }

  function moveWidget(sourceId: DashboardWidgetId, targetId: DashboardWidgetId) {
    if (sourceId === targetId) {
      return;
    }

    setState((current) => {
      const items = [...current.items];
      const sourceIndex = items.findIndex((item) => item.id === sourceId);
      const targetIndex = items.findIndex((item) => item.id === targetId);

      if (sourceIndex === -1 || targetIndex === -1) {
        return current;
      }

      const [sourceItem] = items.splice(sourceIndex, 1);
      items.splice(targetIndex, 0, sourceItem);

      return {
        ...current,
        items,
      };
    });
  }

  function toggleVisibility(id: DashboardWidgetId) {
    updateItem(id, (item) => ({
      ...item,
      visible: !item.visible,
    }));
  }

  function setVisibility(id: DashboardWidgetId, visible: boolean) {
    updateItem(id, (item) => ({
      ...item,
      visible,
    }));
  }

  function cycleWidth(id: DashboardWidgetId) {
    const definition = definitionMap.get(id);

    if (!definition) {
      return;
    }

    updateItem(id, (item) => {
      const nextColSpan =
        item.colSpan >= definition.maxColSpan
          ? definition.minColSpan
          : item.colSpan + 2;

      return {
        ...item,
        colSpan: clamp(nextColSpan, definition.minColSpan, definition.maxColSpan),
      };
    });
  }

  function cycleHeight(id: DashboardWidgetId) {
    const definition = definitionMap.get(id);

    if (!definition) {
      return;
    }

    updateItem(id, (item) => {
      const nextRowSpan =
        item.rowSpan >= definition.maxRowSpan
          ? definition.minRowSpan
          : item.rowSpan + 1;

      return {
        ...item,
        rowSpan: clamp(nextRowSpan, definition.minRowSpan, definition.maxRowSpan),
      };
    });
  }

  function resetLayout() {
    setState(buildDefaultState(definitions));
  }

  return {
    state,
    isEditMode,
    setIsEditMode,
    moveWidget,
    toggleVisibility,
    setVisibility,
    cycleWidth,
    cycleHeight,
    resetLayout,
  };
}
