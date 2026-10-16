import { randomUUID } from 'node:crypto';
import type {
  CreateCustomerData,
  CustomerFilter,
  CustomerRecord,
  Page,
  Repository,
  UpdateCustomerData,
  UserRecord,
} from './types';

/**
 * Implementacao em memoria do Repository. Usada nos testes unitarios e no
 * modo demo (`DB_DRIVER=memory`), que roda o app inteiro sem banco de dados.
 * Aceita dados iniciais (seed) inseridos de forma sincrona na criacao.
 */
export interface MemorySeed {
  users?: UserRecord[];
  customers?: CustomerRecord[];
}

export function createMemoryRepository(seed: MemorySeed = {}): Repository {
  const users = new Map<string, UserRecord>((seed.users ?? []).map((user) => [user.id, user]));
  const sessions = new Map<string, { token: string; userId: string; expiresAt: Date; createdAt: Date }>();
  const customers = new Map<string, CustomerRecord>(
    (seed.customers ?? []).map((customer) => [customer.id, customer]),
  );

  return {
    async findUserByEmail(email) {
      return [...users.values()].find((user) => user.email === email) ?? null;
    },

    async findUserById(id) {
      return users.get(id) ?? null;
    },

    async createUser(data) {
      const user: UserRecord = { id: randomUUID(), createdAt: new Date(), ...data };
      users.set(user.id, user);
      return user;
    },

    async createSession(data) {
      const session = { createdAt: new Date(), ...data };
      sessions.set(session.token, session);
      return session;
    },

    async findSessionWithUser(token) {
      const session = sessions.get(token);
      if (!session) {
        return null;
      }
      const user = users.get(session.userId);
      return user ? { ...session, user } : null;
    },

    async deleteSession(token) {
      sessions.delete(token);
    },

    async listCustomers(filter: CustomerFilter): Promise<Page<CustomerRecord>> {
      const query = filter.query?.toLowerCase();
      const items = [...customers.values()]
        .filter((customer) => {
          if (filter.status && customer.status !== filter.status) {
            return false;
          }
          if (query) {
            const haystack = `${customer.name} ${customer.email} ${customer.company ?? ''}`.toLowerCase();
            return haystack.includes(query);
          }
          return true;
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const start = (filter.page - 1) * filter.perPage;
      return {
        items: items.slice(start, start + filter.perPage),
        total: items.length,
        page: filter.page,
        pageCount: Math.max(1, Math.ceil(items.length / filter.perPage)),
      };
    },

    async listAllCustomers() {
      return [...customers.values()].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    },

    async findCustomerById(id) {
      return customers.get(id) ?? null;
    },

    async findCustomerByEmail(email) {
      return [...customers.values()].find((customer) => customer.email === email) ?? null;
    },

    async createCustomer(data: CreateCustomerData) {
      const now = new Date();
      const customer: CustomerRecord = { id: randomUUID(), createdAt: now, updatedAt: now, company: null, ...data };
      customers.set(customer.id, customer);
      return customer;
    },

    async updateCustomer(id: string, data: UpdateCustomerData) {
      const existing = customers.get(id);
      if (!existing) {
        return null;
      }
      const updated: CustomerRecord = { ...existing, ...data, updatedAt: new Date() };
      customers.set(id, updated);
      return updated;
    },

    async deleteCustomer(id) {
      return customers.delete(id);
    },
  };
}
