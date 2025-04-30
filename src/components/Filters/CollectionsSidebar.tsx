// app/components/CollectionsSidebar.tsx

import Link from 'next/link';

const marcas = [
  'All',
  'iPhone',
  'Samsung',
  'Motorola',
  'Huawei',
  'Xiaomi'
];

export default function CollectionsSidebar() {
  return (
    <aside className="hidden md:block w-48 px-4 pt-4">
      <h3 className="text-sm font-semibold text-neutral-500 uppercase mb-4">
        Marcas
      </h3>
      <ul className="space-y-2">
        {marcas.map((marcas) => (
          <li key={marcas}>
            <Link
              href={`/marcas/${marcas.toLowerCase()}`}
              className="text-sm text-neutral-300 hover:underline hover:text-white block"
            >
              {marcas}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
