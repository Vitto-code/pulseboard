import { z } from 'zod';

/** Esquemas de validacao compartilhados entre Server Actions e testes. */

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(80),
  email: z.email('E-mail invalido').toLowerCase(),
  password: z.string().min(8, 'Senha deve ter ao menos 8 caracteres').max(72),
});

export const loginSchema = z.object({
  email: z.email('E-mail invalido').toLowerCase(),
  password: z.string().min(1, 'Informe a senha'),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, 'Nome deve ter ao menos 2 caracteres').max(120),
  email: z.email('E-mail invalido').toLowerCase(),
  company: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => (value ? value : null)),
  plan: z.enum(['STARTER', 'PRO', 'ENTERPRISE'], 'Plano invalido'),
  status: z.enum(['TRIAL', 'ACTIVE', 'CHURNED'], 'Status invalido'),
  mrrCents: z
    .number('MRR deve ser um numero')
    .int('MRR deve ser inteiro (em centavos)')
    .min(0, 'MRR nao pode ser negativo')
    .max(1_000_000_00, 'MRR acima do limite'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CustomerInput = z.infer<typeof customerSchema>;

/** Converte erros do zod em um mapa campo -> primeira mensagem. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form');
    result[field] ??= issue.message;
  }
  return result;
}
