import { buildBars, niceCeil, yTicks } from '@/lib/chart-math';
import type { MonthPoint } from '@/lib/metrics';

interface BarChartProps {
  data: MonthPoint[];
  ariaLabel: string;
}

const WIDTH = 640;
const HEIGHT = 220;
const PADDING = 32;

/** Grafico de barras renderizado no servidor. */
export function BarChart({ data, ariaLabel }: BarChartProps) {
  const values = data.map((point) => point.value);
  const max = niceCeil(Math.max(...values, 0));
  const bars = buildBars(values, WIDTH, HEIGHT, PADDING, 0.35, max);
  const ticks = yTicks(max);
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={ariaLabel} className="w-full">
      {ticks.map((tick) => {
        const y = PADDING + (HEIGHT - PADDING * 2) * (1 - tick / max);
        return (
          <g key={tick}>
            <line x1={PADDING} x2={WIDTH - PADDING} y1={y} y2={y} className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="1" />
            <text x={PADDING - 6} y={y + 4} textAnchor="end" className="fill-zinc-500 text-[10px]">
              {tick}
            </text>
          </g>
        );
      })}

      {bars.map((bar, index) => (
        <rect key={index} x={bar.x} y={bar.y} width={bar.width} height={bar.height} rx="3" className="fill-blue-600 dark:fill-blue-400">
          <title>{`${data[index].label}: ${data[index].value}`}</title>
        </rect>
      ))}

      {data.map((point, index) =>
        index % labelEvery === 0 ? (
          <text
            key={point.label + index}
            x={(bars[index]?.x ?? 0) + (bars[index]?.width ?? 0) / 2}
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
