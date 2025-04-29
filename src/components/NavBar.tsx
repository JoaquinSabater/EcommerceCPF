'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import Search, { SearchSkeleton } from './Search';

const SITE_NAME = '';

export default function NavBar() {
  const menu = [
    { title: 'Baterias', path: '/baterias' },
    { title: 'Cables', path: '/cables' },
    { title: 'Vidrios', path: '/vidrios' },
    { title: 'Fundas', path: '/fundas' },
    { title: 'Accesorios', path: '/accesorios' },
  ];

  return (
    <nav className="relative flex items-center justify-between p-4 lg:px-6 bg-white dark:bg-neutral-900">
      {/* Mobile Menu */}
      <div className="block flex-none md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>

      {/* Logo + Links */}
      <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-0 md:flex md:w-1/3 md:items-center">
        <Link
          href="/"
          className="flex items-center justify-center"
        >
          <Image
            src="/logo_orange_on_transparent.png"
            width={40}
            height={40}
            alt="logo"
          />
          <div className="ml-2 hidden text-sm font-medium uppercase lg:block text-black dark:text-white">
            {SITE_NAME}
          </div>
        </Link>

        {/* Desktop links */}
        <ul className="hidden md:flex md:items-center gap-6 text-sm ml-4">
          {menu.map((item) => (
            <li key={item.title}>
              <Link
                href={item.path}
                className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Search */}
      <div className="hidden md:flex md:justify-center md:w-1/3">
        <Suspense fallback={<SearchSkeleton />}>
          <Search />
        </Suspense>
      </div>

      {/* Cart */}
      <div className="flex items-center justify-end md:w-1/3">
        <button className="relative">
          <Image
            src="/cart.svg"
            width={30}
            height={30}
            alt="shopping cart icon"
            className="dark:invert"
          />
          <div className="rounded-full flex justify-center items-center bg-orange-600 text-xs text-white absolute w-5 h-5 -top-2 -right-2">
            0
          </div>
        </button>
      </div>
    </nav>
  );
}
