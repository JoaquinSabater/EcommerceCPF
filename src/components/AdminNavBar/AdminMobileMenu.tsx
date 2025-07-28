'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { XMarkIcon, Bars3Icon, ShoppingBagIcon, CubeIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';

const menu = [
  { title: 'Pedidos', path: '/admin/orders', icon: <ShoppingBagIcon className="w-6 h-6" /> },
  { title: 'Stock', path: '/admin/products', icon: <CubeIcon className="w-6 h-6" /> },
];

export default function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

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
        {/* Logo centrado */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/admin" className="flex items-center">
            <Image
              src="/logo_orange_on_transparent.png"
              width={40}
              height={40}
              alt="logo"
            />
            <span className="font-bold text-xl ml-2">Admin</span>
          </Link>
        </div>
        {/* Espacio a la derecha para balancear */}
        <div className="w-9" />
      </div>

      {/* Menú lateral al abrir hamburguesa */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Top bar con botón cerrar y logo centrado */}
          <div className="flex items-center justify-between p-4 relative">
            <button onClick={() => setIsOpen(false)} className="p-2">
              <XMarkIcon className="h-7 w-7" />
            </button>
            <div className="w-9" />
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
          {/* Botón Seguir comprando */}
          <div className="p-4 flex justify-center">
            <Link
              href="/public"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 text-lg font-normal px-4 py-3 rounded-lg transition text-neutral-600 hover:bg-neutral-50"
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