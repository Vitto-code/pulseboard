'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isDomainError } from '@/lib/errors';
import { fieldErrors, loginSchema, registerSchema } from '@/lib/validation';
import { getSessionUser, loginUser, logoutUser, registerUser, SESSION_COOKIE } from '@/server/auth/service';
import { getRepository } from '@/server/db';

export interface AuthFormState {
  formError?: string;
  fieldErrors?: Record<string, string>;
}

async function openSessionCookie(token: string, expiresAt: Date) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
  });
}

export async function loginAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    const { session } = await loginUser(getRepository(), parsed.data);
    await openSessionCookie(session.token, session.expiresAt);
  } catch (error) {
    if (isDomainError(error)) {
      return { formError: error.message };
    }
    throw error;
  }
  redirect('/');
}

export async function registerAction(_previous: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  try {
    await registerUser(getRepository(), parsed.data);
    const { session } = await loginUser(getRepository(), {
      email: parsed.data.email,
      password: parsed.data.password,
    });
    await openSessionCookie(session.token, session.expiresAt);
  } catch (error) {
    if (isDomainError(error)) {
      return { formError: error.message };
    }
    throw error;
  }
  redirect('/');
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    await logoutUser(getRepository(), token);
  }
  jar.delete(SESSION_COOKIE);
  redirect('/entrar');
}

/** Usado pelo layout protegido para obter o usuario atual. */
export async function getCurrentUser() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }
  return getSessionUser(getRepository(), token);
}
