import { buildLinePoints, niceCeil, pointsToAreaPath, pointsToPath, yTicks } from '@/lib/chart-math';
import type { MonthPoint } from '@/lib/metrics';

interface LineChartProps {
  data: MonthPoint[];
  ariaLabel: string;
  formatValue?: (value: number) => string;
}

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = 32;

/** Grafico de linha renderizado no servidor: zero JavaScript no cliente. */
export function LineChart({ data, ariaLabel, formatValue = String }: LineChartProps) {
  const values = data.map((point) => point.value);
  const max = niceCeil(Math.max(...values, 0));
  const points = buildLinePoints(values, WIDTH, HEIGHT, PADDING, max);
  const ticks = yTicks(max);
  const labelEvery = Math.ceil(data.length / 6);
  const baseline = HEIGHT - PADDING;

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel} className="w-full">
      {ticks.map((tick) => {
        const y = PADDING + (HEIGHT - PADDING * 2) * (1 - tick / max);
        return (
          <g key={tick}>
            <line x1={PADDING} x2={WIDTH - PADDING} y1={y} y2={y} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
            <text x={PADDING - 6} y={y + 4} textAnchor="end" className="fill-zinc-500 text-[10px]">
              {formatValue(tick)}
            </text>
          </g>
        );
      })}

      {points.length > 0 && (
        <>
          <path d={pointsToAreaPath(points, baseline)} className="fill-blue-600/10" />
          <path d={pointsToPath(points)} fill="none" className="stroke-blue-600 dark:stroke-blue-400" strokeWidth="2" />
          {points.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="3" className="fill-blue-600 dark:fill-blue-400">
              <title>{`${data[index].label}: ${formatValue(data[index].value)}`}</title>
            </circle>
          ))}
        </>
      )}

      {data.map((point, index) =>
        index % labelEvery === 0 ? (
          <text
            key={point.label + index}
            x={points[index]?.x ?? 0}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-zinc-500 text-[10px]"
          >
            {point.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}
