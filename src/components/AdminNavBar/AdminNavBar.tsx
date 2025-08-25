'use client';

import { ShoppingBagIcon, CubeIcon, ChevronLeftIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import AdminMobileMenu from './AdminMobileMenu';
import { useAuth } from '@/hooks/useAuth';

const menu = [
  { title: 'Pedidos', path: '/admin/pedidos', icon: <ShoppingBagIcon className="w-6 h-6" /> },
  { title: 'Stock', path: '/admin/products', icon: <CubeIcon className="w-6 h-6" /> },
];

export default function AdminNavBar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      {/* Solo mostrar AdminMobileMenu en móvil */}
      <div className="md:hidden">
        <AdminMobileMenu />
      </div>
      
      {/* Sidebar solo visible en desktop */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white flex-col justify-between shadow-lg z-40">
        <div>
          {/* Header con logo y usuario */}
          <div className="px-6 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/admin" className="flex items-center">
                <Image
                  src="/logo_orange_on_transparent.png"
                  width={40}
                  height={40}
                  alt="logo"
                />
              </Link>
              <span className="font-bold text-xl text-orange-600">Panel Admin</span>
            </div>
            
            {/* Información del usuario */}
            {user ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <UserCircleIcon className="w-10 h-10 text-gray-600" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-gray-900">
                    {user.nombre} {user.apellido}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Usuario no identificado</div>
            )}
          </div>
          
          {/* Navegación */}
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {menu.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      pathname === item.path
                        ? 'bg-orange-100 font-semibold text-orange-700'
                        : 'text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        
        {/* Footer con acciones */}
        <div className="p-4 border-t border-gray-200">
          {/* Botón Cerrar Sesión */}
          {user && (
            <button
              onClick={logout}
              className="w-full flex items-center gap-2 text-sm text-red-600 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition mb-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Cerrar sesión</span>
            </button>
          )}
          
          {/* Botón Seguir Comprando */}
          <Link
            href="/public"
            className="flex items-center justify-center gap-2 text-sm font-normal px-4 py-2 rounded-lg transition text-neutral-600 hover:bg-neutral-50 border border-gray-200"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            <span>Seguir comprando</span>
          </Link>
        </div>
      </aside>
    </>
  );
}