'use client';

import { useState } from 'react';
import Link from 'next/link';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Search from './Search';

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
        className="block md:hidden p-2 border rounded text-white"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black p-4 space-y-6 overflow-y-auto">
          {/* Close button */}
          <div className="flex justify-start">
            <button onClick={() => setIsOpen(false)} className="p-2 border rounded text-white">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Search */}
          <div className="px-2">
            <Search />
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
                    className="text-white text-xl transition-all duration-200 hover:underline hover:decoration-white hover:underline-offset-4 hover:decoration-2"
                  >
                    {item.title}
                  </Link>
                  {item.submenu && (
                    <button onClick={() => toggleSubmenu(item.title)} className="text-white ml-2">
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
                        className="text-neutral-300 text-base hover:text-white"
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}

