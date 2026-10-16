'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { registerAction, type AuthFormState } from '@/app/actions/auth';

const initialState: AuthFormState = {};

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.formError && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
          {state.formError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Nome
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {state.fieldErrors?.name && <p className="text-xs text-red-600">{state.fieldErrors.name}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {state.fieldErrors?.email && <p className="text-xs text-red-600">{state.fieldErrors.email}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {state.fieldErrors?.password ? (
          <p className="text-xs text-red-600">{state.fieldErrors.password}</p>
        ) : (
          <p className="text-xs text-zinc-500">Minimo de 8 caracteres.</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-800 disabled:opacity-50"
      >
        {isPending ? 'Criando conta...' : 'Criar conta'}
      </button>

      <p className="text-center text-sm text-zinc-500">
        Ja tem conta?{' '}
        <Link href="/entrar" className="text-blue-700 hover:underline dark:text-blue-400">
          Entrar
        </Link>
      </p>
    </form>
  );
}
