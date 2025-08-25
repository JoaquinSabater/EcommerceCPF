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
  FileText,
  AlertCircle,
  Filter
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
  const [showFilters, setShowFilters] = useState(false);

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
      vendedor_id: p.vendedor_id,
      cliente_id: p.cliente_id
    }))
  ].sort((a, b) => 
    new Date(b.fecha_creacion ?? '').getTime() - new Date(a.fecha_creacion ?? '').getTime()
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Debes iniciar sesión para ver tus pedidos</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none">
      {/* Header - Responsive */}
      <div className="mb-4 md:mb-8">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 md:mb-2">
          Mis Pedidos
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Historial completo de todos tus pedidos
        </p>
      </div>

      {/* Búsqueda - Siempre visible */}
      <div className="mb-3 md:mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por ID o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtros - Colapsables en móvil */}
      <div className="mb-4 md:mb-6">
        {/* Botón para mostrar filtros en móvil */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg mb-3"
        >
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {/* Filtros - Visibles en desktop, colapsables en móvil */}
        <div className={`space-y-3 md:space-y-0 md:flex md:gap-4 ${showFilters ? 'block' : 'hidden md:flex'}`}>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="w-full md:w-auto px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todos los tipos</option>
            <option value="preliminar">Preliminares</option>
            <option value="normal">Normales</option>
          </select>
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full md:w-auto px-3 py-2.5 md:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>

      {/* Estadísticas - Grid responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Total Pedidos</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">{pedidos.length}</p>
            </div>
            <Package className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-gray-600 mb-1">Preliminares</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">{pedidosPreliminares.length}</p>
            </div>
            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-purple-600 flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-3 md:space-y-4">
        {filteredPedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8 text-center">
            <Package className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 text-sm md:text-base">No tienes pedidos registrados</p>
          </div>
        ) : (
          filteredPedidos.map((pedido) => (
            <div key={`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`} 
                 className={`bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow ${
                   pedido.esPreliminar ? 'border-l-4 border-l-purple-500' : ''
                 }`}>
              
              {/* Header del pedido */}
              <div className="p-3 md:p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Título y badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="text-sm md:text-base lg:text-lg font-semibold text-gray-900 truncate">
                        {pedido.esPreliminar ? 'Pedido Preliminar' : 'Pedido'} #{pedido.id}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        {getEstadoBadge(pedido.estado ?? '', pedido.esPreliminar)}
                        {pedido.esPreliminar && (
                          <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-md font-medium">
                            Pendiente
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Información del pedido - Stack en móvil */}
                    <div className="space-y-2 text-xs md:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate">
                          {pedido.fecha_creacion ? formatDate(pedido.fecha_creacion) : '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate">
                          Vendedor: {pedido.vendedor_nombre || `ID: ${pedido.vendedor_id}`}
                        </span>
                      </div>
                      {!pedido.esPreliminar && 'remito_id' in pedido && pedido.remito_id && (
                        <div className="flex items-center gap-2">
                          <FileText className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">Remito: {pedido.remito_id}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botón expandir */}
                  <button
                    onClick={() => togglePedidoExpansion(pedido.id!, pedido.esPreliminar)}
                    className="p-2 md:p-2.5 text-gray-400 hover:text-gray-600 focus:outline-none flex-shrink-0 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    {expandedPedido === `${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}` ? (
                      <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Panel expandido */}
              {expandedPedido === `${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}` && (
                <div className="border-t bg-gray-50 px-3 md:px-4 lg:px-6 py-3 md:py-4">
                  
                  {/* Información adicional - solo para pedidos normales */}
                  {!pedido.esPreliminar && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-3 text-sm md:text-base text-gray-900">
                        Información Adicional
                      </h4>
                      <div className="space-y-2 text-xs md:text-sm">
                        {'consolidado_id' in pedido && pedido.consolidado_id && (
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-900">Consolidado ID:</span> {pedido.consolidado_id}
                          </p>
                        )}
                        {'categoria_principal_id' in pedido && pedido.categoria_principal_id && (
                          <p className="text-gray-600">
                            <span className="font-medium text-gray-900">Categoría Principal:</span> {pedido.categoria_principal_id}
                          </p>
                        )}
                        {pedido.observaciones_generales && (
                          <div>
                            <p className="font-medium text-gray-900 mb-1">Observaciones:</p>
                            <p className="text-gray-600 bg-white p-2 md:p-3 rounded-lg border text-xs md:text-sm">
                              {pedido.observaciones_generales}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Artículos del pedido */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm md:text-base text-gray-900">
                      Artículos del Pedido
                    </h4>
                    
                    {loadingArticulos[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`] ? (
                      <div className="flex items-center justify-center py-6 md:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="ml-2 text-sm text-gray-600">Cargando artículos...</span>
                      </div>
                    ) : articulosPedido[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`] ? (
                      <div className="bg-white rounded-lg border overflow-hidden">
                        {/* Vista móvil - Cards */}
                        <div className="md:hidden space-y-3 p-3">
                          {articulosPedido[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`].map((articulo, index) => (
                            <div key={index} className="border rounded-lg p-3 bg-gray-50">
                              <div className="space-y-2">
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">{articulo.item_nombre}</p>
                                  <p className="text-xs text-gray-600">{articulo.modelo}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600">Cantidad:</span>
                                  <span className="font-semibold text-sm">{articulo.cantidad}</span>
                                </div>
                                {pedido.esPreliminar && 'precio_unitario' in articulo && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-gray-600">Precio:</span>
                                    <span className="font-semibold text-sm">${articulo.precio_unitario?.toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Vista desktop - Tabla */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b bg-gray-100">
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Item</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-900">Modelo</th>
                                <th className="text-right py-3 px-4 font-semibold text-gray-900">Cantidad</th>
                                {pedido.esPreliminar && (
                                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Precio Unit.</th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {articulosPedido[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`].map((articulo, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50 transition-colors">
                                  <td className="py-3 px-4 text-gray-900">{articulo.item_nombre}</td>
                                  <td className="py-3 px-4 text-gray-600">{articulo.modelo}</td>
                                  <td className="py-3 px-4 text-right font-medium text-gray-900">{articulo.cantidad}</td>
                                  {pedido.esPreliminar && 'precio_unitario' in articulo && (
                                    <td className="py-3 px-4 text-right font-medium text-gray-900">
                                      ${articulo.precio_unitario?.toLocaleString()}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg border p-6 text-center">
                        <p className="text-gray-500 text-sm">No se pudieron cargar los artículos</p>
                      </div>
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