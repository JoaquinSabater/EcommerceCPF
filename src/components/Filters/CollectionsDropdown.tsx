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
        className="w-full flex items-center justify-between px-4 py-2 text-black rounded hover:bg-neutral-200 border"
      >
        <span className="font-semibold">Marcas</span>
        {open ? (
          <ChevronUpIcon className="h-5 w-5 text-black" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-black" />
        )}
      </button>

      {open && (
        <ul className="mt-2 rounded hover:bg-neutral-800 bg-white shadow-lg border border-black">
          {marcas.map((marcas) => (
            <li key={marcas}>
              <Link
                href={`/marcas/${marcas.toLowerCase()}`}
                className="block px-4 py-2 text-sm text-black hover:text-orange-500 hover:bg-neutral-800 rounded border-black"
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