'use client';

import { HomeIcon, ShoppingCartIcon, CubeIcon, UsersIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menu = [
  { title: 'Dashboard', path: '/admin', icon: <HomeIcon className="w-6 h-6" /> },
  { title: 'Orders', path: '/admin/orders', icon: <ShoppingCartIcon className="w-6 h-6" /> },
  { title: 'Products', path: '/admin/products', icon: <CubeIcon className="w-6 h-6" /> },
  { title: 'Customers', path: '/admin/customers', icon: <UsersIcon className="w-6 h-6" /> },
  { title: 'Settings', path: '/admin/settings', icon: <Cog6ToothIcon className="w-6 h-6" /> },
];

export default function AdminNavBar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-white border-r flex flex-col">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="rounded-full bg-neutral-900 w-12 h-12 flex items-center justify-center">
          <span className="text-white text-2xl font-bold">🛍️</span>
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
    </aside>
  );
}