'use client';

import { ShoppingBagIcon, CubeIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import AdminMobileMenu from './AdminMobileMenu';

const menu = [
  { title: 'Pedidos', path: '/admin/orders', icon: <ShoppingBagIcon className="w-6 h-6" /> },
  { title: 'Stock', path: '/admin/products', icon: <CubeIcon className="w-6 h-6" /> },
];

export default function AdminNavBar() {
  const pathname = usePathname();

  return (
    <>
      {/* Botón menú mobile solo visible en mobile */}
      <div className="block md:hidden p-2">
        <AdminMobileMenu />
      </div>
      {/* Sidebar solo visible en desktop */}
      <aside className="hidden md:flex h-screen w-64 bg-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center">
              <Link href="/admin" className="flex items-center">
                <Image
                  src="/logo_orange_on_transparent.png"
                  width={40}
                  height={40}
                  alt="logo"
                />
              </Link>
            </div>
            <span className="font-bold text-xl">Admin</span>
          </div>
          <nav className="flex-1 px-4">
            <ul className="space-y-2">
              {menu.map((item) => (
                <li key={item.title}>
                  <Link
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      pathname === item.path
                        ? 'bg-neutral-100 font-semibold text-black'
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
        {/* Botón Seguir Comprando centrado */}
        <div className="p-4 flex justify-center">
          <Link
            href="/public"
            className="flex items-center gap-2 text-lg font-normal px-4 py-3 rounded-lg transition text-neutral-600 hover:bg-neutral-50"
          >
            <ChevronLeftIcon className="w-5 h-5" />
            <span>Seguir comprando</span>
          </Link>
        </div>
      </aside>
    </>
  );
}