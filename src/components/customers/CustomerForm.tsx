'use client';

import { useActionState } from 'react';
import type { CustomerFormState } from '@/app/actions/customers';
import { centsToReaisInput, PLAN_LABELS, STATUS_LABELS } from '@/lib/format';
import type { CustomerRecord, CustomerStatus, Plan } from '@/server/db/types';

type CustomerAction = (previous: CustomerFormState, formData: FormData) => Promise<CustomerFormState>;

interface CustomerFormProps {
  action: CustomerAction;
  defaultValues?: CustomerRecord;
  submitLabel: string;
}

const inputClass =
  'rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900';

const initialState: CustomerFormState = {};

export function CustomerForm({ action, defaultValues, submitLabel }: CustomerFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex max-w-lg flex-col gap-4">
      {state.formError && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">Nome</label>
        <input id="name" name="name" type="text" required defaultValue={defaultValues?.name} className={inputClass} />
        {state.fieldErrors?.name && <p className="text-xs text-red-600">{state.fieldErrors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">E-mail</label>
        <input id="email" name="email" type="email" required defaultValue={defaultValues?.email} className={inputClass} />
        {state.fieldErrors?.email && <p className="text-xs text-red-600">{state.fieldErrors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="company" className="text-sm font-medium">Empresa (opcional)</label>
        <input id="company" name="company" type="text" defaultValue={defaultValues?.company ?? ''} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="plan" className="text-sm font-medium">Plano</label>
          <select id="plan" name="plan" defaultValue={defaultValues?.plan ?? 'STARTER'} className={inputClass}>
            {(Object.keys(PLAN_LABELS) as Plan[]).map((plan) => (
              <option key={plan} value={plan}>{PLAN_LABELS[plan]}</option>
            ))}
          </select>
          {state.fieldErrors?.plan && <p className="text-xs text-red-600">{state.fieldErrors.plan}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <select id="status" name="status" defaultValue={defaultValues?.status ?? 'TRIAL'} className={inputClass}>
            {(Object.keys(STATUS_LABELS) as CustomerStatus[]).map((status) => (
              <option key={status} value={status}>{STATUS_LABELS[status]}</option>
            ))}
          </select>
          {state.fieldErrors?.status && <p className="text-xs text-red-600">{state.fieldErrors.status}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="mrr" className="text-sm font-medium">MRR (R$)</label>
        <input
          id="mrr"
          name="mrr"
          type="text"
          inputMode="decimal"
          required
          placeholder="199,00"
          defaultValue={defaultValues ? centsToReaisInput(defaultValues.mrrCents) : ''}
          className={inputClass}
        />
        {state.fieldErrors?.mrrCents ? (
          <p className="text-xs text-red-600">{state.fieldErrors.mrrCents}</p>
        ) : (
          <p className="text-xs text-zinc-500">Valor mensal em reais, ex.: 199,00</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : submitLabel}
        </button>
        <a
          href="/clientes"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancelar
        </a>
      </div>
    </form>
  );
}
