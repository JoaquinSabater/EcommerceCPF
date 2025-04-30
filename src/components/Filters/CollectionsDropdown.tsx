// app/components/CollectionsDropdown.tsx

'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

const marcas = [
  'All',
  'iPhone',
  'Samsung',
  'Motorola',
  'Huawei',
  'Xiaomi'
];

export default function CollectionsDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden px-4 mt-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2 bg-neutral-900 text-white rounded border"
      >
        <span>Marcas</span>
        {open ? (
          <ChevronUpIcon className="h-5 w-5" />
        ) : (
          <ChevronDownIcon className="h-5 w-5" />
        )}
      </button>

      {open && (
        <ul className="mt-2 border rounded bg-neutral-900">
          {marcas.map((marcas) => (
            <li key={marcas}>
              <Link
                href={`/marcas/${marcas.toLowerCase()}`}
                className="block px-4 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800"
              >
                {marcas}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
