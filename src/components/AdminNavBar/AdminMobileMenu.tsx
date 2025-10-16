'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { XMarkIcon, Bars3Icon, ShoppingBagIcon, CubeIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

const menu = [
  { title: 'Pedidos', path: '/admin/pedidos', icon: <ShoppingBagIcon className="w-6 h-6" /> },
];

export default function AdminMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      {/* Top bar fijo: hamburguesa + logo centrado */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-white border-b border-gray-200">
        {/* Botón hamburguesa */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2"
          aria-label="Abrir menú admin"
        >
          <Bars3Icon className="h-6 w-6 text-gray-700" />
        </button>
        
        {/* Logo centrado */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/admin" className="flex items-center">
            <Image
              src="/logo_orange_on_transparent.png"
              width={32}
              height={32}
              alt="logo"
            />
          </Link>
        </div>
        
        {/* Espacio vacío para balancear */}
        <div className="w-10" />
      </div>

      {/* Overlay del menú */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menú lateral */}
          <div className="fixed top-0 left-0 h-full w-full sm:w-80 bg-white shadow-xl z-50 flex flex-col">
            {/* Header del menú */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Panel Admin</h2>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <XMarkIcon className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              {/* Información del usuario */}
              {user && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="font-semibold text-sm text-gray-900">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400 mt-1">CUIL: {user.cuil}</p>
                </div>
              )}
            </div>
            
            {/* Navegación */}
            <nav className="flex-1 p-4">
              <ul className="space-y-2">
                {menu.map((item) => (
                  <li key={item.title}>
                    <Link
                      href={item.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                      {item.icon}
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Footer con acciones */}
            <div className="p-4 border-t border-gray-200 space-y-3">
              {/* Botón Seguir comprando */}
              <Link
                href="/public"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Seguir comprando</span>
              </Link>
              
              {/* Botón Cerrar Sesión */}
              {user && (
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Cerrar sesión</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}