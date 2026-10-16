import Link from 'next/link';
import { formatCentsBRL, formatDate, PLAN_LABELS } from '@/lib/format';
import type { CustomerRecord } from '@/server/db/types';
import { DeleteCustomerButton } from './DeleteCustomerButton';
import { StatusBadge } from './StatusBadge';

export function CustomerTable({ customers }: { customers: CustomerRecord[] }) {
  if (customers.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 px-6 py-12 text-center text-sm text-zinc-500 dark:border-zinc-700">
        Nenhum cliente encontrado. Ajuste os filtros ou cadastre o primeiro cliente.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 text-xs uppercase text-zinc-500 dark:border-zinc-800">
          <tr>
            <th scope="col" className="px-4 py-3">Cliente</th>
            <th scope="col" className="px-4 py-3">Plano</th>
            <th scope="col" className="px-4 py-3">Status</th>
            <th scope="col" className="px-4 py-3 text-right">MRR</th>
            <th scope="col" className="px-4 py-3">Desde</th>
            <th scope="col" className="px-4 py-3 text-right">Acoes</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
              <td className="px-4 py-3">
                <p className="font-medium">{customer.name}</p>
                <p className="text-xs text-zinc-500">
                  {customer.email}
                  {customer.company ? ` · ${customer.company}` : ''}
                </p>
              </td>
              <td className="px-4 py-3">{PLAN_LABELS[customer.plan]}</td>
              <td className="px-4 py-3">
                <StatusBadge status={customer.status} />
              </td>
              <td className="px-4 py-3 text-right font-medium">{formatCentsBRL(customer.mrrCents)}</td>
              <td className="px-4 py-3 text-zinc-500">{formatDate(customer.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/clientes/${customer.id}/editar`}
                  className="mr-3 text-sm text-blue-700 hover:underline dark:text-blue-400"
                >
                  Editar
                </Link>
                <DeleteCustomerButton customerId={customer.id} customerName={customer.name} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
