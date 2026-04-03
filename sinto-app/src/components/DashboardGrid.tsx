import { useEffect, useMemo, useState } from 'react';
import type {
  DashboardWidgetDefinition,
  DashboardWidgetId,
  DashboardWidgetLayout,
} from '../types/dashboard';
import styles from './DashboardGrid.module.css';

interface DashboardGridProps {
  definitions: Array<
    DashboardWidgetDefinition & {
      render: () => React.ReactNode;
    }
  >;
  items: DashboardWidgetLayout[];
  isEditMode: boolean;
  onMoveWidget: (sourceId: DashboardWidgetId, targetId: DashboardWidgetId) => void;
  onToggleVisibility: (id: DashboardWidgetId) => void;
  onSetVisibility: (id: DashboardWidgetId, visible: boolean) => void;
  onCycleWidth: (id: DashboardWidgetId) => void;
  onCycleHeight: (id: DashboardWidgetId) => void;
  onResetLayout: () => void;
}

function getColumnCount(width: number): number {
  if (width < 720) {
    return 1;
  }

  if (width < 1180) {
    return 6;
  }

  return 12;
}

function getSpanLabel(layout: DashboardWidgetLayout) {
  return `${layout.colSpan}c x ${layout.rowSpan}r`;
}

export default function DashboardGrid({
  definitions,
  items,
  isEditMode,
  onMoveWidget,
  onToggleVisibility,
  onSetVisibility,
  onCycleWidth,
  onCycleHeight,
  onResetLayout,
}: DashboardGridProps) {
  const [draggingId, setDraggingId] = useState<DashboardWidgetId | null>(null);
  const [columnCount, setColumnCount] = useState(() =>
    typeof window === 'undefined' ? 12 : getColumnCount(window.innerWidth),
  );

  useEffect(() => {
    function handleResize() {
      setColumnCount(getColumnCount(window.innerWidth));
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const definitionMap = useMemo(
    () => new Map(definitions.map((definition) => [definition.id, definition])),
    [definitions],
  );

  const visibleItems = items.filter((item) => item.visible);
  const hiddenItems = items
    .filter((item) => !item.visible)
    .map((item) => definitionMap.get(item.id))
    .filter(Boolean) as DashboardWidgetDefinition[];

  return (
    <section className={styles.section}>
      <div className={styles.toolbar}>
        <div>
          <p className={styles.eyebrow}>Dashboard</p>
          <h2 className={styles.heading}>Customizable widget view</h2>
          <p className={styles.description}>
            Reorder cards, resize them to the grid, and shape your cycle view around
            what you track most.
          </p>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onResetLayout}
          >
            Reset layout
          </button>
        </div>
      </div>

      {isEditMode && (
        <div className={styles.editPanel}>
          <div className={styles.editPanelHeader}>
            <div>
              <p className={styles.editLabel}>Customize mode</p>
              <p className={styles.editText}>
                Drag cards to reorder them. Resize with the width and height controls.
              </p>
            </div>
          </div>

          <div className={styles.hiddenWidgets}>
            {hiddenItems.length === 0 ? (
              <p className={styles.hiddenEmpty}>All widgets are currently visible.</p>
            ) : (
              hiddenItems.map((definition) => (
                <button
                  key={definition.id}
                  type="button"
                  className={styles.widgetChip}
                  onClick={() => onSetVisibility(definition.id, true)}
                >
                  Show {definition.title}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className={styles.grid}>
        {visibleItems.map((item) => {
          const definition = definitionMap.get(item.id);

          if (!definition) {
            return null;
          }

          const colSpan = Math.min(item.colSpan, columnCount);

          return (
            <article
              key={item.id}
              className={`${styles.widget} ${draggingId === item.id ? styles.dragging : ''}`}
              style={{
                gridColumn: `span ${colSpan}`,
                gridRow: `span ${item.rowSpan}`,
              }}
              draggable={isEditMode}
              onDragStart={() => setDraggingId(item.id)}
              onDragEnd={() => setDraggingId(null)}
              onDragOver={(event) => {
                if (isEditMode) {
                  event.preventDefault();
                }
              }}
              onDrop={(event) => {
                if (!isEditMode || !draggingId) {
                  return;
                }

                event.preventDefault();
                onMoveWidget(draggingId, item.id);
                setDraggingId(null);
              }}
            >
              {isEditMode && (
                <div className={styles.widgetControls}>
                  <div className={styles.widgetMeta}>
                    <span className={styles.widgetTitle}>{definition.title}</span>
                    <span className={styles.widgetSpan}>{getSpanLabel(item)}</span>
                  </div>

                  <div className={styles.widgetButtons}>
                    <button
                      type="button"
                      className={styles.controlButton}
                      onClick={() => onCycleWidth(item.id)}
                    >
                      Width
                    </button>
                    <button
                      type="button"
                      className={styles.controlButton}
                      onClick={() => onCycleHeight(item.id)}
                    >
                      Height
                    </button>
                    <button
                      type="button"
                      className={styles.controlButton}
                      onClick={() => onToggleVisibility(item.id)}
                    >
                      Hide
                    </button>
                  </div>
                </div>
              )}

              <div className={styles.widgetBody}>{definition.render()}</div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
