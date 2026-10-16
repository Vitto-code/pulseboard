import type { Metadata } from 'next';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Entrar',
};

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-6 text-lg font-semibold">Entrar na sua conta</h1>
      <LoginForm />
    </>
  );
}
