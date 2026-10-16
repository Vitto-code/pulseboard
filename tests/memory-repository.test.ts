import { describe, expect, it } from 'vitest';
import { createMemoryRepository } from '../src/server/db/memory-repository';
import { makeCustomer, makeCustomerData } from './helpers/factories';

describe('memory repository: clientes', () => {
  it('pagina resultados e informa o total', async () => {
    const repo = createMemoryRepository();
    for (let i = 0; i < 15; i += 1) {
      await repo.createCustomer(makeCustomerData({ createdAt: new Date(Date.UTC(2026, 0, i + 1)) }));
    }
    const page1 = await repo.listCustomers({ page: 1, perPage: 10 });
    const page2 = await repo.listCustomers({ page: 2, perPage: 10 });
    expect(page1.items).toHaveLength(10);
    expect(page2.items).toHaveLength(5);
    expect(page1.total).toBe(15);
    expect(page1.pageCount).toBe(2);
  });

  it('filtra por texto em nome, e-mail e empresa (case-insensitive)', async () => {
    const repo = createMemoryRepository();
    await repo.createCustomer(makeCustomerData({ name: 'Ana Acme', company: 'Acme', email: 'ana@acme.com' }));
    await repo.createCustomer(makeCustomerData({ name: 'Bruno Beta', company: 'Beta', email: 'bruno@beta.com' }));

    expect((await repo.listCustomers({ query: 'ACME', page: 1, perPage: 10 })).total).toBe(1);
    expect((await repo.listCustomers({ query: 'bruno@', page: 1, perPage: 10 })).total).toBe(1);
    expect((await repo.listCustomers({ query: 'inexistente', page: 1, perPage: 10 })).total).toBe(0);
  });

  it('filtra por status e combina com busca', async () => {
    const repo = createMemoryRepository();
    await repo.createCustomer(makeCustomerData({ name: 'Ativo A', status: 'ACTIVE' }));
    await repo.createCustomer(makeCustomerData({ name: 'Trial T', status: 'TRIAL' }));

    expect((await repo.listCustomers({ status: 'TRIAL', page: 1, perPage: 10 })).total).toBe(1);
    expect((await repo.listCustomers({ status: 'ACTIVE', query: 'ativo', page: 1, perPage: 10 })).total).toBe(1);
    expect((await repo.listCustomers({ status: 'ACTIVE', query: 'trial', page: 1, perPage: 10 })).total).toBe(0);
  });

  it('ordena do mais recente ao mais antigo', async () => {
    const repo = createMemoryRepository();
    await repo.createCustomer(makeCustomerData({ name: 'Antigo', createdAt: new Date('2026-01-01') }));
    await repo.createCustomer(makeCustomerData({ name: 'Recente', createdAt: new Date('2026-10-01') }));
    const result = await repo.listCustomers({ page: 1, perPage: 10 });
    expect(result.items[0].name).toBe('Recente');
  });

  it('atualiza apenas clientes existentes', async () => {
    const repo = createMemoryRepository();
    expect(await repo.updateCustomer('fantasma', { name: 'X' })).toBeNull();
  });

  it('aceita seed inicial na criacao', async () => {
    const repo = createMemoryRepository({ customers: [makeCustomer({ email: 'seed@exemplo.com' })] });
    expect(await repo.findCustomerByEmail('seed@exemplo.com')).not.toBeNull();
  });
});
