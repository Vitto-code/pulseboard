import type { CustomerRecord, CustomerStatus } from '@/server/db/types';

/** Metricas calculadas de forma pura a partir dos clientes (testavel sem banco). */

export interface MonthBucket {
  /** Chave ISO do mes, ex.: "2026-10". */
  key: string;
  /** Rotulo curto em pt-BR, ex.: "out". */
  label: string;
  start: Date;
  end: Date;
}

export interface MonthPoint {
  label: string;
  value: number;
}

export interface StatusCount {
  status: CustomerStatus;
  count: number;
}

export interface DashboardMetrics {
  mrrCents: number;
  arrCents: number;
  activeCustomers: number;
  totalCustomers: number;
  /** Cancelados / total, de 0 a 1. */
  churnRate: number;
  newThisMonth: number;
  mrrByMonth: MonthPoint[];
  signupsByMonth: MonthPoint[];
  statusDistribution: StatusCount[];
}

const monthLabelFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  timeZone: 'UTC',
});

/** Ultimos `count` meses terminando no mes da data de referencia. */
export function lastMonths(reference: Date = new Date(), count = 12): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  const year = reference.getUTCFullYear();
  const month = reference.getUTCMonth();

  for (let i = count - 1; i >= 0; i -= 1) {
    const start = new Date(Date.UTC(year, month - i, 1));
    const end = new Date(Date.UTC(year, month - i + 1, 1) - 1);
    buckets.push({
      key: start.toISOString().slice(0, 7),
      label: monthLabelFormatter.format(start).replace('.', ''),
      start,
      end,
    });
  }
  return buckets;
}

/**
 * MRR ao fim de cada mes: soma do MRR dos clientes criados ate o fim do mes
 * e que nao estao cancelados. Aproximacao documentada: sem historico de
 * cancelamento, o status atual vale para todos os meses.
 */
export function mrrByMonth(customers: CustomerRecord[], months: MonthBucket[]): MonthPoint[] {
  return months.map((bucket) => ({
    label: bucket.label,
    value: customers
      .filter((customer) => customer.createdAt <= bucket.end && customer.status !== 'CHURNED')
      .reduce((sum, customer) => sum + customer.mrrCents, 0),
  }));
}

export function signupsByMonth(customers: CustomerRecord[], months: MonthBucket[]): MonthPoint[] {
  return months.map((bucket) => ({
    label: bucket.label,
    value: customers.filter(
      (customer) => customer.createdAt >= bucket.start && customer.createdAt <= bucket.end,
    ).length,
  }));
}

export function statusDistribution(customers: CustomerRecord[]): StatusCount[] {
  const statuses: CustomerStatus[] = ['TRIAL', 'ACTIVE', 'CHURNED'];
  return statuses.map((status) => ({
    status,
    count: customers.filter((customer) => customer.status === status).length,
  }));
}

export function computeDashboardMetrics(
  customers: CustomerRecord[],
  reference: Date = new Date(),
): DashboardMetrics {
  const months = lastMonths(reference, 12);
  const currentMonth = months[months.length - 1];
  const active = customers.filter((customer) => customer.status !== 'CHURNED');
  const mrrCents = active.reduce((sum, customer) => sum + customer.mrrCents, 0);

  return {
    mrrCents,
    arrCents: mrrCents * 12,
    activeCustomers: active.length,
    totalCustomers: customers.length,
    churnRate: customers.length === 0 ? 0 : statusDistribution(customers)[2].count / customers.length,
    newThisMonth: customers.filter(
      (customer) => customer.createdAt >= currentMonth.start && customer.createdAt <= currentMonth.end,
    ).length,
    mrrByMonth: mrrByMonth(customers, months),
    signupsByMonth: signupsByMonth(customers, months),
    statusDistribution: statusDistribution(customers),
  };
}
