/**
 * Tipos da camada de persistencia. Desacoplam a aplicacao do Prisma:
 * os servicos dependem apenas da interface Repository, que tem uma
 * implementacao Prisma (producao) e uma em memoria (testes e modo demo).
 */

export type Plan = 'STARTER' | 'PRO' | 'ENTERPRISE';
export type CustomerStatus = 'TRIAL' | 'ACTIVE' | 'CHURNED';

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

export interface SessionRecord {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  company: string | null;
  plan: Plan;
  status: CustomerStatus;
  mrrCents: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerData {
  name: string;
  email: string;
  company?: string | null;
  plan: Plan;
  status: CustomerStatus;
  mrrCents: number;
  /** Uso exclusivo de seeds: em operacao normal o banco define a data. */
  createdAt?: Date;
}

export type UpdateCustomerData = Partial<CreateCustomerData>;

export interface CustomerFilter {
  /** Busca parcial em nome, e-mail e empresa (case-insensitive). */
  query?: string;
  status?: CustomerStatus;
  page: number;
  perPage: number;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageCount: number;
}

export interface Repository {
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;
  createUser(data: { email: string; name: string; passwordHash: string }): Promise<UserRecord>;

  createSession(data: { token: string; userId: string; expiresAt: Date }): Promise<SessionRecord>;
  findSessionWithUser(token: string): Promise<(SessionRecord & { user: UserRecord }) | null>;
  deleteSession(token: string): Promise<void>;

  listCustomers(filter: CustomerFilter): Promise<Page<CustomerRecord>>;
  listAllCustomers(): Promise<CustomerRecord[]>;
  findCustomerById(id: string): Promise<CustomerRecord | null>;
  findCustomerByEmail(email: string): Promise<CustomerRecord | null>;
  createCustomer(data: CreateCustomerData): Promise<CustomerRecord>;
  updateCustomer(id: string, data: UpdateCustomerData): Promise<CustomerRecord | null>;
  deleteCustomer(id: string): Promise<boolean>;
}
