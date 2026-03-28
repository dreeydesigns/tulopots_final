import Link from 'next/link';

export function Breadcrumbs({ items }: { items: [string, string][] }) {
  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm tp-text-muted">
      {items.map(([label, href], i) => (
        <span key={href} className="flex items-center gap-2">
          <Link href={href} className="hover:tp-accent">
            {label}
          </Link>
          {i < items.length - 1 && <span>/</span>}
        </span>
      ))}
    </nav>
  );
}