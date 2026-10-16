import { describe, expect, it } from 'vitest';
import {
  buildBars,
  buildLinePoints,
  donutSegments,
  niceCeil,
  pointsToAreaPath,
  pointsToPath,
  scaleLinear,
  yTicks,
} from '../src/lib/chart-math';

describe('niceCeil', () => {
  it('arredonda para o proximo numero bonito', () => {
    expect(niceCeil(0)).toBe(1);
    expect(niceCeil(3)).toBe(5);
    expect(niceCeil(42)).toBe(50);
    expect(niceCeil(101)).toBe(200);
    expect(niceCeil(2500)).toBe(2500);
    expect(niceCeil(2501)).toBe(5000);
  });
});

describe('scaleLinear', () => {
  it('mapeia dominio para imagem e evita divisao por zero', () => {
    const scale = scaleLinear(0, 100, 0, 10);
    expect(scale(50)).toBe(5);
    const flat = scaleLinear(5, 5, 0, 10);
    expect(Number.isFinite(flat(5))).toBe(true);
  });
});

describe('buildLinePoints e paths', () => {
  it('inverte o eixo Y (maior valor no topo) e respeita o padding', () => {
    const points = buildLinePoints([0, 50, 100], 640, 220, 32, 100);
    expect(points[0].y).toBeGreaterThan(points[2].y);
    expect(points[0].x).toBe(32);
    expect(points[2].x).toBe(640 - 32);
  });

  it('gera path de linha e area fechada', () => {
    const points = [
      { x: 0, y: 10 },
      { x: 5, y: 0 },
    ];
    expect(pointsToPath(points)).toBe('M 0 10 L 5 0');
    expect(pointsToAreaPath(points, 20)).toBe('M 0 10 L 5 0 L 5 20 L 0 20 Z');
  });

  it('retorna lista vazia sem valores', () => {
    expect(buildLinePoints([], 640, 220, 32)).toEqual([]);
    expect(pointsToAreaPath([], 20)).toBe('');
  });
});

describe('buildBars', () => {
  it('altura zero para valor zero e maxima para o maior valor', () => {
    const bars = buildBars([0, 100], 640, 220, 32, 0.3, 100);
    expect(bars[0].height).toBe(0);
    expect(bars[1].height).toBeCloseTo(220 - 64, 5);
  });
});

describe('donutSegments', () => {
  it('fracoes somam 1 e offsets sao acumulados', () => {
    const segments = donutSegments([1, 2, 1]);
    expect(segments.map((s) => s.fraction)).toEqual([0.25, 0.5, 0.25]);
    expect(segments.map((s) => s.offset)).toEqual([0, 0.25, 0.75]);
  });

  it('sem dados retorna fracoes zeradas', () => {
    expect(donutSegments([0, 0])).toEqual([
      { fraction: 0, offset: 0 },
      { fraction: 0, offset: 0 },
    ]);
  });
});

describe('yTicks', () => {
  it('gera ticks de 0 ate o maximo arredondado', () => {
    expect(yTicks(40, 4)).toEqual([0, 12.5, 25, 37.5, 50]);
    expect(yTicks(20, 4)).toEqual([0, 5, 10, 15, 20]);
  });
});
