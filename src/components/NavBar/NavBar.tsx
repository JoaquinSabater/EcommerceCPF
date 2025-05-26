'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import Search, { SearchSkeleton } from './Search';
import CartSidebar from './CartSidebar';
import { useCart } from '@/components/CartContext'; // Agrega este import arriba


const SITE_NAME = '';

export default function NavBar() {
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();
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
        { title: 'Flip wallet', path: '/fundas/flipWallet' },
        { title: 'Diseño', path: '/fundas/diseno' }
      ]
    },
    {
      title: 'Accesorios',
      path: '/accesorios',
      submenu: [
        { title: 'Popsockets', path: '/accesorios/popsockets' },
        { title: 'Aros de luz', path: '/accesorios/arosDeLuz' },
        { title: 'Earbuds', path: '/accesorios/earbuds' }
      ]
    }
  ];

    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

return (
    <nav className="flex items-center justify-between p-4 lg:px-6 bg-white relative">
      {/* Mobile Menu */}
      <div className="block md:hidden">
        <Suspense fallback={null}>
          <MobileMenu menu={menu} />
        </Suspense>
      </div>

      {/* Logo centrado en mobile */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 flex items-center md:gap-10">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo_orange_on_transparent.png"
            width={40}
            height={40}
            alt="logo"
          />
        </Link>
        {/* Desktop Nav */}
        <ul className="hidden md:flex flex-1 items-center gap-6 text-sm">
          {menu.map((item) => (
            <li key={item.title} className="relative group">
              <Link
                href={item.path}
                className="text-black underline-offset-4 hover:text-orange-600 hover:underline"
              >
                {item.title}
              </Link>
              {item.submenu && (
                <div className="absolute left-1/2 top-full hidden w-max -translate-x-1/2 group-hover:flex flex-col rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-md z-50">
                  {item.submenu.map((subItem) => (
                    <Link
                      key={subItem.title}
                      href={subItem.path}
                      className="px-4 py-2 text-black whitespace-nowrap hover:bg-neutral-100"
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

      {/* Columna derecha: Cart */}
      <div className="flex flex-1 justify-end">
        <button onClick={() => setCartOpen(true)} className="relative">
          <Image
            src="/cart.svg"
            width={30}
            height={30}
            alt="shopping cart icon"
          />
          <div className="rounded-full flex justify-center items-center bg-orange-600 text-xs text-white absolute w-5 h-5 -top-2 -right-2">
            {totalItems}
          </div>
        </button>
      </div>
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </nav>
  );
}