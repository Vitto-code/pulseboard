import { donutSegments } from '@/lib/chart-math';
import { STATUS_LABELS } from '@/lib/format';
import type { StatusCount } from '@/lib/metrics';

interface DonutChartProps {
  data: StatusCount[];
  ariaLabel: string;
}

const COLORS = {
  TRIAL: 'stroke-amber-500',
  ACTIVE: 'stroke-green-500',
  CHURNED: 'stroke-red-500',
} as const;

const DOT_COLORS = {
  TRIAL: 'bg-amber-500',
  ACTIVE: 'bg-green-500',
  CHURNED: 'bg-red-500',
} as const;

const RADIUS = 15.9155; // circunferencia = 100
const CIRCUMFERENCE = 100;

/** Donut renderizado no servidor com segmentos via stroke-dasharray. */
export function DonutChart({ data, ariaLabel }: DonutChartProps) {
  const segments = donutSegments(data.map((entry) => entry.count));
  const total = data.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 42 42" role="img" aria-label={ariaLabel} className="w-36 shrink-0">
        <circle cx="21" cy="21" r={RADIUS} fill="none" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="6" />
        {segments.map((segment, index) =>
          segment.fraction > 0 ? (
            <circle
              key={data[index].status}
              cx="21"
              cy="21"
              r={RADIUS}
              fill="none"
              strokeWidth="6"
              strokeDasharray={`${segment.fraction * CIRCUMFERENCE} ${CIRCUMFERENCE - segment.fraction * CIRCUMFERENCE}`}
              strokeDashoffset={25 - segment.offset * CIRCUMFERENCE}
              className={COLORS[data[index].status]}
            >
              <title>{`${STATUS_LABELS[data[index].status]}: ${data[index].count}`}</title>
            </circle>
          ) : null,
        )}
        <text x="21" y="21" textAnchor="middle" dominantBaseline="central" className="fill-current text-[8px] font-bold">
          {total}
        </text>
      </svg>

      <ul className="flex flex-col gap-2 text-sm">
        {data.map((entry) => (
          <li key={entry.status} className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[entry.status]}`} aria-hidden="true" />
            <span className="text-zinc-600 dark:text-zinc-400">{STATUS_LABELS[entry.status]}</span>
            <span className="font-medium">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
