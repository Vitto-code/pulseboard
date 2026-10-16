import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { updateCustomerAction } from '@/app/actions/customers';
import { CustomerForm } from '@/components/customers/CustomerForm';
import { getRepository } from '@/server/db';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Editar cliente',
};

interface EditarClientePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: EditarClientePageProps) {
  const { id } = await params;
  const customer = await getRepository().findCustomerById(id);
  if (!customer) {
    notFound();
  }

  const boundAction = updateCustomerAction.bind(null, customer.id);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Editar cliente</h1>
      <CustomerForm action={boundAction} defaultValues={customer} submitLabel="Salvar alteracoes" />
    </div>
  );
}
