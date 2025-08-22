"use client"

import AdminNavBar from '@/components/AdminNavBar/AdminNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar fijo - siempre visible */}
      <div className="hidden md:block">
        <AdminNavBar />
      </div>
      
      {/* Navbar mobile solo en mobile */}
      <div className="block md:hidden w-full">
        <AdminNavBar />
      </div>
      
      {/* Contenido principal con scroll independiente */}
      <main className="flex-1 overflow-y-auto bg-neutral-50">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}