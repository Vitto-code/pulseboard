import { DomainError } from '@/lib/errors';
import type { CreateCustomerData, CustomerFilter, CustomerRecord, Page, Repository } from '../db/types';

/**
 * Regras de negocio do CRUD de clientes. Toda a validacao de unicidade e
 * existencia acontece aqui; as actions apenas traduzem erros para a UI.
 */

export async function createCustomer(repo: Repository, input: CreateCustomerData): Promise<CustomerRecord> {
  const existing = await repo.findCustomerByEmail(input.email);
  if (existing) {
    throw new DomainError('EMAIL_EM_USO', 'Ja existe um cliente com este e-mail.');
  }
  return repo.createCustomer({
    name: input.name,
    email: input.email,
    company: input.company,
    plan: input.plan,
    status: input.status,
    mrrCents: input.mrrCents,
  });
}

export async function updateCustomer(
  repo: Repository,
  id: string,
  input: CreateCustomerData,
): Promise<CustomerRecord> {
  const current = await repo.findCustomerById(id);
  if (!current) {
    throw new DomainError('NAO_ENCONTRADO', 'Cliente nao encontrado.');
  }
  const emailOwner = await repo.findCustomerByEmail(input.email);
  if (emailOwner && emailOwner.id !== id) {
    throw new DomainError('EMAIL_EM_USO', 'Ja existe outro cliente com este e-mail.');
  }
  const updated = await repo.updateCustomer(id, {
    name: input.name,
    email: input.email,
    company: input.company,
    plan: input.plan,
    status: input.status,
    mrrCents: input.mrrCents,
  });
  if (!updated) {
    throw new DomainError('NAO_ENCONTRADO', 'Cliente nao encontrado.');
  }
  return updated;
}

export async function deleteCustomer(repo: Repository, id: string): Promise<void> {
  const deleted = await repo.deleteCustomer(id);
  if (!deleted) {
    throw new DomainError('NAO_ENCONTRADO', 'Cliente nao encontrado.');
  }
}

export function listCustomers(
  repo: Repository,
  filter: CustomerFilter,
): Promise<Page<CustomerRecord>> {
  return repo.listCustomers(filter);
}
