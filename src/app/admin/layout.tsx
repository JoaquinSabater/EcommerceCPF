// filepath: c:\Users\joaqu\Desktop\EcommerceCPF\src\app\admin\layout.tsx
import AdminNavBar from "@/components/AdminNavBar/AdminNavBar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminNavBar />
      {/* Main content con padding-top para móvil */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}