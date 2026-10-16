import { describe, expect, it } from 'vitest';
import { centsToReaisInput, formatCentsBRL, formatDate } from '../src/lib/format';

describe('formatCentsBRL', () => {
  it('formata centavos como moeda brasileira', () => {
    expect(formatCentsBRL(19_900)).toMatch(/199,00/);
    expect(formatCentsBRL(0)).toMatch(/0,00/);
  });
});

describe('centsToReaisInput', () => {
  it('converte centavos para formato de input com virgula', () => {
    expect(centsToReaisInput(19_900)).toBe('199,00');
    expect(centsToReaisInput(5)).toBe('0,05');
  });
});

describe('formatDate', () => {
  it('formata data em dd/mm/aaaa', () => {
    expect(formatDate(new Date(Date.UTC(2026, 9, 5)))).toBe('05/10/2026');
  });
});
