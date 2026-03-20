'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import AdminItems from '@/components/AdminComponents/AdminItems';
import ClienteMovimientos from '@/components/ClienteComponents/ClienteMovimientos';
import { showError, showSuccess } from '@/lib/swal';

type PromoAPIResponse = {
  active: boolean;
  promotion: {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    descuento_percent: number;
    max_pedidos_por_cliente: number;
  } | null;
};

type AdminSection = 'items' | 'dashboard';
type UserSection = 'dashboard' | 'movimientos';

export default function AdminPage() {
  const { user, isAdmin, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [selectedSection, setSelectedSection] = useState<AdminSection | UserSection>('dashboard');
  const [promoData, setPromoData] = useState<PromoAPIResponse | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoSaving, setPromoSaving] = useState(false);

  const fetchPromocion = useCallback(async () => {
    if (!isAdmin) {
      setPromoData(null);
      return;
    }
    setPromoLoading(true);
    try {
      const response = await fetch('/api/promociones');
      if (!response.ok) {
        throw new Error('Respuesta no válida');
      }
      const data: PromoAPIResponse = await response.json();
      setPromoData(data);
    } catch (error) {
      console.error('Error cargando promoción:', error);
      showError('Promoción', 'No pudimos cargar el estado de la promoción.');
    } finally {
      setPromoLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPromocion();
  }, [fetchPromocion]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const buildPromoDates = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 21);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endDay = Math.min(31, lastDayOfMonth);
    const end = new Date(now.getFullYear(), now.getMonth(), endDay);
    return {
      start: formatDate(start),
      end: formatDate(end)
    };
  };

  const togglePromocion = async () => {
    if (!isAdmin) return;
    const activating = !promoData?.active;
    const { start, end } = buildPromoDates();

    const body = {
      activa: activating,
      fecha_inicio: promoData?.promotion?.fecha_inicio || start,
      fecha_fin: promoData?.promotion?.fecha_fin || end,
      descuento_percent: promoData?.promotion?.descuento_percent ?? 5,
      max_pedidos_por_cliente: promoData?.promotion?.max_pedidos_por_cliente ?? 5,
      resetCounters: activating,
      nombre: promoData?.promotion?.nombre || 'Promo 5% del 21 al 31'
    };

    setPromoSaving(true);
    try {
      const response = await fetch('/api/promociones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Error al guardar la promoción');
      }

      setPromoData({
        active: activating,
        promotion: data.promotion
      });

      showSuccess(
        activating ? 'Promoción activada' : 'Promoción desactivada',
        activating
          ? 'Los contadores se reiniciaron y la promo estará disponible del 21 al 31.'
          : 'La promo quedó inactiva. Los importes volverán a verse normales.'
      );
    } catch (error) {
      console.error('Error guardando promo:', error);
      showError('Promoción', error instanceof Error ? error.message : 'Error al actualizar la promoción');
    } finally {
      setPromoSaving(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      //console.log('Usuario no autenticado, redirigiendo al login...');
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-center min-h-screen px-4">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-orange-500 mb-2 sm:mb-0 sm:mr-3"></div>
        <span className="text-sm sm:text-base text-gray-600 text-center">Verificando permisos...</span>
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
      // Items solo para admins
      baseItems.push({
        id: 'items',
        name: 'Gestión de Items',
        icon: '🛠️',
        description: 'Administrar disponibilidad de items'
      });
    } else {
      // Movimientos solo para clientes
      baseItems.push({
        id: 'movimientos',
        name: 'Mi Cuenta Corriente',
        icon: '💰',
        description: 'Ver mis movimientos de cuenta corriente'
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

      case 'movimientos':
        if (!isAdmin && user.id) {
          return <ClienteMovimientos clienteId={user.id} />;
        } else {
          return renderUserDashboard();
        }

      case 'dashboard':
      default:
        return isAdmin ? renderAdminDashboard() : renderUserDashboard();
    }
  };

  const renderAdminDashboard = () => (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          👋 Bienvenido, <span className="block sm:inline">{user.nombre}</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-3">
          Panel de administración del sistema
        </p>
        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          👑 Administrador
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {navigationItems.slice(1).map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedSection(item.id as AdminSection)}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-l-4 border-orange-500"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {item.name}
              </h3>
              <span className="text-xl sm:text-2xl">{item.icon}</span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
              {item.description}
            </p>
            <div>
              <span className="text-orange-600 text-xs sm:text-sm font-medium hover:text-orange-700">
                Ir a {item.name} →
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">
          📈 Estadísticas del Sistema
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3 sm:p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-xs sm:text-sm font-medium">Total Items</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-900">-</p>
              </div>
              <span className="text-blue-500 text-lg sm:text-xl">📦</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 sm:p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-xs sm:text-sm font-medium">Items Disponibles</p>
                <p className="text-lg sm:text-2xl font-bold text-green-900">-</p>
              </div>
              <span className="text-green-500 text-lg sm:text-xl">✅</span>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-3 sm:p-4 border border-purple-200 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-xs sm:text-sm font-medium">Total Usuarios</p>
                <p className="text-lg sm:text-2xl font-bold text-purple-900">-</p>
              </div>
              <span className="text-purple-500 text-lg sm:text-xl">👥</span>
            </div>
          </div>
        </div>
        
        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-gray-500 text-xs sm:text-sm">
            💡 Las estadísticas se cargarán dinámicamente en futuras versiones
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">🎯 Promoción 5% (21 al 31)</h3>
              <p className="text-sm text-gray-600">
                Estado actual: <span className={`font-semibold ${promoData?.active ? 'text-green-600' : 'text-gray-800'}`}>
                  {promoData?.active ? 'Activa' : 'Inactiva'}
                </span>
              </p>
              {promoData?.promotion && (
                <p className="text-xs text-gray-500">
                  {promoData.promotion.fecha_inicio} → {promoData.promotion.fecha_fin} · Máx {promoData.promotion.max_pedidos_por_cliente} pedidos · {promoData.promotion.descuento_percent}% OFF
                </p>
              )}
            </div>
            <button
              onClick={togglePromocion}
              disabled={promoSaving || promoLoading}
              className={`px-4 py-2 rounded-lg font-medium text-white ${promoData?.active ? 'bg-gray-600 hover:bg-gray-700' : 'bg-orange-500 hover:bg-orange-600'} disabled:opacity-60`}
            >
              {promoSaving
                ? 'Guardando...'
                : promoData?.active
                  ? 'Desactivar promo'
                  : 'Activar promo'}
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderUserDashboard = () => (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          👋 Bienvenido, <span className="block sm:inline">{user.nombre}</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mb-3">
          Tu panel personal
        </p>
        <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-orange-200 text-black">
          Cliente
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {navigationItems.slice(1).map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedSection(item.id as UserSection)}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:scale-105 border-l-4 border-orange-200"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                {item.name}
              </h3>
              <span className="text-xl sm:text-2xl">{item.icon}</span>
            </div>
            <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
              {item.description}
            </p>
            <div>
              <span className="text-orange-600 text-xs sm:text-sm font-medium hover:text-orange-300">
                Ir a {item.name} →
              </span>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 border-l-4 border-gray-300 lg:col-span-1">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Mi Perfil
            </h3>
            <span className="text-xl sm:text-2xl">⚙️</span>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm mb-3 sm:mb-4">
            Configurar datos personales
          </p>
          <div>
            <span className="text-gray-400 text-xs sm:text-sm">
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
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
          <nav className="flex space-x-1 py-3 sm:py-4 overflow-x-auto scrollbar-hide">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedSection(item.id as AdminSection | UserSection)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  selectedSection === item.id
                    ? isAdmin 
                      ? 'bg-orange-100 text-orange-700 border border-orange-200'
                      : 'bg-orange-200 text-black border border-orange-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="text-sm sm:text-base">{item.icon}</span>
                <span className="hidden xs:inline sm:inline">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
}