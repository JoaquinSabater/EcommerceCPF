'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { XMarkIcon, Bars3Icon, ShoppingBagIcon, CubeIcon, ChevronLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

const menu = [
  { title: 'Pedidos', path: '/admin/orders', icon: <ShoppingBagIcon className="w-6 h-6" /> },
  { title: 'Stock', path: '/admin/products', icon: <CubeIcon className="w-6 h-6" /> },
];

export default function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Top bar: hamburguesa + logo centrado */}
      <div className="flex items-center justify-between p-4 bg-white md:hidden relative">
        {/* Botón hamburguesa */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2"
          aria-label="Abrir menú admin"
        >
          <Bars3Icon className="h-7 w-7 text-gray-700" />
        </button>
        
        {/* Solo logo centrado */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/admin" className="flex items-center">
            <Image
              src="/logo_orange_on_transparent.png"
              width={40}
              height={40}
              alt="logo"
            />
          </Link>
        </div>
        
        {/* Espacio a la derecha para balancear */}
        <div className="w-9" />
      </div>

      {/* Menú lateral al abrir hamburguesa */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header con información del usuario */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setIsOpen(false)} className="p-2">
                <XMarkIcon className="h-7 w-7" />
              </button>
            </div>
            
            {/* Información del usuario centrada */}
            {user && (
              <div className="flex flex-col items-center text-center">
                <h2 className="font-bold text-xl text-gray-900">
                  {user.nombre} {user.apellido}
                </h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">CUIL: {user.cuil}</p>
              </div>
            )}
          </div>
          
          {/* Menú */}
          <nav className="flex-1 flex flex-col gap-2 p-4">
            {menu.map((item) => (
              <Link
                key={item.title}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-50 transition text-lg"
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            ))}
          </nav>
          
          {/* Footer con botones */}
          <div className="p-4 space-y-2">
            {/* Botón Cerrar Sesión */}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 text-lg font-normal px-4 py-3 rounded-lg transition text-red-600 hover:bg-red-50 border border-red-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar sesión</span>
              </button>
            )}
            
            {/* Botón Seguir comprando */}
            <Link
              href="/public"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 text-lg font-normal px-4 py-3 rounded-lg transition text-neutral-600 hover:bg-neutral-50 border border-gray-200"
            >
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Seguir comprando</span>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}