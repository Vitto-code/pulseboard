import { describe, expect, it } from 'vitest';
import { verifyPassword } from '../src/server/auth/password';
import { buildDemoCustomers, buildDemoSeed, DEMO_PASSWORD, DEMO_PASSWORD_HASH } from '../src/server/db/demo-data';

describe('dados de demonstracao', () => {
  it('gera clientes deterministicos com e-mails unicos', () => {
    const a = buildDemoCustomers(new Date(Date.UTC(2026, 9, 16)));
    const b = buildDemoCustomers(new Date(Date.UTC(2026, 9, 16)));
    expect(a).toEqual(b);

    const emails = a.map((customer) => customer.email);
    expect(new Set(emails).size).toBe(emails.length);
  });

  it('distribui clientes ao longo de 12 meses', () => {
    const reference = new Date(Date.UTC(2026, 9, 16));
    const customers = buildDemoCustomers(reference);
    const months = new Set(customers.map((c) => c.createdAt?.toISOString().slice(0, 7)));
    expect(months.size).toBe(12);
  });

  it('o hash embutido corresponde a senha demo', async () => {
    expect(await verifyPassword(DEMO_PASSWORD, DEMO_PASSWORD_HASH)).toBe(true);
  });

  it('o seed em memoria inclui usuario demo e clientes', () => {
    const seed = buildDemoSeed(new Date(Date.UTC(2026, 9, 16)));
    expect(seed.users).toHaveLength(1);
    expect(seed.customers.length).toBeGreaterThan(40);
  });
});
