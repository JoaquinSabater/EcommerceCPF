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
  Filter,
  AlertTriangle
} from 'lucide-react';
import { Pedido, ArticuloPedido } from "@/types/types";
import { PedidoPreliminar } from "@/data/data";
import EstadoPedidoTracker from '@/components/AdminComponents/EstadoPedidoTracker';

// Tipo combinado para manejar ambos tipos de pedidos
type PedidoCombinado = (Pedido | PedidoPreliminar) & {
  tipo: 'normal' | 'preliminar';
  esPreliminar?: boolean;
  consolidado_despachado?: number; // ✅ AGREGAR: Campo para despacho
};

export default function PedidosPage() {
  const { user, loading: authLoading, isDistribuidor } = useAuth();
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

  // ✅ Verificar si el usuario es distribuidor
  const esDistribuidor = isDistribuidor();

  useEffect(() => {
    if (user && !authLoading) {
      fetchPedidos();
      fetchPedidosPreliminares();
    }
  }, [user, authLoading]);

  // ✅ SIMPLIFICADO: Ahora la información de despacho viene en la consulta principal
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
    ...pedidos.map(p => ({ 
      ...p, 
      tipo: 'normal' as const, 
      esPreliminar: false,
      // ✅ Mantener la información de despacho que viene de la BD
      consolidado_despachado: (p as any).consolidado_despachado
    })),
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2" style={{ borderColor: '#ff7100' }}></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p style={{ color: '#1a1a1a' }}>Debes iniciar sesión para ver tus pedidos</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none">
      {/* ✅ ADVERTENCIA PARA DISTRIBUIDORES */}
      {esDistribuidor && (
        <div className="mb-4 md:mb-6 rounded-lg shadow-sm" style={{ 
          background: 'linear-gradient(to right, rgba(255, 113, 0, 0.1), rgba(255, 1, 86, 0.1))', 
          borderLeft: '4px solid #ff7100' 
        }}>
          <div className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: '#ff7100' }} />
              <div className="flex-1">
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#1a1a1a' }}>
                  ⚠️ Advertencia - Precios para Distribuidores
                </h3>
                <div className="text-sm space-y-1" style={{ color: '#1a1a1a' }}>
                  <p>
                    <strong>Los precios mostrados aquí son precios internos de remitos, no reflejan tu descuento de distribuidor.</strong>
                  </p>
                  <p className="text-xs" style={{ color: '#1a1a1a', opacity: 0.8 }}>
                    • En el catálogo y carrito ves precios con 20% de descuento
                  </p>
                  <p className="text-xs" style={{ color: '#1a1a1a', opacity: 0.8 }}>
                    • En pedidos/remitos se muestran precios originales del sistema
                  </p>
                  <p className="text-xs" style={{ color: '#1a1a1a', opacity: 0.8 }}>
                    • Tu facturación final aplicará el descuento correspondiente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header - Responsive */}
      <div className="mb-4 md:mb-8">
        <div className="flex items-center gap-2 mb-1 md:mb-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold" style={{ color: '#1a1a1a' }}>
            Mis Pedidos
          </h1>
          {esDistribuidor && (
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ 
              backgroundColor: 'rgba(255, 113, 0, 0.2)', 
              color: '#ff7100' 
            }}>
              Distribuidor
            </span>
          )}
        </div>
        <p className="text-sm md:text-base" style={{ color: '#1a1a1a', opacity: 0.7 }}>
          Historial completo de todos tus pedidos
          {esDistribuidor && (
            <span className="block text-xs mt-1" style={{ color: '#ff7100' }}>
              * Los precios mostrados son precios internos del sistema
            </span>
          )}
        </p>
      </div>

      {/* Búsqueda - Siempre visible */}
      <div className="mb-3 md:mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#1a1a1a', opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Buscar por ID o vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 md:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
            style={{ 
              borderColor: '#d3d3d3',
              color: '#1a1a1a'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7100'}
            onBlur={(e) => e.target.style.borderColor = '#d3d3d3'}
          />
        </div>
      </div>

      {/* Filtros - Colapsables en móvil */}
      <div className="mb-4 md:mb-6">
        {/* Botón para mostrar filtros en móvil */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden flex items-center gap-2 px-3 py-2 text-sm border rounded-lg mb-3"
          style={{ 
            color: '#1a1a1a',
            borderColor: '#d3d3d3'
          }}
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
            className="w-full md:w-auto px-3 py-2.5 md:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              borderColor: '#d3d3d3',
              color: '#1a1a1a'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7100'}
            onBlur={(e) => e.target.style.borderColor = '#d3d3d3'}
          >
            <option value="todos">Todos los tipos</option>
            <option value="preliminar">Preliminares</option>
            <option value="normal">Normales</option>
          </select>
          
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="w-full md:w-auto px-3 py-2.5 md:py-2 text-sm border rounded-lg focus:outline-none focus:ring-2"
            style={{ 
              borderColor: '#d3d3d3',
              color: '#1a1a1a'
            }}
            onFocus={(e) => e.target.style.borderColor = '#ff7100'}
            onBlur={(e) => e.target.style.borderColor = '#d3d3d3'}
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
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4" style={{ borderColor: '#d3d3d3' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm mb-1" style={{ color: '#1a1a1a', opacity: 0.7 }}>Total Pedidos</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold" style={{ color: '#1a1a1a' }}>{pedidos.length}</p>
            </div>
            <Package className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 flex-shrink-0" style={{ color: '#ff7100' }} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border p-3 md:p-4" style={{ borderColor: '#d3d3d3' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm mb-1" style={{ color: '#1a1a1a', opacity: 0.7 }}>Preliminares</p>
              <p className="text-lg md:text-xl lg:text-2xl font-bold" style={{ color: '#ff0156' }}>{pedidosPreliminares.length}</p>
            </div>
            <AlertCircle className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 flex-shrink-0" style={{ color: '#ff0156' }} />
          </div>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-3 md:space-y-4">
        {filteredPedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-6 md:p-8 text-center" style={{ borderColor: '#d3d3d3' }}>
            <Package className="mx-auto h-10 w-10 md:h-12 md:w-12 mb-4" style={{ color: '#d3d3d3' }} />
            <p className="text-sm md:text-base" style={{ color: '#1a1a1a', opacity: 0.7 }}>No tienes pedidos registrados</p>
          </div>
        ) : (
          filteredPedidos.map((pedido) => (
            <div 
              key={`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`} 
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
              style={{ 
                borderColor: '#d3d3d3',
                ...(pedido.esPreliminar && { borderLeft: '4px solid #ff0156' }),
                ...(esDistribuidor && !pedido.esPreliminar && { borderLeft: '4px solid #ff7100' })
              }}
            >
              
              {/* Header del pedido */}
              <div className="p-3 md:p-4 lg:p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Título y badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                      <h3 className="text-sm md:text-base lg:text-lg font-semibold truncate" style={{ color: '#1a1a1a' }}>
                        {pedido.esPreliminar ? 'Pedido Preliminar' : 'Pedido'} #{pedido.id}
                      </h3>
                    </div>
                    
                    {/* Información del pedido - Stack en móvil */}
                    <div className="space-y-2 text-xs md:text-sm" style={{ color: '#1a1a1a', opacity: 0.7 }}>
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
                    className="p-2 md:p-2.5 focus:outline-none flex-shrink-0 rounded-lg transition-colors"
                    style={{ color: '#1a1a1a', opacity: 0.5 }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.backgroundColor = 'rgba(211, 211, 211, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#1a1a1a';
                      e.currentTarget.style.opacity = '0.5';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
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
                <div 
                  className="border-t px-3 md:px-4 lg:px-6 py-3 md:py-4" 
                  style={{ 
                    borderColor: '#d3d3d3',
                    backgroundColor: 'rgba(211, 211, 211, 0.05)'
                  }}
                >
                  {/* ✅ TRACKER DE ESTADO CON INFORMACIÓN DE DESPACHO */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-4 text-sm md:text-base" style={{ color: '#1a1a1a' }}>
                      Estado del Pedido
                    </h4>
                    <EstadoPedidoTracker 
                      estadoActual={
                        pedido.esPreliminar 
                          ? (pedido as any).estado_preliminar || (pedido as any).estado || 'borrador'
                          : pedido.estado || 'solicitud'
                      } 
                      esPreliminar={pedido.esPreliminar}
                      estaDespachado={
                        !pedido.esPreliminar && (pedido as any).consolidado_despachado === 1
                      }
                    />
                  </div>

                  {!pedido.esPreliminar && (
                    <div className="mb-4">
                      <h4 className="font-semibold mb-3 text-sm md:text-base" style={{ color: '#1a1a1a' }}>
                        Información Adicional
                      </h4>
                      <div className="space-y-2 text-xs md:text-sm">
                        {'consolidado_id' in pedido && pedido.consolidado_id && (
                          <p style={{ color: '#1a1a1a', opacity: 0.7 }}>
                            <span className="font-medium" style={{ color: '#1a1a1a' }}>Consolidado ID:</span> {pedido.consolidado_id}
                            {/* ✅ MOSTRAR ESTADO DE DESPACHO */}
                            {(pedido as any).consolidado_despachado === 1 && (
                              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                Despachado
                              </span>
                            )}
                          </p>
                        )}
                        {pedido.observaciones_generales && (
                          <div>
                            <p className="font-medium mb-1" style={{ color: '#1a1a1a' }}>Observaciones:</p>
                            <p 
                              className="bg-white p-2 md:p-3 rounded-lg border text-xs md:text-sm"
                              style={{ 
                                color: '#1a1a1a',
                                borderColor: '#d3d3d3'
                              }}
                            >
                              {pedido.observaciones_generales}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Artículos del pedido */}
                  <div>
                    <h4 className="font-semibold mb-3 text-sm md:text-base" style={{ color: '#1a1a1a' }}>
                      Artículos del Pedido
                    </h4>
                    
                    {loadingArticulos[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`] ? (
                      <div className="flex items-center justify-center py-6 md:py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#ff7100' }}></div>
                        <span className="ml-2 text-sm" style={{ color: '#1a1a1a', opacity: 0.7 }}>Cargando artículos...</span>
                      </div>
                    ) : articulosPedido[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`] ? (
                      <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#d3d3d3' }}>
                        {/* Vista móvil - Cards */}
                        <div className="md:hidden space-y-3 p-3">
                          {articulosPedido[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`].map((articulo, index) => (
                            <div 
                              key={index} 
                              className="border rounded-lg p-3"
                              style={{ 
                                borderColor: '#d3d3d3',
                                backgroundColor: 'rgba(211, 211, 211, 0.05)'
                              }}
                            >
                              <div className="space-y-2">
                                <div>
                                  <p className="font-medium text-sm" style={{ color: '#1a1a1a' }}>{articulo.item_nombre}</p>
                                  <p className="text-xs" style={{ color: '#1a1a1a', opacity: 0.7 }}>{articulo.modelo}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs" style={{ color: '#1a1a1a', opacity: 0.7 }}>Cantidad:</span>
                                  <span className="font-semibold text-sm" style={{ color: '#1a1a1a' }}>{articulo.cantidad}</span>
                                </div>
                                {pedido.esPreliminar && 'precio_unitario' in articulo && (
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs" style={{ color: '#1a1a1a', opacity: 0.7 }}>Precio:</span>
                                    <div className="text-right font-medium" style={{ color: '#ff7100' }}>
                                      ${articulo.precio_unitario?.toLocaleString()}
                                    </div>
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
                              <tr 
                                className="border-b"
                                style={{ 
                                  borderColor: '#d3d3d3',
                                  backgroundColor: 'rgba(211, 211, 211, 0.1)'
                                }}
                              >
                                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#1a1a1a' }}>Item</th>
                                <th className="text-left py-3 px-4 font-semibold" style={{ color: '#1a1a1a' }}>Modelo</th>
                                <th className="text-right py-3 px-4 font-semibold" style={{ color: '#1a1a1a' }}>Cantidad</th>
                                {pedido.esPreliminar && (
                                  <th className="text-right py-3 px-4 font-semibold" style={{ color: '#1a1a1a' }}>
                                    Precio Unit.
                                  </th>
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {articulosPedido[`${pedido.esPreliminar ? 'preliminar' : 'normal'}-${pedido.id}`].map((articulo, index) => (
                                <tr 
                                  key={index} 
                                  className="border-b transition-colors"
                                  style={{ borderColor: '#d3d3d3' }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 211, 211, 0.05)'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                >
                                  <td className="py-3 px-4" style={{ color: '#1a1a1a' }}>{articulo.item_nombre}</td>
                                  <td className="py-3 px-4" style={{ color: '#1a1a1a', opacity: 0.7 }}>{articulo.modelo}</td>
                                  <td className="py-3 px-4 text-right font-medium" style={{ color: '#1a1a1a' }}>{articulo.cantidad}</td>
                                  {pedido.esPreliminar && 'precio_unitario' in articulo && (
                                    <td className="py-3 px-4 text-right font-medium" style={{ color: '#ff7100' }}>
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
                      <div className="bg-white rounded-lg border p-6 text-center" style={{ borderColor: '#d3d3d3' }}>
                        <p className="text-sm" style={{ color: '#1a1a1a', opacity: 0.7 }}>No se pudieron cargar los artículos</p>
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