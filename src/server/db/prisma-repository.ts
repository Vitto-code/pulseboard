import { prisma } from './prisma';
import type {
  CreateCustomerData,
  CustomerFilter,
  CustomerRecord,
  Page,
  Repository,
  SessionRecord,
  UpdateCustomerData,
  UserRecord,
} from './types';

/** Implementacao PostgreSQL via Prisma, usada em producao e desenvolvimento. */
export function createPrismaRepository(): Repository {
  return {
    findUserByEmail(email) {
      return prisma.user.findUnique({ where: { email } });
    },

    findUserById(id) {
      return prisma.user.findUnique({ where: { id } });
    },

    createUser(data) {
      return prisma.user.create({ data });
    },

    createSession(data) {
      return prisma.session.create({ data });
    },

    findSessionWithUser(token) {
      return prisma.session.findUnique({ where: { token }, include: { user: true } });
    },

    async deleteSession(token) {
      await prisma.session.deleteMany({ where: { token } });
    },

    async listCustomers(filter: CustomerFilter): Promise<Page<CustomerRecord>> {
      const where = {
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.query
          ? {
              OR: [
                { name: { contains: filter.query, mode: 'insensitive' as const } },
                { email: { contains: filter.query, mode: 'insensitive' as const } },
                { company: { contains: filter.query, mode: 'insensitive' as const } },
              ],
            }
          : {}),
      };
      const [total, items] = await Promise.all([
        prisma.customer.count({ where }),
        prisma.customer.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (filter.page - 1) * filter.perPage,
          take: filter.perPage,
        }),
      ]);
      return { items, total, page: filter.page, pageCount: Math.max(1, Math.ceil(total / filter.perPage)) };
    },

    listAllCustomers() {
      return prisma.customer.findMany({ orderBy: { createdAt: 'asc' } });
    },

    findCustomerById(id) {
      return prisma.customer.findUnique({ where: { id } });
    },

    findCustomerByEmail(email) {
      return prisma.customer.findUnique({ where: { email } });
    },

    createCustomer(data: CreateCustomerData) {
      return prisma.customer.create({ data });
    },

    async updateCustomer(id: string, data: UpdateCustomerData) {
      const existing = await prisma.customer.findUnique({ where: { id } });
      if (!existing) {
        return null;
      }
      return prisma.customer.update({ where: { id }, data });
    },

    async deleteCustomer(id: string) {
      const result = await prisma.customer.deleteMany({ where: { id } });
      return result.count > 0;
    },
  } satisfies Repository;
}

export type { SessionRecord, UserRecord };
