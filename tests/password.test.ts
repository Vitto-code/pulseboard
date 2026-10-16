import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '../src/server/auth/password';

describe('hashPassword/verifyPassword', () => {
  it('verifica a senha correta e rejeita a errada', async () => {
    const hash = await hashPassword('segredo123', 4);
    expect(hash).not.toContain('segredo123');
    expect(await verifyPassword('segredo123', hash)).toBe(true);
    expect(await verifyPassword('outra-senha', hash)).toBe(false);
  });

  it('gera hashes diferentes para a mesma senha (sal aleatorio)', async () => {
    const [a, b] = await Promise.all([hashPassword('mesma', 4), hashPassword('mesma', 4)]);
    expect(a).not.toBe(b);
  });
});
