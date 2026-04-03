export type DashboardWidgetId =
  | 'temperature'
  | 'phase'
  | 'quick-log'
  | 'cycle-overview'
  | 'fertility-window';

export interface DashboardWidgetLayout {
  id: DashboardWidgetId;
  colSpan: number;
  rowSpan: number;
  visible: boolean;
}

export interface DashboardLayoutState {
  version: 1;
  items: DashboardWidgetLayout[];
}

export interface DashboardWidgetDefinition {
  id: DashboardWidgetId;
  title: string;
  description: string;
  minColSpan: number;
  maxColSpan: number;
  minRowSpan: number;
  maxRowSpan: number;
  defaultLayout: DashboardWidgetLayout;
}
