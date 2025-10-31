'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { XMarkIcon, ChevronDownIcon, ChevronUpIcon, UserCircleIcon, FunnelIcon } from '@heroicons/react/24/outline';
import Search from '../Search/Search';
import { useCart } from '@/components/CartContext';
import { useProspectoMode } from '@/hooks/useProspectoMode';

type MenuItem = {
  title: string;
  path: string;
  submenu?: MenuItem[];
};

export default function MobileMenu({ menu }: { menu: MenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { cart } = useCart();
  const { isProspectoMode } = useProspectoMode();
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ NUEVO: Estados para swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const toggleSubmenu = (title: string) => {
    setExpanded((prev) => (prev === title ? null : title));
  };

  const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);

  // FUNCIÓN PARA FORMATEAR EL CONTADOR
  const formatCartCount = (count: number) => {
    if (count > 99) {
      return '+99';
    }
    return count.toString();
  };

  // ✅ NUEVO: Funciones para manejar swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) {
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Swipe hacia la izquierda (hacia el contenido)
    const isRightSwipe = distance < -50; // Swipe hacia la derecha

    // ✅ Solo cerrar con swipe hacia la izquierda (hacia el contenido desenfocado)
    if (isLeftSwipe) {
      setIsOpen(false);
    }

    setIsDragging(false);
    setTouchStart(0);
    setTouchEnd(0);
  };

  // ✅ Click fuera para cerrar (solo en desktop)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        window.innerWidth >= 768 // Solo en desktop
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // ✅ Prevenir scroll del body cuando está abierto
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* ✅ Botón del menú */}
      <button
        onClick={() => setIsOpen(true)}
        className="block 2xl:hidden p-2 border rounded text-black bg-white"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      {/* ✅ OVERLAY + MENÚ LATERAL (como CartSidebar) */}
      {isOpen && (
        <>
          {/* ✅ Overlay con backdrop blur */}
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* ✅ Panel lateral del menú CON SWIPE */}
          <div
            ref={menuRef}
            className={`fixed top-0 left-0 z-50 h-full bg-white text-black shadow-2xl transition-transform duration-300 overflow-y-auto
              ${isOpen ? 'translate-x-0' : '-translate-x-full'}
              w-full max-w-sm md:w-96 md:max-w-md
            `}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* ✅ Header del menú */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100 sticky top-0">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                📱 Menú
              </h2>
              
              <div className="flex items-center gap-3">
                {/* SOLO MOSTRAR USUARIO SI NO ES PROSPECTO */}
                {!isProspectoMode && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      window.location.href = '/admin';
                    }}
                    className="p-1 hover:bg-white rounded-full transition-colors"
                    aria-label="Panel de administración"
                  >
                    <UserCircleIcon className="h-6 w-6 text-gray-700 hover:text-orange-600 transition" />
                  </button>
                )}
                {/* Botón cerrar */}
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white rounded-full transition-colors"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* ✅ BÚSQUEDA con ancho completo */}
            <div className="p-4 border-b border-gray-100">
              <Search />
            </div>

            {/* ✅ NUEVO: Botón de filtros rápido */}
            <div className="px-4 py-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  window.location.href = '/public/filtros';
                }}
                className="w-full flex items-center gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
                <span className="font-medium">Filtros avanzados</span>
              </button>
            </div>

            {/* ✅ Navegación */}
            <nav className="flex flex-col p-4 space-y-4">
              {menu.map((item) => (
                <div key={item.title}>
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.path}
                      onClick={() => {
                        if (!item.submenu) setIsOpen(false);
                      }}
                      className="text-black text-lg font-medium transition-all duration-200 hover:text-orange-600 hover:underline hover:decoration-orange-600 hover:underline-offset-4 hover:decoration-2"
                    >
                      {item.title}
                    </Link>
                    {item.submenu && (
                      <button 
                        onClick={() => toggleSubmenu(item.title)} 
                        className="text-gray-600 hover:text-orange-600 transition-colors p-1"
                      >
                        {expanded === item.title ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* ✅ Submenu con animación */}
                  {item.submenu && (
                    <div className={`ml-4 mt-3 space-y-3 transition-all duration-300 overflow-hidden ${
                      expanded === item.title ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}>
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.title}
                          href={subItem.path}
                          onClick={() => setIsOpen(false)}
                          className="block text-gray-600 hover:text-orange-600 transition-colors py-1 border-l-2 border-transparent hover:border-orange-600 pl-3"
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
        </>
      )}
    </>
  );
}