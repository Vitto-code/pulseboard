import bcrypt from 'bcryptjs';

const DEFAULT_ROUNDS = 10;

/** Gera o hash bcrypt da senha. Rounds parametrizavel para testes rapidos. */
export async function hashPassword(password: string, rounds = DEFAULT_ROUNDS): Promise<string> {
  return bcrypt.hash(password, rounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
