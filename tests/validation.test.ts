import { describe, expect, it } from 'vitest';
import { customerSchema, fieldErrors, loginSchema, registerSchema } from '../src/lib/validation';

describe('registerSchema', () => {
  it('aceita dados validos e normaliza o e-mail', () => {
    const result = registerSchema.parse({ name: 'Ana', email: 'ANA@EXEMPLO.COM', password: 'senha12345' });
    expect(result.email).toBe('ana@exemplo.com');
  });

  it('rejeita senha curta e e-mail invalido', () => {
    expect(registerSchema.safeParse({ name: 'Ana', email: 'invalido', password: '123' }).success).toBe(false);
  });

  it('rejeita nome com menos de 2 caracteres', () => {
    expect(registerSchema.safeParse({ name: 'A', email: 'a@b.com', password: 'senha12345' }).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('exige senha nao vazia', () => {
    expect(loginSchema.safeParse({ email: 'a@b.com', password: '' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.com', password: 'x' }).success).toBe(true);
  });
});

describe('customerSchema', () => {
  const valid = {
    name: 'Empresa X',
    email: 'contato@x.com',
    plan: 'PRO',
    status: 'ACTIVE',
    mrrCents: 19_900,
  };

  it('aceita dados validos sem empresa', () => {
    const result = customerSchema.parse(valid);
    expect(result.company).toBeNull();
  });

  it('preserva empresa informada', () => {
    const result = customerSchema.parse({ ...valid, company: 'Acme Ltda' });
    expect(result.company).toBe('Acme Ltda');
  });

  it('rejeita MRR que nao e numero', () => {
    expect(customerSchema.safeParse({ ...valid, mrrCents: 'abc' }).success).toBe(false);
  });

  it('rejeita MRR negativo, nao inteiro e plano invalido', () => {
    expect(customerSchema.safeParse({ ...valid, mrrCents: -1 }).success).toBe(false);
    expect(customerSchema.safeParse({ ...valid, mrrCents: 10.5 }).success).toBe(false);
    expect(customerSchema.safeParse({ ...valid, plan: 'FREE' }).success).toBe(false);
  });
});

describe('fieldErrors', () => {
  it('mapeia campo para a primeira mensagem', () => {
    const parsed = registerSchema.safeParse({ name: '', email: 'invalido', password: '123' });
    if (parsed.success) throw new Error('deveria falhar');
    const errors = fieldErrors(parsed.error);
    expect(errors.email).toBe('E-mail invalido');
    expect(errors.password).toContain('8');
  });
});
