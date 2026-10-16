/**
 * Matematica pura dos graficos SVG: escalas, caminhos e geometrias.
 * Separada dos componentes para ser 100% testavel.
 */

export interface Point {
  x: number;
  y: number;
}

export interface BarRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DonutSegment {
  /** Fracao do total, de 0 a 1. */
  fraction: number;
  /** Fracao acumulada antes deste segmento (inicio do arco). */
  offset: number;
}

/** Arredonda para cima ate um numero "bonito" (1, 2, 2.5 ou 5 vezes 10^n). */
export function niceCeil(value: number): number {
  if (value <= 0) {
    return 1;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  if (normalized <= 1) return magnitude;
  if (normalized <= 2) return 2 * magnitude;
  if (normalized <= 2.5) return 2.5 * magnitude;
  if (normalized <= 5) return 5 * magnitude;
  return 10 * magnitude;
}

export function scaleLinear(
  domainMin: number,
  domainMax: number,
  rangeMin: number,
  rangeMax: number,
): (value: number) => number {
  const span = domainMax - domainMin || 1;
  return (value: number) => rangeMin + ((value - domainMin) / span) * (rangeMax - rangeMin);
}

/** Pontos de uma linha dentro da area util (width x height menos padding). */
export function buildLinePoints(
  values: number[],
  width: number,
  height: number,
  padding: number,
  maxValue?: number,
): Point[] {
  if (values.length === 0) {
    return [];
  }
  const max = maxValue ?? niceCeil(Math.max(...values));
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const xStep = values.length > 1 ? innerWidth / (values.length - 1) : 0;
  const y = scaleLinear(0, max, padding + innerHeight, padding);

  return values.map((value, index) => ({
    x: padding + index * xStep,
    y: y(value),
  }));
}

export function pointsToPath(points: Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

/** Caminho fechado para a area sob a linha. */
export function pointsToAreaPath(points: Point[], baseline: number): string {
  if (points.length === 0) {
    return '';
  }
  const first = points[0];
  const last = points[points.length - 1];
  return `${pointsToPath(points)} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
}

export function buildBars(
  values: number[],
  width: number,
  height: number,
  padding: number,
  gapRatio = 0.3,
  maxValue?: number,
): BarRect[] {
  if (values.length === 0) {
    return [];
  }
  const max = maxValue ?? niceCeil(Math.max(...values));
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;
  const slot = innerWidth / values.length;
  const barWidth = slot * (1 - gapRatio);
  const y = scaleLinear(0, max, 0, innerHeight);

  return values.map((value, index) => {
    const barHeight = y(value);
    return {
      x: padding + index * slot + (slot - barWidth) / 2,
      y: padding + innerHeight - barHeight,
      width: barWidth,
      height: barHeight,
    };
  });
}

/** Segmentos do donut com fracoes acumuladas. Soma das fracoes e 1 (ou 0 sem dados). */
export function donutSegments(values: number[]): DonutSegment[] {
  const total = values.reduce((sum, value) => sum + value, 0);
  if (total <= 0) {
    return values.map(() => ({ fraction: 0, offset: 0 }));
  }
  let accumulated = 0;
  return values.map((value) => {
    const fraction = value / total;
    const segment = { fraction, offset: accumulated };
    accumulated += fraction;
    return segment;
  });
}

/** Ticks do eixo Y: `count` valores de 0 ate o maximo arredondado. */
export function yTicks(maxValue: number, count = 4): number[] {
  const max = niceCeil(maxValue);
  const ticks: number[] = [];
  for (let i = 0; i <= count; i += 1) {
    ticks.push((max / count) * i);
  }
  return ticks;
}
