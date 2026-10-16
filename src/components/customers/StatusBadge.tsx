import { STATUS_LABELS } from '@/lib/format';
import type { CustomerStatus } from '@/server/db/types';

const STYLES: Record<CustomerStatus, string> = {
  TRIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  ACTIVE: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  CHURNED: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
};

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
