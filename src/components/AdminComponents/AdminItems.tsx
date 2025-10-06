'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface ItemAdmin {
  id: number;
  nombre: string;
  subcategoria_id: number;
  disponible: boolean | null;
  subcategoria_nombre?: string;
  total_articulos?: number;
}

interface Subcategoria {
  id: number;
  nombre: string;
}

export default function AdminItems() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  
  const [items, setItems] = useState<ItemAdmin[]>([]);
  const [filteredItems, setFilteredItems] = useState<ItemAdmin[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<number | 'all'>('all');
  const [disponibleFilter, setDisponibleFilter] = useState<'all' | 'true' | 'false'>('all');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push('/');
    }
  }, [user, isAdmin, loading, router]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isAdmin) {
      loadItems();
      loadSubcategorias();
    }
  }, [isAdmin]);

  // Filtrar items
  useEffect(() => {
    let filtered = items;

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subcategoria_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por subcategoría
    if (selectedSubcategoria !== 'all') {
      filtered = filtered.filter(item => item.subcategoria_id === selectedSubcategoria);
    }

    // Filtrar por disponibilidad (solo true/false)
    if (disponibleFilter !== 'all') {
      filtered = filtered.filter(item => item.disponible === (disponibleFilter === 'true'));
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedSubcategoria, disponibleFilter]);

const loadItems = async () => {
  try {
    setLoadingItems(true);
    const response = await fetch('/api/admin/items');
    const data = await response.json();
    
    if (data.success) {    
      setItems(data.items);
    } else {
      console.error('Error cargando items:', data.error);
    }
  } catch (error) {
    console.error('Error cargando items:', error);
  } finally {
    setLoadingItems(false);
  }
};

  const loadSubcategorias = async () => {
    try {
      const response = await fetch('/api/admin/subcategorias');
      const data = await response.json();
      
      if (data.success) {
        setSubcategorias(data.subcategorias);
      }
    } catch (error) {
      console.error('Error cargando subcategorías:', error);
    }
  };

  const handleToggleDisponible = async (itemId: number, currentValue: boolean | null) => {
    try {
      // ✅ SOLO 2 ESTADOS: true <-> false
      const newValue = !currentValue;

      const response = await fetch('/api/admin/items/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          disponible: newValue
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar el estado local
        setItems(prevItems => 
          prevItems.map(item => 
            item.id === itemId 
              ? { ...item, disponible: newValue }
              : item
          )
        );
      } else {
        alert('Error al actualizar el item');
      }
    } catch (error) {
      console.error('Error actualizando item:', error);
      alert('Error al actualizar el item');
    }
  };

  const getDisponibleBadge = (disponible: boolean | null) => {
    // ✅ SOLO 2 ESTADOS: Disponible o No disponible
    if (disponible === true) {
      return <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Disponible</span>;
    } else {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">No disponible</span>;
    }
  };

  const getToggleButton = (item: ItemAdmin) => {
    const currentValue = item.disponible;
    const isAvailable = currentValue === true;
    
    return (
      <button
        onClick={() => handleToggleDisponible(item.id, currentValue)}
        className={`px-3 py-1 rounded-md text-xs font-medium transition-all hover:scale-105 ${
          isAvailable
            ? 'bg-green-500 hover:bg-green-600 text-white'
            : 'bg-red-500 hover:bg-red-600 text-white'
        }`}
        title={
          isAvailable
            ? 'Click para marcar como No disponible'
            : 'Click para marcar como Disponible'
        }
      >
        {isAvailable ? 'Disponible' : 'No disponible'}
      </button>
    );
  };

  if (loading || !user || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🛠️ Administración de Items
        </h1>
        <p className="text-gray-600">
          Gestiona la disponibilidad de todos los items del sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar item
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre del item o subcategoría..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Subcategoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subcategoría
            </label>
            <select
              value={selectedSubcategoria}
              onChange={(e) => setSelectedSubcategoria(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todas las subcategorías</option>
              {subcategorias.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Disponibilidad - SOLO 2 OPCIONES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={disponibleFilter}
              onChange={(e) => setDisponibleFilter(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="all">Todos los estados</option>
              <option value="true">Disponibles</option>
              <option value="false">No disponibles</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>Total items: {items.length}</span>
          <span>Filtrados: {filteredItems.length}</span>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedSubcategoria('all');
              setDisponibleFilter('all');
            }}
            className="text-orange-600 hover:text-orange-700 underline"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla de items */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subcategoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Artículos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loadingItems ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="ml-2 text-gray-600">Cargando items...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No se encontraron items con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.nombre}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {item.id}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {item.subcategoria_nombre || 'Sin subcategoría'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {item.total_articulos || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDisponibleBadge(item.disponible)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getToggleButton(item)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}