'use client';

import { Suspense,useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import Search, { SearchSkeleton } from './Search';
import CartSidebar from './CartSidebar';

const SITE_NAME = '';

export default function NavBar() {
  const [cartOpen, setCartOpen] = useState(false);
  const menu = [
    { title: 'baterias', path: '/baterias' },
    { title: 'cables', path: '/cables' },
    { title: 'vidrios', path: '/vidrios' },
    {
      title: 'Fundas',
      path: '/fundas',
      submenu: [
        { title: 'Silicona', path: '/fundas/silicona' },
        { title: 'Lisas', path: '/fundas/lisas' },
        { title: 'Diseño', path: '/fundas/diseno' }
      ]
    },
    {
      title: 'Accesorios',
      path: '/accesorios',
      submenu: [
        { title: 'Popsockets', path: '/accesorios/popsockets' },
        { title: 'Aros de luz', path: '/accesorios/aros-de-luz' },
        { title: 'Flip wallet', path: '/accesorios/flip-wallet' },
        { title: 'Earbuds', path: '/accesorios/earbuds' }
      ]
    }
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
        <Link href="/" className="flex items-center justify-center mr-6">
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
        <ul className="hidden gap-6 text-sm md:flex md:items-center relative">
          {menu.map((item) => (
            <li key={item.title} className="relative group">
              <Link
                href={item.path}
                className="text-neutral-500 underline-offset-4 hover:text-black hover:underline dark:text-neutral-400 dark:hover:text-neutral-300"
              >
                {item.title}
              </Link>

              {item.submenu && (
                <div className="absolute left-1/2 top-full hidden w-max -translate-x-1/2 group-hover:flex flex-col rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-md dark:border-neutral-700 dark:bg-neutral-800 z-50">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.path}
                      className="px-4 py-2 text-neutral-700 whitespace-nowrap hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
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
      {/* Cart */}
      <div className="flex items-center justify-end md:w-1/3">
        <button onClick={() => setCartOpen(true)} className="relative">
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

      {/* Cart Sidebar */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </nav>
  );
}
