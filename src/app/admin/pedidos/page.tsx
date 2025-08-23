"use client"

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Package, 
  Calendar,
  User,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Pedido, ArticuloPedido } from "@/types/types";
import { PedidoPreliminar } from "@/data/data";

const estadoColors = {
  'en_proceso': 'bg-blue-100 text-blue-800',
  'solicitud': 'bg-yellow-100 text-yellow-800',
  'parcial': 'bg-orange-100 text-orange-800',
  'armado': 'bg-green-100 text-green-800',
  'cancelado': 'bg-red-100 text-red-800',
  'borrador': 'bg-purple-100 text-purple-800',
  'enviado': 'bg-indigo-100 text-indigo-800',
  'default': 'bg-gray-100 text-gray-800'
};

// Tipo combinado para manejar ambos tipos de pedidos
type PedidoCombinado = (Pedido | PedidoPreliminar) & {
  tipo: 'normal' | 'preliminar';
  esPreliminar?: boolean;
};

export default function PedidosPage() {
  const { user, loading: authLoading } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidosPreliminares, setPedidosPreliminares] = useState<PedidoPreliminar[]>([]);
  const [expandedPedido, setExpandedPedido] = useState<string | null>(null);
  const [articulosPedido, setArticulosPedido] = useState<{[key: string]: ArticuloPedido[]}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [loadingArticulos, setLoadingArticulos] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    if (user && !authLoading) {
      fetchPedidos();
      fetchPedidosPreliminares();
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
    }
  };

  const fetchPedidosPreliminares = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/admin/pedidos-preliminares?clienteId=${user.id}`);
      if (!response.ok) throw new Error('Error al cargar pedidos preliminares');
      const data = await response.json();
      // Solo mostrar los que están en estado 'borrador' (activos)
      setPedidosPreliminares(data.filter((p: PedidoPreliminar) => p.estado === 'borrador'));
    } catch (error) {
      console.error('Error fetching pedidos preliminares:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticulosPedido = async (pedidoId: number, esPreliminar: boolean = false) => {
    const key = `${esPreliminar ? 'preliminar' : 'normal'}-${pedidoId}`;
    if (articulosPedido[key]) return;

    setLoadingArticulos(prev => ({ ...prev, [key]: true }));
    
    try {
      const endpoint = esPreliminar 
        ? `/api/admin/pedidos-preliminares/${pedidoId}/articulos`
        : `/api/admin/pedidos/${pedidoId}/articulos`;
        
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Error al cargar artículos');
      const data = await response.json();
      
      setArticulosPedido(prev => ({
        ...prev,
        [key]: data
      }));
    } catch (error) {
      console.error('Error fetching artículos:', error);
    } finally {
      setLoadingArticulos(prev => ({ ...prev, [key]: false }));
    }
  };

  const togglePedidoExpansion = (pedidoId: number, esPreliminar: boolean = false) => {
    const key = `${esPreliminar ? 'preliminar' : 'normal'}-${pedidoId}`;
    
    if (expandedPedido === key) {
      setExpandedPedido(null);
    } else {
      setExpandedPedido(key);
      fetchArticulosPedido(pedidoId, esPreliminar);
    }
  };

  // Combinar y ordenar ambos tipos de pedidos
  const pedidosCombinados: PedidoCombinado[] = [
    ...pedidos.map(p => ({ ...p, tipo: 'normal' as const, esPreliminar: false })),
    ...pedidosPreliminares.map(p => ({ 
      ...p, 
      tipo: 'preliminar' as const, 
      esPreliminar: true,
      // Mapear campos para compatibilidad
      vendedor_id: p.vendedor_id,
      cliente_id: p.cliente_id
    }))
  ].sort(
    (a, b) =>
      new Date(b.fecha_creacion ?? '').getTime() -
      new Date(a.fecha_creacion ?? '').getTime()
  );

  const filteredPedidos = pedidosCombinados.filter(pedido => {
    const matchesSearch = 
      pedido.id?.toString().includes(searchTerm) ||
      (pedido.vendedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesEstado = filtroEstado === 'todos' || pedido.estado === filtroEstado;
    const matchesTipo = filtroTipo === 'todos' || 
                       (filtroTipo === 'preliminar' && pedido.esPreliminar) ||
                       (filtroTipo === 'normal' && !pedido.esPreliminar);
    
    return matchesSearch && matchesEstado && matchesTipo;
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

  const getEstadoBadge = (estado: string, esPreliminar: boolean = false) => {
    const colorClass = estadoColors[estado as keyof typeof estadoColors] || estadoColors.default;
    const label = esPreliminar ? 
      (estado === 'borrador' ? 'PRELIMINAR' : estado.replace('_', ' ').toUpperCase()) :
      estado.replace('_', ' ').toUpperCase();
      
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colorClass}`}>
        {label}
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
            placeholder="Buscar por ID de pedido o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filtroTipo}
          onChange={(e) => setFiltroTipo(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los tipos</option>
          <option value="preliminar">Pedidos Preliminares</option>
          <option value="normal">Pedidos Normales</option>
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="todos">Todos los estados</option>
          <option value="borrador">Preliminar</option>
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
              <p className="text-sm text-gray-600">Pedidos Preliminares</p>
              <p className="text-2xl font-bold text-purple-600">{pedidosPreliminares.length}</p>
            </div>
            <AlertCircle className="h-8 w-8 text-purple-600" />
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
            <div key={`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`} 
                 className={`bg-white rounded-lg shadow hover:shadow-lg transition-shadow ${
                   pedido.esPreliminar ? 'border-l-4 border-purple-500' : ''
                 }`}>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold">
                        {pedido.esPreliminar ? 'Pedido Preliminar' : 'Pedido'} #{pedido.id}
                      </h3>
                      {getEstadoBadge(pedido.estado ?? 'default', pedido.esPreliminar)}
                      {pedido.esPreliminar && (
                        <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          Pendiente de confirmación
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{pedido.fecha_creacion ? formatDate(pedido.fecha_creacion) : 'Sin fecha'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Vendedor: {pedido.vendedor_nombre || `ID: ${pedido.vendedor_id}`}</span>
                      </div>
                      {!pedido.esPreliminar && 'remito_id' in pedido && pedido.remito_id && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>Remito: {pedido.remito_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => togglePedidoExpansion(pedido.id!, pedido.esPreliminar)}
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  >
                    {expandedPedido === `${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}` ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {expandedPedido === `${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}` && (
                <div className="border-t px-6 pb-6 pt-4">
                  {/* Información adicional - solo para pedidos normales */}
                  {!pedido.esPreliminar && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h4 className="font-semibold mb-3">Información Adicional</h4>
                        <div className="space-y-2 text-sm">
                          {'consolidado_id' in pedido && pedido.consolidado_id && (
                            <p><span className="font-medium">Consolidado ID:</span> {pedido.consolidado_id}</p>
                          )}
                          {'categoria_principal_id' in pedido && pedido.categoria_principal_id && (
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
                  )}

                  <div>
                    <h4 className="font-semibold mb-3">Artículos del Pedido</h4>
                    {loadingArticulos[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`] ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Cargando artículos...</span>
                      </div>
                    ) : articulosPedido[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`] ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              <th className="text-left py-3 px-4">Item</th>
                              <th className="text-left py-3 px-4">Modelo</th>
                              <th className="text-right py-3 px-4">Cantidad</th>
                              {pedido.esPreliminar && (
                                <th className="text-right py-3 px-4">Precio Unit.</th>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            {articulosPedido[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`].map((articulo, index) => (
                              <tr key={index} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{articulo.item_nombre}</td>
                                <td className="py-3 px-4">{articulo.modelo}</td>
                                <td className="py-3 px-4 text-right font-medium">{articulo.cantidad}</td>
                                {pedido.esPreliminar && 'precio_unitario' in articulo && (
                                  <td className="py-3 px-4 text-right">${articulo.precio_unitario?.toLocaleString()}</td>
                                )}
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