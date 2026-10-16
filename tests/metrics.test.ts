import { describe, expect, it } from 'vitest';
import {
  computeDashboardMetrics,
  lastMonths,
  mrrByMonth,
  signupsByMonth,
  statusDistribution,
} from '../src/lib/metrics';
import { makeCustomer } from './helpers/factories';

const REFERENCE = new Date(Date.UTC(2026, 9, 15, 12)); // 15 out 2026

describe('lastMonths', () => {
  it('retorna 12 meses terminando no mes de referencia', () => {
    const months = lastMonths(REFERENCE, 12);
    expect(months).toHaveLength(12);
    expect(months[0].key).toBe('2025-11');
    expect(months[11].key).toBe('2026-10');
    expect(months[11].label).toBe('out');
  });
});

describe('mrrByMonth', () => {
  it('soma MRR de clientes criados ate o fim do mes, exceto cancelados', () => {
    const customers = [
      makeCustomer({ mrrCents: 10_000, createdAt: new Date(Date.UTC(2026, 8, 10)), status: 'ACTIVE' }),
      makeCustomer({ mrrCents: 5_000, createdAt: new Date(Date.UTC(2026, 9, 5)), status: 'ACTIVE' }),
      makeCustomer({ mrrCents: 7_000, createdAt: new Date(Date.UTC(2026, 8, 1)), status: 'CHURNED' }),
    ];
    const result = mrrByMonth(customers, lastMonths(REFERENCE, 12));
    expect(result[10].value).toBe(10_000); // set: so o primeiro
    expect(result[11].value).toBe(15_000); // out: dois ativos
  });
});

describe('signupsByMonth', () => {
  it('conta cadastros dentro de cada mes', () => {
    const customers = [
      makeCustomer({ createdAt: new Date(Date.UTC(2026, 9, 1)) }),
      makeCustomer({ createdAt: new Date(Date.UTC(2026, 9, 31)) }),
      makeCustomer({ createdAt: new Date(Date.UTC(2026, 8, 30)) }),
    ];
    const result = signupsByMonth(customers, lastMonths(REFERENCE, 12));
    expect(result[11].value).toBe(2);
    expect(result[10].value).toBe(1);
    expect(result[0].value).toBe(0);
  });
});

describe('statusDistribution e metricas', () => {
  it('conta por status e calcula churn, MRR e ARR', () => {
    const customers = [
      makeCustomer({ status: 'ACTIVE', mrrCents: 10_000 }),
      makeCustomer({ status: 'ACTIVE', mrrCents: 20_000 }),
      makeCustomer({ status: 'TRIAL', mrrCents: 5_000 }),
      makeCustomer({ status: 'CHURNED', mrrCents: 99_000 }),
    ];
    const distribution = statusDistribution(customers);
    expect(distribution).toEqual([
      { status: 'TRIAL', count: 1 },
      { status: 'ACTIVE', count: 2 },
      { status: 'CHURNED', count: 1 },
    ]);

    const metrics = computeDashboardMetrics(customers, REFERENCE);
    expect(metrics.mrrCents).toBe(35_000); // trial conta como ativo
    expect(metrics.arrCents).toBe(420_000);
    expect(metrics.activeCustomers).toBe(3);
    expect(metrics.churnRate).toBe(0.25);
  });

  it('lida com base vazia sem dividir por zero', () => {
    const metrics = computeDashboardMetrics([], REFERENCE);
    expect(metrics.churnRate).toBe(0);
    expect(metrics.mrrCents).toBe(0);
    expect(metrics.mrrByMonth).toHaveLength(12);
  });
});
