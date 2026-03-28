'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import MobileMenu from './MobileMenu';
import { useCart } from '@/components/CartContext';
import { usePathname, useRouter } from 'next/navigation';
import CartSidebar from './CartSidebar';
import { ChevronRightIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import Search from '../Search/Search';
import { SearchSkeleton } from '../Search/Search';
import { useAuth } from '@/hooks/useAuth';
import { User } from '@/types/types';
import { useProspectoMode } from '@/hooks/useProspectoMode';

export default function NavBar() {
  const { user, logout, tieneContenidoEspecial }: { 
    user: User | null, 
    logout: () => void,
    tieneContenidoEspecial: () => boolean 
  } = useAuth();
  const { isProspectoMode, isChatbotMode, prospectoData, clearProspectoSession } = useProspectoMode(); // ✅ AGREGADO isChatbotMode
  
  const [cartOpen, setCartOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { cart } = useCart();
  const pathname = usePathname();
  const router = useRouter();

  // ✅ MENÚ DINÁMICO: Incluir "Otros" solo si tiene contenido especial
  const menu = [
    { title: 'Cables', path: '/public/cables' },
    { title: 'Cargadores', path: '/public/cargadores' },
    { title: 'Vidrios', path: '/public/vidrios' },
    { title: 'Sub dolar Club', path: '/public/sub-dolar-club' },
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
        { title: 'Auriculares', path: '/public/accesorios/earbuds' },
        { title: 'Correas', path: '/public/accesorios/correas' },
        { title: 'Soportes', path: '/public/accesorios/soportes' }
      ]
    },
    // ✅ CONDICIONAL: Solo mostrar "Otros" si tiene acceso a contenido especial
    ...(tieneContenidoEspecial() ? [{ title: 'Otros', path: '/public/otros' }] : [])
  ];

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  const tutorialVideos = [
    {
      title: 'Tutorial de Filtros para la tienda',
      url: 'https://youtube.com/shorts/IccLr1w-kJ8?feature=share'
    },
    {
      title: 'Recorrido por la tienda',
      url: 'https://youtube.com/shorts/34pk-uq9Bzg?feature=share'
    }
  ];

  // FUNCIÓN PARA FORMATEAR EL CONTADOR
  const formatCartCount = (count: number) => {
    if (count > 99) {
      return '+99';
    }
    return count.toString();
  };

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
      {/* ✅ MODIFICADO: Banner para prospecto (no para chatbot) */}
      {isProspectoMode && !isChatbotMode && (
        <div className="text-white px-4 py-2 text-sm" style={{ backgroundColor: '#ea580c' }}>
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

      {/* ✅ NUEVO: Banner para chatbot */}
      {isChatbotMode && (
        <div className="bg-blue-600 text-white px-4 py-2 text-sm">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <span>💬</span>
              <span>
                <strong>Modo consulta activado</strong> - Navegación libre para consultas | 
                No se pueden realizar pedidos
              </span>
            </div>
          </div>
        </div>
      )}

      <nav className="sticky top-0 flex items-center justify-between p-4 lg:px-6 bg-white z-[9999] shadow-sm border-b border-gray-100">
        {/* ✅ Logo fijo en desktop grande para evitar que desaparezca por overflow del menu */}
        <div className="hidden 2xl:flex 2xl:flex-shrink-0 2xl:mr-6">
          <Link href="/public" className="flex items-center">
            <Image
              src="/logo_orange_on_transparent.png"
              width={40}
              height={40}
              alt="logo"
            />
          </Link>
        </div>

        {/* ✅ Mobile Menu - Activo hasta 1536px (2xl) */}
        <div className="block 2xl:hidden">
          <Suspense fallback={null}>
            <MobileMenu menu={menu} tutorialVideos={tutorialVideos} />
          </Suspense>
        </div>

        {/* ✅ Logo + Desktop Nav - Solo visible desde 1536px */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 2xl:static 2xl:translate-x-0 2xl:translate-y-0 flex items-center 2xl:gap-10 2xl:flex-1">
          <Link href="/public" className="flex items-center 2xl:hidden">
            <Image
              src="/logo_orange_on_transparent.png"
              width={40}
              height={40}
              alt="logo"
            />
          </Link>
          {/* Desktop Nav - Solo visible desde 1536px */}
          <ul className="hidden 2xl:flex items-center gap-6 text-sm">
            {menu.map((item) => (
              <li key={item.title} className="relative group">
                <Link
                  href={item.path}
                  className="text-black underline-offset-4 hover:text-orange-600 hover:underline whitespace-nowrap"
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

        {/* ✅ Search - Solo visible desde 1536px */}
        <div className="hidden 2xl:flex 2xl:justify-center 2xl:flex-1 2xl:max-w-md 2xl:mx-4">
          <Suspense fallback={<SearchSkeleton />}>
            <Search />
          </Suspense>
        </div>

        {/* ✅ User + Cart - Siempre visible */}
        <div className="flex justify-end items-center gap-4 2xl:flex-1">
          <div
            className="relative hidden 2xl:block"
            onMouseEnter={() => setIsHelpOpen(true)}
            onMouseLeave={() => setIsHelpOpen(false)}
          >
            <button
              type="button"
              className="p-1"
              aria-label="Ayuda y tutoriales"
              aria-expanded={isHelpOpen}
              onClick={() => setIsHelpOpen((prev) => !prev)}
            >
              <QuestionMarkCircleIcon className="w-7 h-7 text-gray-700 hover:text-orange-600 transition" />
            </button>

            {isHelpOpen && (
              <div className="absolute right-0 top-full min-w-[320px] rounded-lg border border-gray-200 bg-white p-3 shadow-xl z-[10001]">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Tutoriales
              </p>
              <div className="flex flex-col gap-2">
                {tutorialVideos.map((video) => (
                  <a
                    key={video.title}
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-700 hover:text-orange-600 hover:underline"
                  >
                    {video.title}
                  </a>
                ))}
              </div>
              </div>
            )}
          </div>

          {/* ✅ MODIFICADO: No mostrar botón admin para prospectos NI chatbots */}
          {!isProspectoMode && !isChatbotMode && (
            <button
              onClick={() => router.push('/admin')}
              className="hidden 2xl:block p-1"
              aria-label="Panel de administración"
            >
              <UserCircleIcon className="w-8 h-8 text-gray-700 hover:text-orange-600 transition" />
            </button>
          )}
          
          {!isChatbotMode && (
            <button onClick={() => setCartOpen(true)} className="relative">
              <Image
                src="/cart.svg"
                width={30}
                height={30}
                alt="shopping cart icon"
              />
              <div className="rounded-full flex justify-center items-center text-xs text-white absolute w-5 h-5 -top-2 -right-2" style={{ backgroundColor: '#ea580c' }}>
                {formatCartCount(totalItems)}
              </div>
            </button>
          )}
        </div>
        <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      </nav>
    </>
  );
}