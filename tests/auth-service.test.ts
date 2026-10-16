import { describe, expect, it } from 'vitest';
import {
  getSessionUser,
  isSessionExpired,
  loginUser,
  logoutUser,
  registerUser,
  SESSION_TTL_DAYS,
} from '../src/server/auth/service';
import { createMemoryRepository } from '../src/server/db/memory-repository';

const repo = () => createMemoryRepository();

describe('registerUser', () => {
  it('cria usuario com senha hasheada', async () => {
    const user = await registerUser(repo(), { name: 'Ana', email: 'ana@exemplo.com', password: 'senha12345' });
    expect(user.passwordHash).not.toContain('senha12345');
  });

  it('rejeita e-mail duplicado com erro de dominio', async () => {
    const r = repo();
    await registerUser(r, { name: 'Ana', email: 'ana@exemplo.com', password: 'senha12345' });
    await expect(
      registerUser(r, { name: 'Outra', email: 'ana@exemplo.com', password: 'senha12345' }),
    ).rejects.toMatchObject({ code: 'EMAIL_EM_USO' });
  });
});

describe('loginUser', () => {
  it('retorna sessao valida por 7 dias', async () => {
    const r = repo();
    await registerUser(r, { name: 'Ana', email: 'ana@exemplo.com', password: 'senha12345' });
    const { session, user } = await loginUser(r, { email: 'ana@exemplo.com', password: 'senha12345' });
    expect(user.email).toBe('ana@exemplo.com');
    expect(session.token).toHaveLength(64);
    expect(isSessionExpired(session)).toBe(false);

    const ttlDays = (session.expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000);
    expect(ttlDays).toBeGreaterThan(SESSION_TTL_DAYS - 1);
  });

  it('rejeita senha errada e e-mail inexistente com a mesma mensagem', async () => {
    const r = repo();
    await registerUser(r, { name: 'Ana', email: 'ana@exemplo.com', password: 'senha12345' });
    await expect(loginUser(r, { email: 'ana@exemplo.com', password: 'errada123' })).rejects.toMatchObject({
      code: 'CREDENCIAIS_INVALIDAS',
    });
    await expect(loginUser(r, { email: 'nao@existe.com', password: 'qualquer' })).rejects.toMatchObject({
      code: 'CREDENCIAIS_INVALIDAS',
    });
  });
});

describe('getSessionUser', () => {
  it('retorna o usuario para token valido e null para token invalido ou expirado', async () => {
    const r = repo();
    await registerUser(r, { name: 'Ana', email: 'ana@exemplo.com', password: 'senha12345' });
    const { session } = await loginUser(r, { email: 'ana@exemplo.com', password: 'senha12345' });

    expect((await getSessionUser(r, session.token))?.email).toBe('ana@exemplo.com');
    expect(await getSessionUser(r, 'token-inexistente')).toBeNull();

    const expired = await r.createSession({
      token: 'expirado',
      userId: 'demo-user',
      expiresAt: new Date(Date.now() - 1000),
    });
    expect(isSessionExpired(expired)).toBe(true);
  });
});

describe('logoutUser', () => {
  it('invalida a sessao', async () => {
    const r = repo();
    await registerUser(r, { name: 'Ana', email: 'ana@exemplo.com', password: 'senha12345' });
    const { session } = await loginUser(r, { email: 'ana@exemplo.com', password: 'senha12345' });
    await logoutUser(r, session.token);
    expect(await getSessionUser(r, session.token)).toBeNull();
  });
});
