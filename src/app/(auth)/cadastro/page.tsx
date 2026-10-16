import type { Metadata } from 'next';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Criar conta',
};

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-6 text-lg font-semibold">Criar sua conta</h1>
      <RegisterForm />
    </>
  );
}
