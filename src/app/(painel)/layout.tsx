import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentUser, logoutAction } from '@/app/actions/auth';
import { NavLink } from '@/components/NavLink';

export default async function PainelLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/entrar');
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
          <span className="text-lg font-bold tracking-tight text-blue-700 dark:text-blue-400">pulseboard</span>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navegacao principal">
          <NavLink href="/" label="Visao geral" />
          <NavLink href="/clientes" label="Clientes" />
        </nav>

        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="truncate text-xs text-zinc-500">{user.email}</p>
          <form action={logoutAction} className="mt-3">
            <button
              type="submit"
              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              Sair
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 px-8 py-6">{children}</main>
    </div>
  );
}
