import AdminNavBar from '@/components/AdminNavBar/AdminNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex">
      {/* Sidebar solo en desktop */}
      <div className="hidden md:block">
        <AdminNavBar />
      </div>
      {/* Navbar mobile solo en mobile */}
      <div className="block md:hidden w-full">
        <AdminNavBar />
      </div>
      <main className="flex-1 min-h-screen bg-neutral-50 p-8">{children}</main>
    </div>
  );
}