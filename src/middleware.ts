import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE } from '@/server/auth/constants';

const PUBLIC_PATHS = ['/entrar', '/cadastro'];

/**
 * Protecao de rotas na borda: verifica apenas a presenca do cookie de
 * sessao (o middleware nao acessa o banco). A validacao real da sessao
 * acontece no layout protegido, que redireciona se ela expirou.
 *
 * O middleware nao redireciona visitantes com cookie para fora das rotas
 * publicas: se a sessao estiver expirada ou invalida no banco, isso
 * criaria um loop de redirecionamento. Quem decide e a pagina publica,
 * que valida a sessao de verdade antes de mandar o usuario para o painel.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE);
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  if (!hasSessionCookie && !isPublicPath) {
    const loginUrl = new URL('/entrar', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('next', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
