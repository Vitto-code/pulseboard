import { describe, expect, it } from 'vitest';
import { createCustomer, deleteCustomer, updateCustomer } from '../src/server/customers/service';
import { createMemoryRepository } from '../src/server/db/memory-repository';
import { makeCustomerData } from './helpers/factories';

describe('createCustomer', () => {
  it('cria cliente com dados validos', async () => {
    const repo = createMemoryRepository();
    const customer = await createCustomer(repo, makeCustomerData({ email: 'novo@exemplo.com' }));
    expect(customer.id).toBeTruthy();
    expect(await repo.findCustomerByEmail('novo@exemplo.com')).not.toBeNull();
  });

  it('rejeita e-mail duplicado', async () => {
    const repo = createMemoryRepository();
    await createCustomer(repo, makeCustomerData({ email: 'dup@exemplo.com' }));
    await expect(createCustomer(repo, makeCustomerData({ email: 'dup@exemplo.com' }))).rejects.toMatchObject({
      code: 'EMAIL_EM_USO',
    });
  });
});

describe('updateCustomer', () => {
  it('atualiza cliente existente', async () => {
    const repo = createMemoryRepository();
    const customer = await createCustomer(repo, makeCustomerData({ email: 'a@exemplo.com' }));
    const updated = await updateCustomer(repo, customer.id, makeCustomerData({ name: 'Novo Nome', email: 'a@exemplo.com' }));
    expect(updated.name).toBe('Novo Nome');
  });

  it('rejeita atualizacao de cliente inexistente', async () => {
    const repo = createMemoryRepository();
    await expect(updateCustomer(repo, 'id-fantasma', makeCustomerData())).rejects.toMatchObject({
      code: 'NAO_ENCONTRADO',
    });
  });

  it('rejeita e-mail ja usado por outro cliente', async () => {
    const repo = createMemoryRepository();
    await createCustomer(repo, makeCustomerData({ email: 'a@exemplo.com' }));
    const second = await createCustomer(repo, makeCustomerData({ email: 'b@exemplo.com' }));
    await expect(updateCustomer(repo, second.id, makeCustomerData({ email: 'a@exemplo.com' }))).rejects.toMatchObject({
      code: 'EMAIL_EM_USO',
    });
  });
});

describe('deleteCustomer', () => {
  it('exclui cliente existente e falha para inexistente', async () => {
    const repo = createMemoryRepository();
    const customer = await createCustomer(repo, makeCustomerData({ email: 'del@exemplo.com' }));
    await deleteCustomer(repo, customer.id);
    expect(await repo.findCustomerById(customer.id)).toBeNull();
    await expect(deleteCustomer(repo, customer.id)).rejects.toMatchObject({ code: 'NAO_ENCONTRADO' });
  });
});
