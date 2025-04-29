'use client';

import { useState } from 'react';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Search from './Search';

export default function MobileMenu({ menu }: { menu: { title: string; path: string }[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block md:hidden p-2 border rounded text-white"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black p-4 space-y-6">
          <div className="flex justify-start">
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 border rounded text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="px-2">
            <Search />
          </div>

          <nav className="flex flex-col space-y-4 px-2">
            {menu.map((item) => (
                <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className="text-white text-lg transition-all duration-200 hover:underline hover:decoration-white hover:underline-offset-4 hover:decoration-2"
                    >
                    {item.title}
                </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}


