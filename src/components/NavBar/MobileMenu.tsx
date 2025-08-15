'use client';

import { useState } from 'react';
import Link from 'next/link';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Search from '../Search/Search';

type MenuItem = {
  title: string;
  path: string;
  submenu?: MenuItem[];
};

export default function MobileMenu({ menu }: { menu: MenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  const toggleSubmenu = (title: string) => {
    setExpanded((prev) => (prev === title ? null : title));
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="block md:hidden p-2 border rounded text-black bg-white"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white p-4 space-y-6 overflow-y-auto">
          {/* Top bar: Close + User */}
          <div className="flex justify-between items-center">
            <button onClick={() => setIsOpen(false)} className="p-2 border rounded text-black bg-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
            
            {/* Solo el icono de usuario */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/admin';
                }}
                className="p-1"
                aria-label="Panel de administración"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-700 hover:text-orange-600 transition" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col space-y-4 px-2">
            {menu.map((item) => (
              <div key={item.title}>
                <div className="flex items-center justify-between">
                  <Link
                    href={item.path}
                    onClick={() => {
                      if (!item.submenu) setIsOpen(false);
                    }}
                    className="text-black text-xl transition-all duration-200 hover:underline hover:decoration-black hover:underline-offset-4 hover:decoration-2"
                  >
                    {item.title}
                  </Link>
                  {item.submenu && (
                    <button onClick={() => toggleSubmenu(item.title)} className="text-black ml-2">
                      {expanded === item.title ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Submenu */}
                {item.submenu && expanded === item.title && (
                  <div className="ml-4 mt-3 flex flex-col space-y-3">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.path}
                        onClick={() => setIsOpen(false)}
                        className="text-neutral-700 text-base hover:text-black"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Search debajo de la navegación */}
            <div className="mt-6 px-2">
              <Search />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}