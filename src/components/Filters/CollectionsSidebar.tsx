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
      <h3 className="text-sm font-semibold uppercase mb-4 text-orange-600">
        Marcas
      </h3>
      <ul className="space-y-2">
        {marcas.map((marcas) => (
          <li key={marcas}>
            <Link
              href={`/marcas/${marcas.toLowerCase()}`}
              className="text-sm text-black hover:underline hover:text-orange-600 block"
            >
              {marcas}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}