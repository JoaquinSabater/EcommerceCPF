'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import Search, { SearchSkeleton } from './Search';

const SITE_NAME = 'Mi Tienda';

export default function NavBar() {
  const menu = [
    { title: 'Inicio', path: '/' },
    { title: 'Productos', path: '/products' },
    { title: 'Contacto', path: '/contact' },
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
      <div className="flex w-full items-center">
        <div className="flex w-full md:w-1/3">
          <Link
            href="/"
            className="mr-2 flex w-full items-center justify-center md:w-auto lg:mr-6"
          >
            <Image
              src="/logo_orange_on_transparent.png"
              width={40}
              height={40}
              alt="logo"
            />
            <div className="ml-2 flex-none text-sm font-medium uppercase md:hidden lg:block text-black dark:text-white">
              {SITE_NAME}
            </div>
          </Link>

          <ul className="hidden gap-6 text-sm md:flex md:items-center">
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
        <div className="hidden justify-center md:flex md:w-1/3">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        {/* Cart */}
        <div className="flex justify-end md:w-1/3">
          <button className="relative">
            <Image
              src="/cart.svg"
              width={40}
              height={40}
              alt="shopping cart icon"
              className="dark:invert"
            />
            <div className="rounded-full flex justify-center items-center bg-orange-600 text-xs text-white absolute w-6 h-5 bottom-6 -right-1">
              0
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}
