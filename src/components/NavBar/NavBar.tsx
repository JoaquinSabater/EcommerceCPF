'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import { useCart } from '@/components/CartContext';
import { usePathname, useRouter } from 'next/navigation';
import CartSidebar from './CartSidebar';
import { ChevronRightIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import Search from '../Search/Search';
import { SearchSkeleton } from '../Search/Search';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/types';
// ✅ AGREGAR ESTE IMPORT
import { useProspectoMode } from '@/hooks/useProspectoMode';

export default function NavBar() {
  const { user, logout }: { user: User | null, logout: () => void } = useAuth();
  const { isProspectoMode, prospectoData, clearProspectoSession } = useProspectoMode();
  
  const [cartOpen, setCartOpen] = useState(false);
  const { cart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  const menu = [
    { title: 'baterias', path: '/public/baterias' },
    { title: 'cables', path: '/public/cables' },
    { title: 'vidrios', path: '/public/vidrios' },
    { title: 'modulos', path: '/public/pantallas' },
    {
      title: 'Fundas',
      path: '/public/fundas',
      submenu: [
        { title: 'Silicona', path: '/public/fundas/silicona' },
        { title: 'Lisas', path: '/public/fundas/lisas' },
        { title: 'Flip wallet', path: '/public/fundas/flipWallet' },
        { title: 'Diseño', path: '/public/fundas/diseno' }
      ]
    },
    {
      title: 'Accesorios',
      path: '/public/accesorios',
      submenu: [
        { title: 'Popsockets', path: '/public/accesorios/popsockets' },
        { title: 'Aros de luz', path: '/public/accesorios/arosDeLuz' },
        { title: 'Earbuds', path: '/public/accesorios/earbuds' }
      ]
    }
  ];

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  // Si estamos en /carrito, solo mostrar logo y botón "Seguir comprando" centrado y estilizado
  if (pathname === '/public/carrito') {
    return (
      <nav className="flex items-center justify-between p-4 lg:px-6 bg-white relative z-[9999] shadow-sm">
        {/* Logo a la izquierda */}
        <div>
          <Link href="/" className="flex items-center">
            <Image
              src="/logo_orange_on_transparent.png"
              width={40}
              height={40}
              alt="logo"
            />
          </Link>
        </div>
        {/* Botón a la derecha, estilo texto grande con flecha */}
        <div>
          <button
            className="flex items-center gap-2 text-l font-normal text-gray-700 hover:underline transition"
            onClick={() => router.push('/')}
          >
            Seguir comprando
            <ChevronRightIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </nav>
    );
  }

  return (
    <>
      {/* ✅ BANNER DE MODO PROSPECTO CON COLOR NARANJA */}
        {isProspectoMode && (
          <div className="bg-orange-600 text-white px-4 py-2 text-sm">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <div className="flex items-center gap-2">
                <span>🛍️</span>
                <span>
                  <strong>Modo de prueba activado</strong> - Hola {prospectoData?.nombre} | 
                  Acceso válido por 4 días - Puedes navegar y simular pedidos
                </span>
              </div>
            </div>
          </div>
        )}

      <nav className="sticky top-0 flex items-center justify-between p-4 lg:px-6 bg-white z-[9999] shadow-sm border-b border-gray-100">
        {/* Mobile Menu */}
        <div className="block md:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} />
          </Suspense>
        </div>

        {/* Logo + Desktop Nav - Columna izquierda */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 flex items-center md:gap-10 md:flex-1">
          <Link href="/public" className="flex items-center">
            <Image
              src="/logo_orange_on_transparent.png"
              width={40}
              height={40}
              alt="logo"
            />
          </Link>
          {/* Desktop Nav */}
          <ul className="hidden md:flex items-center gap-6 text-sm">
            {menu.map((item) => (
              <li key={item.title} className="relative group">
                <Link
                  href={item.path}
                  className="text-black underline-offset-4 hover:text-orange-600 hover:underline"
                >
                  {item.title}
                </Link>
                {item.submenu && (
                  <div className="absolute left-1/2 top-full hidden w-max -translate-x-1/2 group-hover:flex flex-col rounded-md border border-neutral-200 bg-white py-1 text-sm shadow-lg z-[10000]">
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

        {/* Search - Columna central */}
        <div className="hidden md:flex md:justify-center md:flex-1">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        {/* User + Cart - Columna derecha */}
        <div className="flex justify-end items-center gap-4 md:flex-1">
          {/* ✅ MODIFICAR BOTÓN USUARIO PARA PROSPECTOS */}
          {!isProspectoMode && (
            <button
              onClick={() => router.push('/admin')}
              className="hidden md:block p-1"
              aria-label="Panel de administración"
            >
              <UserCircleIcon className="w-8 h-8 text-gray-700 hover:text-orange-600 transition" />
            </button>
          )}
          
          {/* Botón carrito */}
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
    </>
  );
}