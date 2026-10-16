'use client';

import { useState, useTransition } from 'react';
import { deleteCustomerAction } from '@/app/actions/customers';

export function DeleteCustomerButton({ customerId, customerName }: { customerId: string; customerName: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Excluir o cliente "${customerName}"? Esta acao nao pode ser desfeita.`)) {
      return;
    }
    startTransition(async () => {
      const result = await deleteCustomerAction(customerId);
      setError(result.error ?? null);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
      >
        {isPending ? 'Excluindo...' : 'Excluir'}
      </button>
      {error && (
        <span role="alert" className="ml-2 text-xs text-red-600">
          {error}
        </span>
      )}
    </>
  );
}
