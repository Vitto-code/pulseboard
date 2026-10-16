import type { Metadata } from 'next';
import { createCustomerAction } from '@/app/actions/customers';
import { CustomerForm } from '@/components/customers/CustomerForm';

export const metadata: Metadata = {
  title: 'Novo cliente',
};

export default function NovoClientePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Novo cliente</h1>
      <CustomerForm action={createCustomerAction} submitLabel="Cadastrar cliente" />
    </div>
  );
}
