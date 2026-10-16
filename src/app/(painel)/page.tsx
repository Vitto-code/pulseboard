import { BarChart } from '@/components/charts/BarChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { LineChart } from '@/components/charts/LineChart';
import { KpiCard } from '@/components/KpiCard';
import { formatCentsBRL } from '@/lib/format';
import { computeDashboardMetrics } from '@/lib/metrics';
import { getRepository } from '@/server/db';

export const dynamic = 'force-dynamic';

function formatCompactCents(cents: number): string {
  const reais = cents / 100;
  if (reais >= 1000) {
    return `R$ ${(reais / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`;
  }
  return formatCentsBRL(cents);
}

export default async function DashboardPage() {
  const customers = await getRepository().listAllCustomers();
  const metrics = computeDashboardMetrics(customers);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Visao geral</h1>
        <p className="text-sm text-zinc-500">Metricas calculadas a partir dos clientes cadastrados.</p>
      </div>

      <section aria-label="Indicadores" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="MRR" value={formatCentsBRL(metrics.mrrCents)} hint={`ARR de ${formatCentsBRL(metrics.arrCents)}`} />
        <KpiCard label="Clientes ativos" value={String(metrics.activeCustomers)} hint={`${metrics.totalCustomers} no total`} />
        <KpiCard
          label="Churn"
          value={`${(metrics.churnRate * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`}
          hint="cancelados sobre o total"
        />
        <KpiCard label="Novos no mes" value={String(metrics.newThisMonth)} hint="cadastros do mes atual" />
      </section>

      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold">MRR — ultimos 12 meses</h2>
          <LineChart data={metrics.mrrByMonth} ariaLabel="Evolucao do MRR nos ultimos 12 meses" formatValue={formatCompactCents} />
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-4 text-sm font-semibold">Novos clientes por mes</h2>
          <BarChart data={metrics.signupsByMonth} ariaLabel="Novos clientes por mes" />
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-4 text-sm font-semibold">Clientes por status</h2>
        <DonutChart data={metrics.statusDistribution} ariaLabel="Distribuicao de clientes por status" />
      </section>
    </div>
  );
}
