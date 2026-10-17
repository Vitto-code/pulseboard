import type { CreateCustomerData, CustomerRecord, Plan, UserRecord } from './types';

/**
 * Dados de demonstracao deterministicos (semente fixa), usados tanto pelo
 * seed do Prisma quanto pelo modo demo em memoria.
 */

export const DEMO_USER = {
  name: 'Usuario Demo',
  email: 'demo@pulseboard.dev',
} as const;

export const DEMO_PASSWORD = 'demo1234';

/** Hash bcrypt (10 rounds) de DEMO_PASSWORD, pre-computado para o seed sincrono. */
export const DEMO_PASSWORD_HASH = '$2b$10$AyKUrpf3w6tJgKSm6.HXMuTg.ywoJaR/Uepb91S1i1fc1/2DU./cW';

const FIRST_NAMES = [
  'Ana', 'Bruno', 'Carla', 'Diego', 'Elisa', 'Fabio', 'Gabi', 'Henrique',
  'Ines', 'Joao', 'Karen', 'Lucas', 'Marina', 'Nicolas', 'Olivia', 'Paulo',
];
const LAST_NAMES = [
  'Almeida', 'Barros', 'Cardoso', 'Duarte', 'Esteves', 'Farias',
  'Gomes', 'Holanda', 'Ibanez', 'Junqueira', 'Lacerda', 'Moraes',
];
const COMPANIES = [
  'Acme', 'Nubelar', 'Vertex', 'Kzen', 'Atlantica', 'Ponto Sul',
  'Mirante', 'Alavanca', 'Sinal Aberto', 'Vetor Norte', null, null,
];

const PLAN_MRR: Record<Plan, [number, number]> = {
  STARTER: [4_900, 9_900],
  PRO: [19_900, 49_900],
  ENTERPRISE: [99_900, 299_000],
};

/** PRNG deterministico (mulberry32) para seeds reproduziveis. */
function mulberry32(seed: number): () => number {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Gera 60 clientes distribuidos em 12 meses com crescimento gradual. */
export function buildDemoCustomers(reference: Date = new Date()): CreateCustomerData[] {
  const random = mulberry32(42);
  const customers: CreateCustomerData[] = [];
  const usedEmails = new Set<string>();
  let index = 0;

  for (let monthsAgo = 11; monthsAgo >= 0; monthsAgo -= 1) {
    // Crescimento: 2 cadastros no mes mais antigo ate 9 no atual.
    const signups = 2 + Math.round(((9 - 2) * (11 - monthsAgo)) / 11);
    for (let s = 0; s < signups; s += 1) {
      const first = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
      const last = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
      const name = `${first} ${last}`;
      const email = `${first}.${last}.${index}@exemplo.com`.toLowerCase();
      if (usedEmails.has(email)) {
        continue;
      }
      usedEmails.add(email);

      const planRoll = random();
      const plan: Plan = planRoll < 0.5 ? 'STARTER' : planRoll < 0.85 ? 'PRO' : 'ENTERPRISE';
      const [min, max] = PLAN_MRR[plan];
      const mrrCents = Math.round((min + random() * (max - min)) / 100) * 100;

      // Clientes antigos tem mais chance de cancelamento; recentes, de trial.
      const statusRoll = random();
      const status =
        monthsAgo > 3
          ? statusRoll < 0.2
            ? 'CHURNED'
            : 'ACTIVE'
          : statusRoll < 0.15
            ? 'TRIAL'
            : statusRoll < 0.95
              ? 'ACTIVE'
              : 'CHURNED';

      // No mes corrente, limita o dia ao dia de hoje para nao criar
      // cadastros "no futuro".
      const maxDay = monthsAgo === 0 ? reference.getUTCDate() : 28;
      const day = 1 + Math.floor(random() * Math.max(1, maxDay - 1));
      customers.push({
        name,
        email,
        company: COMPANIES[Math.floor(random() * COMPANIES.length)],
        plan,
        status,
        mrrCents,
        createdAt: new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - monthsAgo, day, 12)),
      });
      index += 1;
    }
  }
  return customers;
}

/** Seed completo para o repositorio em memoria (modo demo). */
export function buildDemoSeed(reference: Date = new Date()): { users: UserRecord[]; customers: CustomerRecord[] } {
  const now = new Date();
  const user: UserRecord = {
    id: 'demo-user',
    email: DEMO_USER.email,
    name: DEMO_USER.name,
    passwordHash: DEMO_PASSWORD_HASH,
    createdAt: now,
  };
  const customers: CustomerRecord[] = buildDemoCustomers(reference).map((data, i) => ({
    id: `demo-customer-${String(i + 1).padStart(3, '0')}`,
    name: data.name,
    email: data.email,
    company: data.company ?? null,
    plan: data.plan,
    status: data.status,
    mrrCents: data.mrrCents,
    createdAt: data.createdAt ?? now,
    updatedAt: data.createdAt ?? now,
  }));
  return { users: [user], customers };
}
