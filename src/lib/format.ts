/** Formatadores compartilhados de moeda, data e labels de dominio. */

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  timeZone: 'UTC',
});

export function formatCentsBRL(cents: number): string {
  return currencyFormatter.format(cents / 100);
}

/** Converte centavos para o formato esperado no input (1234,56). */
export function centsToReaisInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export const PLAN_LABELS = {
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
} as const;

export const STATUS_LABELS = {
  TRIAL: 'Trial',
  ACTIVE: 'Ativo',
  CHURNED: 'Cancelado',
} as const;
