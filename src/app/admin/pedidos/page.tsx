"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Usar el mismo hook que AdminNavBar
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Package, 
  Calendar,
  User,
  Clock,
  FileText
} from 'lucide-react';
import {Pedido,ArticuloPedido} from "@/types/types";

const estadoColors = {
  'en_proceso': 'bg-blue-100 text-blue-800',
  'solicitud': 'bg-yellow-100 text-yellow-800',
  'parcial': 'bg-orange-100 text-orange-800',
  'armado': 'bg-green-100 text-green-800',
  'cancelado': 'bg-red-100 text-red-800',
  'default': 'bg-gray-100 text-gray-800'
};

export default function PedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [expandedPedido, setExpandedPedido] = useState<number | null>(null);
  const [articulosPedido, setArticulosPedido] = useState<{[key: number]: ArticuloPedido[]}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [loadingArticulos, setLoadingArticulos] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    if (user && !authLoading) {
      fetchPedidos();
    }
  }, [user, authLoading]);

    const fetchPedidos = async () => {
        if (!user) return;
        try {
            const response = await fetch(`/api/admin/pedidos?clienteId=${user.id}`);
            if (!response.ok) throw new Error('Error al cargar pedidos');
            const data = await response.json();
            setPedidos(data);
        } catch (error) {
            console.error('Error fetching pedidos:', error);
        } finally {
            setLoading(false);
        }
    };

  const fetchArticulosPedido = async (pedidoId: number) => {
    if (articulosPedido[pedidoId]) return;

    setLoadingArticulos(prev => ({ ...prev, [pedidoId]: true }));
    
    try {
      const response = await fetch(`/api/admin/pedidos/${pedidoId}/articulos`);
      if (!response.ok) throw new Error('Error al cargar artículos');
      const data = await response.json();
      
      setArticulosPedido(prev => ({
        ...prev,
        [pedidoId]: data
      }));
    } catch (error) {
      console.error('Error fetching artículos:', error);
    } finally {
      setLoadingArticulos(prev => ({ ...prev, [pedidoId]: false }));
    }
  };

  const togglePedidoExpansion = (pedidoId: number) => {
    if (expandedPedido === pedidoId) {
      setExpandedPedido(null);
    } else {
      setExpandedPedido(pedidoId);
      fetchArticulosPedido(pedidoId);
    }
  };

  const filteredPedidos = pedidos.filter(pedido => {
    const matchesSearch = 
      pedido.id.toString().includes(searchTerm) ||
      pedido.armador_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pedido.controlador_nombre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    
    return matchesSearch && matchesEstado;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'No iniciado';
    return new Date(`1970-01-01T${timeString}`).toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado: string) => {
    const colorClass = estadoColors[estado as keyof typeof estadoColors] || estadoColors.default;
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {estado.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Debes iniciar sesión para ver tus pedidos</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
        <p className="text-gray-600">Historial completo de todos tus pedidos</p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por ID de pedido, armador o controlador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="solicitud">Solicitud</option>
          <option value="en_proceso">En Proceso</option>
          <option value="parcial">Parcial</option>
          <option value="armado">Armado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Pedidos</p>
              <p className="text-2xl font-bold">{pedidos.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Proceso</p>
              <p className="text-2xl font-bold text-blue-600">
                {pedidos.filter(p => p.estado === 'en_proceso').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-green-600">
                {pedidos.filter(p => p.estado === 'armado').length}
              </p>
            </div>
            <Package className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pedidos.filter(p => p.estado === 'solicitud').length}
              </p>
            </div>
            <FileText className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {filteredPedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No tienes pedidos registrados</p>
          </div>
        ) : (
          filteredPedidos.map((pedido) => (
            <div key={pedido.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">Pedido #{pedido.id}</h3>
                      {getEstadoBadge(pedido.estado)}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(pedido.fecha_creacion)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Vendedor: {pedido.vendedor_nombre || `ID: ${pedido.vendedor_id}`}</span>
                      </div>
                      {pedido.remito_id && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Remito: {pedido.remito_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => togglePedidoExpansion(pedido.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {expandedPedido === pedido.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {expandedPedido === pedido.id && (
                <div className="border-t px-6 pb-6 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <h4 className="font-semibold mb-3">Información Adicional</h4>
                      <div className="space-y-2 text-sm">
                        {pedido.consolidado_id && (
                          <p><span className="font-medium">Consolidado ID:</span> {pedido.consolidado_id}</p>
                        )}
                        {pedido.categoria_principal_id && (
                          <p><span className="font-medium">Categoría Principal:</span> {pedido.categoria_principal_id}</p>
                        )}
                        {pedido.observaciones_generales && (
                          <div>
                            <p className="font-medium">Observaciones:</p>
                            <p className="text-gray-600 bg-gray-50 p-2 rounded">{pedido.observaciones_generales}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Artículos del Pedido</h4>
                    {loadingArticulos[pedido.id] ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Cargando artículos...</span>
                      </div>
                    ) : articulosPedido[pedido.id] ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-3 px-4">Item</th>
                              <th className="text-left py-3 px-4">Modelo</th>
                              <th className="text-right py-3 px-4">Cantidad</th>
                            </tr>
                          </thead>
                          <tbody>
                            {articulosPedido[pedido.id].map((articulo, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{articulo.item_nombre}</td>
                                <td className="py-3 px-4">{articulo.modelo}</td>
                                <td className="py-3 px-4 text-right font-medium">{articulo.cantidad}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No se pudieron cargar los artículos</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}