import { randomBytes } from 'node:crypto';
import { DomainError } from '@/lib/errors';
import type { LoginInput, RegisterInput } from '@/lib/validation';
import type { Repository, SessionRecord, UserRecord } from '../db/types';
import { hashPassword, verifyPassword } from './password';

export const SESSION_TTL_DAYS = 7;
export const SESSION_COOKIE = 'pulseboard_session';

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

export function sessionExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
}

export function isSessionExpired(session: SessionRecord, now: Date = new Date()): boolean {
  return session.expiresAt.getTime() <= now.getTime();
}

/**
 * Registra um novo usuario. Lanca DomainError EMAIL_EM_USO se o e-mail
 * ja estiver cadastrado.
 */
export async function registerUser(repo: Repository, input: RegisterInput): Promise<UserRecord> {
  const existing = await repo.findUserByEmail(input.email);
  if (existing) {
    throw new DomainError('EMAIL_EM_USO', 'Este e-mail ja esta cadastrado.');
  }
  const passwordHash = await hashPassword(input.password);
  return repo.createUser({ email: input.email, name: input.name, passwordHash });
}

/**
 * Autentica por e-mail e senha. Mensagem generica de proposito para nao
 * revelar se o e-mail existe.
 */
export async function loginUser(
  repo: Repository,
  input: LoginInput,
): Promise<{ user: UserRecord; session: SessionRecord }> {
  const invalid = new DomainError('CREDENCIAIS_INVALIDAS', 'E-mail ou senha incorretos.');

  const user = await repo.findUserByEmail(input.email);
  if (!user) {
    throw invalid;
  }
  const passwordOk = await verifyPassword(input.password, user.passwordHash);
  if (!passwordOk) {
    throw invalid;
  }

  const session = await repo.createSession({
    token: generateSessionToken(),
    userId: user.id,
    expiresAt: sessionExpiry(),
  });
  return { user, session };
}

/** Retorna o usuario da sessao ou null se o token for invalido/expirado. */
export async function getSessionUser(repo: Repository, token: string): Promise<UserRecord | null> {
  const sessionWithUser = await repo.findSessionWithUser(token);
  if (!sessionWithUser || isSessionExpired(sessionWithUser)) {
    return null;
  }
  return sessionWithUser.user;
}

export async function logoutUser(repo: Repository, token: string): Promise<void> {
  await repo.deleteSession(token);
}
