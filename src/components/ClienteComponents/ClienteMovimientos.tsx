'use client';

import { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Filter } from 'lucide-react';

interface MovimientoCuentaCorriente {
  fecha: string;
  detalle: string;
  debe: number | null;
  haber: number | null;
  saldo: number;
}

interface ResumenCuentaCorriente {
  saldo_anterior: number;
  saldo_final: number;
  total_debe: number;
  total_haber: number;
  total_movimientos: number;
  fecha_desde: string;
  fecha_hasta: string;
}

interface ClienteInfo {
  id: number;
  razon_social: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    cliente: ClienteInfo;
    movimientos: MovimientoCuentaCorriente[];
    resumen: ResumenCuentaCorriente;
  };
  message: string;
}

interface ClienteMovimientosProps {
  clienteId: number;
}

// ✅ Períodos predefinidos
const PERIODOS_PREDEFINIDOS = [
  { label: 'Último mes', meses: 1 },
  { label: 'Últimos 3 meses', meses: 3 },
  { label: 'Últimos 6 meses', meses: 6 },
  { label: 'Último año', meses: 12 },
  { label: 'Últimos 2 años', meses: 24 },
  { label: 'Período personalizado', meses: 0 }
];

export default function ClienteMovimientos({ clienteId }: ClienteMovimientosProps) {
  const [movimientos, setMovimientos] = useState<MovimientoCuentaCorriente[]>([]);
  const [resumen, setResumen] = useState<ResumenCuentaCorriente | null>(null);
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Estados para el selector de período
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(12); // Último año por defecto
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  // ✅ Inicializar fechas por defecto (último año)
  useEffect(() => {
    const hoy = new Date();
    const unAnoAtras = new Date();
    unAnoAtras.setFullYear(hoy.getFullYear() - 1);
    
    setFechaHasta(hoy.toISOString().split('T')[0]);
    setFechaDesde(unAnoAtras.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (clienteId && fechaDesde && fechaHasta) {
      fetchMovimientos();
    }
  }, [clienteId, fechaDesde, fechaHasta]);

  // ✅ Manejar cambio de período predefinido
  const handlePeriodoChange = (meses: number) => {
    setPeriodoSeleccionado(meses);
    
    if (meses === 0) {
      // Período personalizado - no cambiar fechas
      return;
    }
    
    const hoy = new Date();
    const fechaInicio = new Date();
    fechaInicio.setMonth(hoy.getMonth() - meses);
    
    setFechaHasta(hoy.toISOString().split('T')[0]);
    setFechaDesde(fechaInicio.toISOString().split('T')[0]);
  };

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ Obtener token desde variable de entorno
      const TOKEN = process.env.NEXT_PUBLIC_CUENTA_CORRIENTE_API_TOKEN;
      
      if (!TOKEN) {
        throw new Error('Token de API no configurado');
      }
      
      const url = `https://cellphonefree.com.ar/accesorios/Sistema/scrphp/api/clientes/movimientos_cuenta_corriente.php?cliente_id=${clienteId}&fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}&token=${TOKEN}`;
            
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse = await response.json();
      
      console.log('📥 Respuesta completa:', data);
      
      if (data.success) {
        setMovimientos(data.data.movimientos || []);
        setResumen(data.data.resumen);
        setCliente(data.data.cliente);
      } else {
        setError(data.message || 'Error al cargar movimientos');
        setMovimientos([]);
        setResumen(null);
        setCliente(null);
      }
    } catch (error) {
      console.error('💥 Error obteniendo movimientos:', error);
      setError(`Error de conexión: ${error instanceof Error ? error.message : 'Desconocido'}`);
      setMovimientos([]);
      setResumen(null);
      setCliente(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-AR');
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            💰 Mi Cuenta Corriente
          </h1>
          <p className="text-sm sm:text-base" style={{ color: '#1a1a1a', opacity: 0.7 }}>
            Consulta tus movimientos de cuenta corriente
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8" style={{ borderColor: '#d3d3d3' }}>
          <div className="flex flex-col sm:flex-row items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 mb-2 sm:mb-0 sm:mr-3" style={{ borderColor: '#ff7100' }}></div>
            <span className="text-sm sm:text-base" style={{ color: '#1a1a1a', opacity: 0.7 }}>Cargando movimientos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            💰 Mi Cuenta Corriente
          </h1>
          <p className="text-sm sm:text-base" style={{ color: '#1a1a1a', opacity: 0.7 }}>
            Consulta tus movimientos de cuenta corriente
          </p>
        </div>

        <div className="rounded-lg p-4 sm:p-6" style={{ 
          backgroundColor: 'rgba(255, 1, 86, 0.1)', 
          borderColor: '#ff0156',
          border: '1px solid'
        }}>
          <div className="flex flex-col sm:flex-row items-start">
            <span className="text-xl sm:text-2xl mb-2 sm:mb-0 sm:mr-3" style={{ color: '#ff0156' }}>⚠️</span>
            <div className="flex-1">
              <h3 className="font-medium text-sm sm:text-base" style={{ color: '#1a1a1a' }}>Error al cargar movimientos</h3>
              <p className="text-xs sm:text-sm mt-1" style={{ color: '#1a1a1a', opacity: 0.7 }}>{error}</p>
              <button
                onClick={fetchMovimientos}
                className="mt-3 px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium w-full sm:w-auto transition-colors"
                style={{ 
                  backgroundColor: '#ff0156',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e0014d'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ff0156'}
              >
                🔄 Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
          💰 Mi Cuenta Corriente
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#1a1a1a', opacity: 0.7 }}>
          {cliente ? `${cliente.razon_social}` : 'Consulta tus movimientos de cuenta corriente'}
        </p>
      </div>

      {/* ✅ SELECTOR DE PERÍODO */}
      <div className="mb-6 space-y-4">
        {/* Botón para mostrar filtros en móvil */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="md:hidden flex items-center gap-2 px-3 py-2 text-sm border rounded-lg w-full justify-center"
          style={{ 
            color: '#1a1a1a',
            borderColor: '#d3d3d3'
          }}
        >
          <Filter className="h-4 w-4" />
          <span>Filtrar período</span>
          <Calendar className="h-4 w-4" />
        </button>

        {/* Panel de filtros */}
        <div className={`space-y-4 ${mostrarFiltros ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg shadow-sm border p-4" style={{ borderColor: '#d3d3d3' }}>
            <h3 className="font-semibold mb-3 text-sm" style={{ color: '#1a1a1a' }}>
              📅 Seleccionar Período
            </h3>
            
            {/* Períodos predefinidos */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
              {PERIODOS_PREDEFINIDOS.map((periodo) => (
                <button
                  key={periodo.meses}
                  onClick={() => handlePeriodoChange(periodo.meses)}
                  className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    periodoSeleccionado === periodo.meses 
                      ? 'text-white' 
                      : 'border'
                  }`}
                  style={{
                    backgroundColor: periodoSeleccionado === periodo.meses ? '#ff7100' : 'transparent',
                    borderColor: periodoSeleccionado === periodo.meses ? '#ff7100' : '#d3d3d3',
                    color: periodoSeleccionado === periodo.meses ? 'white' : '#1a1a1a'
                  }}
                >
                  {periodo.label}
                </button>
              ))}
            </div>

            {/* Fechas personalizadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1a1a1a' }}>
                  Fecha desde:
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => {
                    setFechaDesde(e.target.value);
                    setPeriodoSeleccionado(0); // Cambiar a personalizado
                  }}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: '#d3d3d3',
                    color: '#1a1a1a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff7100'}
                  onBlur={(e) => e.target.style.borderColor = '#d3d3d3'}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#1a1a1a' }}>
                  Fecha hasta:
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => {
                    setFechaHasta(e.target.value);
                    setPeriodoSeleccionado(0); // Cambiar a personalizado
                  }}
                  className="w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                  style={{ 
                    borderColor: '#d3d3d3',
                    color: '#1a1a1a'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#ff7100'}
                  onBlur={(e) => e.target.style.borderColor = '#d3d3d3'}
                />
              </div>
            </div>

            {/* Botón actualizar */}
            <div className="mt-4 flex justify-end">
              <button
                onClick={fetchMovimientos}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: '#ff7100',
                  color: 'white'
                }}
                onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#e6650d')}
                onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#ff7100')}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen - Cards responsivas */}
      {resumen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white border rounded-lg p-3 sm:p-4" style={{ borderColor: '#d3d3d3' }}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: '#1a1a1a', opacity: 0.7 }}>Saldo Anterior</p>
                <p className="text-sm sm:text-lg font-bold truncate" style={{ color: '#1a1a1a' }}>
                  {formatCurrency(resumen.saldo_anterior)}
                </p>
              </div>
              <span className="text-lg sm:text-2xl ml-2 flex-shrink-0" style={{ color: '#d3d3d3' }}>📊</span>
            </div>
          </div>

          <div className="border rounded-lg p-3 sm:p-4" style={{ 
            backgroundColor: 'rgba(255, 1, 86, 0.1)', 
            borderColor: '#ff0156' 
          }}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: '#ff0156' }}>Total Debe</p>
                <p className="text-sm sm:text-xl font-bold truncate" style={{ color: '#ff0156' }}>
                  {formatCurrency(resumen.total_debe)}
                </p>
              </div>
              <span className="text-lg sm:text-2xl ml-2 flex-shrink-0" style={{ color: '#ff0156' }}>📤</span>
            </div>
          </div>

          <div className="border rounded-lg p-3 sm:p-4" style={{ 
            backgroundColor: 'rgba(255, 113, 0, 0.1)', 
            borderColor: '#ff7100' 
          }}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium truncate" style={{ color: '#ff7100' }}>Total Haber</p>
                <p className="text-sm sm:text-xl font-bold truncate" style={{ color: '#ff7100' }}>
                  {formatCurrency(resumen.total_haber)}
                </p>
              </div>
              <span className="text-lg sm:text-2xl ml-2 flex-shrink-0" style={{ color: '#ff7100' }}>📥</span>
            </div>
          </div>

          <div className={`border rounded-lg p-3 sm:p-4`} style={{
            backgroundColor: resumen.saldo_final >= 0 
              ? 'rgba(255, 113, 0, 0.1)' 
              : 'rgba(255, 1, 86, 0.1)',
            borderColor: resumen.saldo_final >= 0 ? '#ff7100' : '#ff0156'
          }}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium truncate" style={{
                  color: resumen.saldo_final >= 0 ? '#ff7100' : '#ff0156'
                }}>
                  Saldo Final
                </p>
                <p className="text-sm sm:text-xl font-bold truncate" style={{
                  color: resumen.saldo_final >= 0 ? '#ff7100' : '#ff0156'
                }}>
                  {formatCurrency(resumen.saldo_final)}
                </p>
              </div>
              <span className="text-lg sm:text-2xl ml-2 flex-shrink-0" style={{
                color: resumen.saldo_final >= 0 ? '#ff7100' : '#ff0156'
              }}>
                {resumen.saldo_final >= 0 ? '💰' : '⚠️'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Información del período */}
      {resumen && (
        <div className="border rounded-lg p-3 sm:p-4 mb-4 sm:mb-6" style={{ 
          backgroundColor: 'rgba(255, 113, 0, 0.1)', 
          borderColor: '#ff7100' 
        }}>
          <div className="space-y-1">
            <p className="font-medium text-xs sm:text-sm" style={{ color: '#1a1a1a' }}>
              📅 Período: {formatDate(resumen.fecha_desde)} - {formatDate(resumen.fecha_hasta)}
            </p>
            <p className="text-xs sm:text-sm" style={{ color: '#1a1a1a', opacity: 0.7 }}>
              Total de movimientos: {resumen.total_movimientos}
            </p>
          </div>
        </div>
      )}

      {/* Tabla/Cards de movimientos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ borderColor: '#d3d3d3' }}>
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b" style={{ borderColor: '#d3d3d3' }}>
          <h2 className="text-base sm:text-lg font-semibold" style={{ color: '#1a1a1a' }}>
            📋 Mis Movimientos
          </h2>
        </div>

        {/* Vista móvil - Cards */}
        <div className="block sm:hidden">
          {movimientos.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div style={{ color: '#d3d3d3' }}>
                <span className="text-3xl mb-3 block">📄</span>
                <p className="text-base font-medium" style={{ color: '#1a1a1a' }}>No hay movimientos</p>
                <p className="text-xs mt-1" style={{ color: '#1a1a1a', opacity: 0.7 }}>
                  No se encontraron movimientos en el período consultado
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: '#d3d3d3' }}>
              {movimientos.map((movimiento, index) => (
                <div key={index} className="p-4 transition-colors" 
                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 211, 211, 0.05)'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs" style={{ color: '#1a1a1a', opacity: 0.7 }}>
                      {formatDate(movimiento.fecha)}
                    </div>
                    <div className={`text-sm font-bold`} style={{
                      color: movimiento.saldo >= 0 ? '#ff7100' : '#ff0156'
                    }}>
                      {formatCurrency(movimiento.saldo)}
                    </div>
                  </div>
                  
                  <div className="text-sm mb-3 line-clamp-2" style={{ color: '#1a1a1a' }}>
                    {movimiento.detalle}
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <div className="flex space-x-4">
                      <span style={{ 
                        color: movimiento.debe ? '#ff0156' : '#d3d3d3',
                        fontWeight: movimiento.debe ? 'bold' : 'normal'
                      }}>
                        Debe: {formatCurrency(movimiento.debe)}
                      </span>
                      <span style={{ 
                        color: movimiento.haber ? '#ff7100' : '#d3d3d3',
                        fontWeight: movimiento.haber ? 'bold' : 'normal'
                      }}>
                        Haber: {formatCurrency(movimiento.haber)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vista desktop - Tabla */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y" style={{ borderColor: '#d3d3d3' }}>
            <thead style={{ backgroundColor: 'rgba(211, 211, 211, 0.1)' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1a1a1a' }}>
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: '#1a1a1a' }}>
                  Detalle
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#1a1a1a' }}>
                  Debe
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#1a1a1a' }}>
                  Haber
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: '#1a1a1a' }}>
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y" style={{ borderColor: '#d3d3d3' }}>
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div style={{ color: '#d3d3d3' }}>
                      <span className="text-4xl mb-4 block">📄</span>
                      <p className="text-lg" style={{ color: '#1a1a1a' }}>No hay movimientos para mostrar</p>
                      <p className="text-sm" style={{ color: '#1a1a1a', opacity: 0.7 }}>
                        No se encontraron movimientos en el período consultado
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                movimientos.map((movimiento, index) => (
                  <tr key={index} className="transition-colors"
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(211, 211, 211, 0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: '#1a1a1a' }}>
                      {formatDate(movimiento.fecha)}
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: '#1a1a1a' }}>
                      {movimiento.detalle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span style={{ 
                        color: movimiento.debe ? '#ff0156' : '#d3d3d3',
                        fontWeight: movimiento.debe ? 'bold' : 'normal'
                      }}>
                        {formatCurrency(movimiento.debe)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span style={{ 
                        color: movimiento.haber ? '#ff7100' : '#d3d3d3',
                        fontWeight: movimiento.haber ? 'bold' : 'normal'
                      }}>
                        {formatCurrency(movimiento.haber)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className="font-medium" style={{
                        color: movimiento.saldo >= 0 ? '#ff7100' : '#ff0156'
                      }}>
                        {formatCurrency(movimiento.saldo)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {resumen && (
          <div className="px-3 sm:px-6 py-2 sm:py-3 border-t" style={{ 
            backgroundColor: 'rgba(211, 211, 211, 0.05)', 
            borderColor: '#d3d3d3' 
          }}>
            <p className="text-xs sm:text-sm" style={{ color: '#1a1a1a', opacity: 0.7 }}>
              Mostrando {movimientos.length} de {resumen.total_movimientos} movimientos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}