import type { CreateCustomerData, CustomerRecord } from '../../src/server/db/types';

let counter = 0;

export function makeCustomer(overrides: Partial<CustomerRecord> = {}): CustomerRecord {
  counter += 1;
  const now = new Date('2026-10-01T12:00:00Z');
  return {
    id: `customer-${counter}`,
    name: `Cliente ${counter}`,
    email: `cliente${counter}@exemplo.com`,
    company: null,
    plan: 'PRO',
    status: 'ACTIVE',
    mrrCents: 19_900,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

export function makeCustomerData(overrides: Partial<CreateCustomerData> = {}): CreateCustomerData {
  counter += 1;
  return {
    name: `Cliente ${counter}`,
    email: `cliente${counter}@exemplo.com`,
    company: null,
    plan: 'PRO',
    status: 'ACTIVE',
    mrrCents: 19_900,
    ...overrides,
  };
}
