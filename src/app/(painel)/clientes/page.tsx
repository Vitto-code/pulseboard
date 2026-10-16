import type { Metadata } from 'next';
import Link from 'next/link';
import { CustomerTable } from '@/components/customers/CustomerTable';
import { Pagination } from '@/components/customers/Pagination';
import { STATUS_LABELS } from '@/lib/format';
import { listCustomers } from '@/server/customers/service';
import { getRepository } from '@/server/db';
import type { CustomerStatus } from '@/server/db/types';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Clientes',
};

const PER_PAGE = 10;

interface ClientesPageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

function parseStatus(raw: string | undefined): CustomerStatus | undefined {
  return raw && raw in STATUS_LABELS ? (raw as CustomerStatus) : undefined;
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() || undefined;
  const status = parseStatus(params.status);
  const page = Math.max(1, Number.parseInt(params.page ?? '1', 10) || 1);

  const result = await listCustomers(getRepository(), { query, status, page, perPage: PER_PAGE });

  const baseParams = new URLSearchParams();
  if (query) baseParams.set('q', query);
  if (status) baseParams.set('status', status);

  const inputClass =
    'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900';

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-zinc-500">{result.total} clientes no total</p>
        </div>
        <Link
          href="/clientes/nova"
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800"
        >
          Novo cliente
        </Link>
      </div>

      <form method="GET" action="/clientes" className="mb-4 flex flex-wrap gap-3">
        <input
          type="search"
          name="q"
          placeholder="Buscar por nome, e-mail ou empresa"
          defaultValue={query}
          className={`${inputClass} w-72`}
          aria-label="Buscar clientes"
        />
        <select name="status" defaultValue={status ?? ''} className={inputClass} aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          {(Object.keys(STATUS_LABELS) as CustomerStatus[]).map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Filtrar
        </button>
      </form>

      <CustomerTable customers={result.items} />
      <Pagination page={result.page} pageCount={result.pageCount} baseQuery={baseParams.toString()} />
    </div>
  );
}
