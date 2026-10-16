'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isDomainError } from '@/lib/errors';
import { customerSchema, fieldErrors } from '@/lib/validation';
import { createCustomer, deleteCustomer, updateCustomer } from '@/server/customers/service';
import { getRepository } from '@/server/db';

export interface CustomerFormState {
  formError?: string;
  fieldErrors?: Record<string, string>;
}

/** Converte o valor de MRR do formulario (reais) para centavos. */
function parseMrrCents(raw: FormDataEntryValue | null): number {
  const normalized = String(raw ?? '0').replace(/\./g, '').replace(',', '.');
  const reais = Number(normalized);
  return Number.isFinite(reais) ? Math.round(reais * 100) : Number.NaN;
}

function parseForm(formData: FormData) {
  return customerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    company: formData.get('company') || undefined,
    plan: formData.get('plan'),
    status: formData.get('status'),
    mrrCents: parseMrrCents(formData.get('mrr')),
  });
}

export async function createCustomerAction(
  _previous: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await createCustomer(getRepository(), parsed.data);
  } catch (error) {
    if (isDomainError(error)) {
      return { formError: error.message };
    }
    throw error;
  }
  revalidatePath('/clientes');
  revalidatePath('/');
  redirect('/clientes');
}

export async function updateCustomerAction(
  customerId: string,
  _previous: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const parsed = parseForm(formData);
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }
  try {
    await updateCustomer(getRepository(), customerId, parsed.data);
  } catch (error) {
    if (isDomainError(error)) {
      return { formError: error.message };
    }
    throw error;
  }
  revalidatePath('/clientes');
  revalidatePath('/');
  redirect('/clientes');
}

export async function deleteCustomerAction(customerId: string): Promise<{ error?: string }> {
  try {
    await deleteCustomer(getRepository(), customerId);
  } catch (error) {
    if (isDomainError(error)) {
      return { error: error.message };
    }
    throw error;
  }
  revalidatePath('/clientes');
  revalidatePath('/');
  return {};
}
