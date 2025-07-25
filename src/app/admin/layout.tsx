import AdminNavBar from '@/components/AdminNavBar/AdminNavBar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminNavBar />
      <main className="flex-1 min-h-screen bg-neutral-50 p-8">{children}</main>
    </div>
  );
}