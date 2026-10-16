import Link from 'next/link';

interface PaginationProps {
  page: number;
  pageCount: number;
  /** Query string atual sem o parametro page (ex.: "q=acme&status=ACTIVE"). */
  baseQuery: string;
}

export function Pagination({ page, pageCount, baseQuery }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  const hrefFor = (target: number) => {
    const params = new URLSearchParams(baseQuery);
    params.set('page', String(target));
    return `/clientes?${params.toString()}`;
  };

  const linkClass = (disabled: boolean) =>
    `rounded-lg border px-3 py-1.5 text-sm ${
      disabled
        ? 'pointer-events-none border-zinc-200 text-zinc-400 dark:border-zinc-800'
        : 'border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
    }`;

  return (
    <nav className="mt-4 flex items-center justify-between" aria-label="Paginacao">
      <Link href={hrefFor(page - 1)} className={linkClass(page <= 1)} aria-disabled={page <= 1}>
        Anterior
      </Link>
      <span className="text-sm text-zinc-500">
        Pagina {page} de {pageCount}
      </span>
      <Link href={hrefFor(page + 1)} className={linkClass(page >= pageCount)} aria-disabled={page >= pageCount}>
        Proxima
      </Link>
    </nav>
  );
}
