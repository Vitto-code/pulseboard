import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'pulseboard — painel de metricas SaaS',
    template: '%s — pulseboard',
  },
  description: 'Dashboard fullstack com autenticacao, CRUD de clientes e metricas de MRR.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-50">
        {children}
      </body>
    </html>
  );
}
