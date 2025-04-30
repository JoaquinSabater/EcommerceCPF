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
        { title: 'Aros de luz', path: '/accesorios/arosDeLuz' },
        { title: 'Flip wallet', path: '/accesorios/flipWallet' },
        { title: 'Earbuds', path: '/accesorios/earbuds' }
      ]
    }
  ];

  return (
<nav className="flex items-center justify-between p-4 lg:px-6 bg-white dark:bg-neutral-900">
  {/* Mobile Menu */}
  <div className="block md:hidden">
    <Suspense fallback={null}>
      <MobileMenu menu={menu} />
    </Suspense>
  </div>

  {/* Columna izquierda: Logo + Menú */}
  <div className="flex flex-1 items-center gap-6">
    <Link href="/" className="flex items-center">
      <Image
        src="/logo_orange_on_transparent.png"
        width={40}
        height={40}
        alt="logo"
      />
    </Link>

    {/* Desktop Nav */}
    <ul className="hidden md:flex gap-6 text-sm">
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

  {/* Columna centro: Search */}
  <div className="hidden md:flex flex-1 justify-center">
    <Suspense fallback={<SearchSkeleton />}>
      <Search />
    </Suspense>
  </div>

  {/* Columna derecha: Cart */}
  <div className="flex flex-1 justify-end">
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

  <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
</nav>

  );
}
