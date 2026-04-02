import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Log {
  date: string;
  temperature: number | null;
  [key: string]: unknown;
}

interface ChartDataPoint {
  date: string;
  fullDate: string;
  temperature: number;
}

interface TemperatureChartProps {
  logs: Log[];
}

function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export default function TemperatureChart({
  logs,
}: TemperatureChartProps) {
  const chartData: ChartDataPoint[] = logs
    .filter((log): log is Log & { temperature: number } =>
      log.temperature !== null && log.temperature !== undefined
    )
    .map(log => ({
      date: formatDateShort(log.date),
      fullDate: log.date,
      temperature: log.temperature,
    }));

  if (chartData.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-muted)' }}>
        <p>No temperature data yet. Start logging to see your BBT trend.</p>
      </div>
    );
  }

  const temperatures = chartData.map(d => d.temperature);
  const minTemp = Math.min(...temperatures) - 0.5;
  const maxTemp = Math.max(...temperatures) + 0.5;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
          stroke="var(--color-border)"
        />
        <YAxis
          domain={[minTemp, maxTemp]}
          label={{ value: '°C', angle: -90, position: 'insideLeft' }}
          tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
          stroke="var(--color-border)"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
          }}
          formatter={(value) => [(value as number).toFixed(2), 'BBT']}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="temperature"
          stroke="var(--color-primary)"
          name="Temperature"
          dot={{ r: 3, fill: 'var(--color-primary)' }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
