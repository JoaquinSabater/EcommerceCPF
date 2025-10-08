'use client';

import { useState, useEffect } from 'react';

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

export default function ClienteMovimientos({ clienteId }: ClienteMovimientosProps) {
  const [movimientos, setMovimientos] = useState<MovimientoCuentaCorriente[]>([]);
  const [resumen, setResumen] = useState<ResumenCuentaCorriente | null>(null);
  const [cliente, setCliente] = useState<ClienteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (clienteId) {
      fetchMovimientos();
    }
  }, [clienteId]);

  const fetchMovimientos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const hoy = new Date();
      const unAnoAtras = new Date();
      unAnoAtras.setFullYear(hoy.getFullYear() - 1);
      
      const fechaDesde = unAnoAtras.toISOString().split('T')[0];
      const fechaHasta = hoy.toISOString().split('T')[0];
      
      const TOKEN = 'fe3493287c3a953cae08234baa2097ba896033989eb3f61fe6f6402ecbf465a7';
      
      const url = `https://cellphonefree.com.ar/accesorios/Sistema/scrphp/api/clientes/movimientos_cuenta_corriente.php?cliente_id=${clienteId}&fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}&token=${TOKEN}`;
      
      console.log('🔗 URL de petición:', url);
      
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            💰 Mi Cuenta Corriente
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Consulta tus movimientos de cuenta corriente
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-500 mb-2 sm:mb-0 sm:mr-3"></div>
            <span className="text-sm sm:text-base text-gray-600">Cargando movimientos...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            💰 Mi Cuenta Corriente
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Consulta tus movimientos de cuenta corriente
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start">
            <span className="text-red-500 text-xl sm:text-2xl mb-2 sm:mb-0 sm:mr-3">⚠️</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-medium text-sm sm:text-base">Error al cargar movimientos</h3>
              <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
              <button
                onClick={fetchMovimientos}
                className="mt-3 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded text-xs sm:text-sm font-medium w-full sm:w-auto"
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          💰 Mi Cuenta Corriente
        </h1>
        <p className="text-sm sm:text-base text-gray-600">
          {cliente ? `${cliente.razon_social}` : 'Consulta tus movimientos de cuenta corriente'}
        </p>
      </div>

      {/* Resumen - Cards responsivas */}
      {resumen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">Saldo Anterior</p>
                <p className="text-sm sm:text-lg font-bold text-gray-700 truncate">
                  {formatCurrency(resumen.saldo_anterior)}
                </p>
              </div>
              <span className="text-gray-500 text-lg sm:text-2xl ml-2 flex-shrink-0">📊</span>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-red-600 text-xs sm:text-sm font-medium truncate">Total Debe</p>
                <p className="text-sm sm:text-xl font-bold text-red-700 truncate">
                  {formatCurrency(resumen.total_debe)}
                </p>
              </div>
              <span className="text-red-500 text-lg sm:text-2xl ml-2 flex-shrink-0">📤</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-green-600 text-xs sm:text-sm font-medium truncate">Total Haber</p>
                <p className="text-sm sm:text-xl font-bold text-green-700 truncate">
                  {formatCurrency(resumen.total_haber)}
                </p>
              </div>
              <span className="text-green-500 text-lg sm:text-2xl ml-2 flex-shrink-0">📥</span>
            </div>
          </div>

          <div className={`${resumen.saldo_final >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-3 sm:p-4`}>
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className={`text-xs sm:text-sm font-medium truncate ${resumen.saldo_final >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  Saldo Final
                </p>
                <p className={`text-sm sm:text-xl font-bold truncate ${resumen.saldo_final >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  {formatCurrency(resumen.saldo_final)}
                </p>
              </div>
              <span className={`text-lg sm:text-2xl ml-2 flex-shrink-0 ${resumen.saldo_final >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                {resumen.saldo_final >= 0 ? '💰' : '⚠️'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Información del período */}
      {resumen && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="space-y-1">
            <p className="text-blue-800 font-medium text-xs sm:text-sm">
              📅 Período: {formatDate(resumen.fecha_desde)} - {formatDate(resumen.fecha_hasta)}
            </p>
            <p className="text-blue-600 text-xs sm:text-sm">
              Total de movimientos: {resumen.total_movimientos}
            </p>
          </div>
        </div>
      )}

      {/* Tabla/Cards de movimientos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            📋 Mis Movimientos
          </h2>
        </div>

        {/* Vista móvil - Cards */}
        <div className="block sm:hidden">
          {movimientos.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <div className="text-gray-500">
                <span className="text-3xl mb-3 block">📄</span>
                <p className="text-base font-medium">No hay movimientos</p>
                <p className="text-xs mt-1">
                  No se encontraron movimientos en el período consultado
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {movimientos.map((movimiento, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-xs text-gray-500">
                      {formatDate(movimiento.fecha)}
                    </div>
                    <div className={`text-sm font-bold ${
                      movimiento.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(movimiento.saldo)}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-900 mb-3 line-clamp-2">
                    {movimiento.detalle}
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <div className="flex space-x-4">
                      <span className={movimiento.debe ? 'text-red-600 font-medium' : 'text-gray-400'}>
                        Debe: {formatCurrency(movimiento.debe)}
                      </span>
                      <span className={movimiento.haber ? 'text-green-600 font-medium' : 'text-gray-400'}>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Detalle
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Debe
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Haber
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {movimientos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <span className="text-4xl mb-4 block">📄</span>
                      <p className="text-lg">No hay movimientos para mostrar</p>
                      <p className="text-sm">
                        No se encontraron movimientos en el período consultado
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                movimientos.map((movimiento, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(movimiento.fecha)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {movimiento.detalle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={movimiento.debe ? 'text-red-600 font-medium' : 'text-gray-400'}>
                        {formatCurrency(movimiento.debe)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={movimiento.haber ? 'text-green-600 font-medium' : 'text-gray-400'}>
                        {formatCurrency(movimiento.haber)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                      <span className={`font-medium ${
                        movimiento.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
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
          <div className="px-3 sm:px-6 py-2 sm:py-3 bg-gray-50 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500">
              Mostrando {movimientos.length} de {resumen.total_movimientos} movimientos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}