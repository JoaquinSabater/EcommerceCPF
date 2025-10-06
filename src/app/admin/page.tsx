'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AdminItems from '@/components/AdminComponents/AdminItems';

type AdminSection = 'items' | 'dashboard';
type UserSection = 'dashboard';

export default function AdminPage() {
  const { user, isAdmin, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [selectedSection, setSelectedSection] = useState<AdminSection | UserSection>('dashboard');

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo al login...');
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="ml-3 text-gray-600">Verificando permisos...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'dashboard',
        name: 'Dashboard',
        icon: '📊',
        description: isAdmin ? 'Panel de administración' : 'Mi panel personal'
      },
    ];

    if (isAdmin) {
      baseItems.push({
        id: 'items',
        name: 'Gestión de Items',
        icon: '🛠️',
        description: 'Administrar disponibilidad de items'
      });
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const renderContent = () => {
    switch (selectedSection) {
      case 'items':
        if (isAdmin) {
          return <AdminItems />;
        } else {
          return renderUserDashboard();
        }


      case 'dashboard':
      default:
        return isAdmin ? renderAdminDashboard() : renderUserDashboard();
    }
  };

  const renderAdminDashboard = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👋 Bienvenido, {user.nombre}
        </h1>
        <p className="text-gray-600">
          Panel de administración del sistema
        </p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          👑 Administrador
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {navigationItems.slice(1).map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedSection(item.id as AdminSection)}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {item.name}
              </h3>
              <span className="text-2xl">{item.icon}</span>
            </div>
            <p className="text-gray-600 text-sm">
              {item.description}
            </p>
            <div className="mt-4">
              <span className="text-orange-600 text-sm font-medium hover:text-orange-700">
                Ir a {item.name} →
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📈 Estadísticas del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold text-blue-900">-</p>
              </div>
              <span className="text-blue-500 text-xl">📦</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Items Disponibles</p>
                <p className="text-2xl font-bold text-green-900">-</p>
              </div>
              <span className="text-green-500 text-xl">✅</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Usuarios</p>
                <p className="text-2xl font-bold text-purple-900">-</p>
              </div>
              <span className="text-purple-500 text-xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-sm">
            💡 Las estadísticas se cargarán dinámicamente en futuras versiones
          </p>
        </div>
      </div>
    </div>
  );

  const renderUserDashboard = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          👋 Bienvenido, {user.nombre}
        </h1>
        <p className="text-gray-600">
          Tu panel personal
        </p>
        <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          👤 Usuario
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mi Perfil
            </h3>
            <span className="text-2xl">⚙️</span>
          </div>
          <p className="text-gray-600 text-sm">
            Configurar datos personales
          </p>
          <div className="mt-4">
            <span className="text-gray-400 text-sm">
              Próximamente →
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1 py-4 overflow-x-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedSection(item.id as AdminSection | UserSection)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  selectedSection === item.id
                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{item.icon}</span>
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main>
        {renderContent()}
      </main>
    </div>
  );
}