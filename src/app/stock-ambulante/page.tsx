'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CldImage } from 'next-cloudinary';

export const dynamic = 'force-dynamic';

interface ArticuloStockAmbulante {
  codigo_interno: string;
  descripcion: string;
  cantidad_disponible: number;
  precio_unitario_usd: number;
  categoria_principal_id: number;
  categoria_principal_nombre: string;
  tipo_cotizacion: string;
  cotizacion_aplicar: number;
  modelo: string;
  item_nombre: string;
  // Campos adicionales que obtendremos
  item_id?: number;
  foto_portada?: string;
  foto1_url?: string;
}

interface StockAmbulanteResponse {
  success: boolean;
  data: ArticuloStockAmbulante[];
  total_articulos: number;
  cotizacion_general: number;
  cotizacion_electronica: number;
}

interface IntencionCompra {
  id: number;
  cliente_id: number;
  cliente_nombre: string;
  usuario_id: number;
  codigo_interno: string;
  cantidad_solicitada: number;
  token_link: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

function StockAmbulanteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Obtener parámetros de la URL
  const token = searchParams.get('token');
  const clienteId = searchParams.get('cliente_id');
  const usuarioId = searchParams.get('usuario_id');
  
  const [articulos, setArticulos] = useState<ArticuloStockAmbulante[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [valorDolar, setValorDolar] = useState<number>(1400);
  const [selectedArticulo, setSelectedArticulo] = useState<ArticuloStockAmbulante | null>(null);
  const [carruselImages, setCarruselImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isCarruselOpen, setIsCarruselOpen] = useState(false);
  const [clienteNombre, setClienteNombre] = useState<string>('');
  const [cantidadesSeleccionadas, setCantidadesSeleccionadas] = useState<{[key: string]: number | undefined}>({});
  const [enviandoIntencion, setEnviandoIntencion] = useState<string | null>(null);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState<{codigo: string, mensaje: string} | null>(null);
  const [intencionesPrevias, setIntencionesPrevias] = useState<{[key: string]: IntencionCompra}>({});
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    // Solo validar que tengamos usuario_id (el token del link es opcional, solo para registro)
    if (!usuarioId) {
      setError('Falta el parámetro usuario_id en la URL');
      setIsLoading(false);
      return;
    }
    
    fetchValorDolar();
    fetchStockAmbulante();
    fetchIntencionesPrevias();
    
    // Obtener información del cliente si está disponible
    if (clienteId) {
      fetchClienteInfo();
    }
  }, [usuarioId, clienteId]);

  const fetchValorDolar = async () => {
    try {
      const response = await fetch('/api/dolar');
      const data = await response.json();
      if (data.dolar) {
        setValorDolar(data.dolar);
        console.log('💵 Valor del dólar obtenido:', data.dolar);
      }
    } catch (error) {
      console.error('Error al obtener el dólar:', error);
      // Mantener valor por defecto
    }
  };

  const fetchClienteInfo = async () => {
    if (!clienteId) return;
    
    try {
      console.log('🔍 Obteniendo info del cliente:', clienteId);
      const response = await fetch(`/api/stock-ambulante/cliente?cliente_id=${clienteId}`);
      const data = await response.json();
      
      console.log('📦 Respuesta API cliente:', data);
      
      if (data.success && data.data) {
        // Usar razon_social si existe, sino el nombre
        const nombre = data.data.razon_social || data.data.nombre || 'Cliente';
        setClienteNombre(nombre);
        console.log('👤 Cliente nombre establecido:', nombre);
      } else {
        console.log('❌ No se pudo obtener el cliente:', data);
      }
    } catch (error) {
      console.error('Error al obtener info del cliente:', error);
      // No es crítico, continuar sin el nombre
    }
  };

  const fetchIntencionesPrevias = async () => {
    if (!clienteId) return;
    
    try {
      console.log('🔍 Obteniendo intenciones previas del cliente:', clienteId);
      const response = await fetch(`/api/stock-ambulante/intencion-compra?cliente_id=${clienteId}`);
      const data = await response.json();
      
      console.log('📦 Respuesta API intenciones:', data);
      
      if (data.success && data.data && Array.isArray(data.data)) {
        // Crear un mapa de código_interno -> intención
        const intencionesMap: {[key: string]: IntencionCompra} = {};
        const cantidadesMap: {[key: string]: number} = {};
        
        data.data.forEach((intencion: IntencionCompra) => {
          intencionesMap[intencion.codigo_interno] = intencion;
          cantidadesMap[intencion.codigo_interno] = intencion.cantidad_solicitada;
        });
        
        setIntencionesPrevias(intencionesMap);
        setCantidadesSeleccionadas(cantidadesMap);
        
        console.log('✅ Intenciones previas cargadas:', Object.keys(intencionesMap).length);
      }
    } catch (error) {
      console.error('Error al obtener intenciones previas:', error);
      // No es crítico, continuar sin las intenciones previas
    }
  };

  const fetchStockAmbulante = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar que tengamos el usuario_id de la URL
      if (!usuarioId) {
        throw new Error('usuario_id es requerido en la URL');
      }

      // 1. Obtener datos del stock ambulante a través de nuestro API route
      // Esto evita problemas de Mixed Content (HTTP/HTTPS) y CORS
      const stockResponse = await fetch(
        `/api/stock-ambulante/exportar?usuario_id=${usuarioId}`
      );

      if (!stockResponse.ok) {
        throw new Error('Error al obtener el stock ambulante');
      }

      const stockData: StockAmbulanteResponse = await stockResponse.json();

      if (!stockData.success || !stockData.data) {
        throw new Error('Respuesta inválida de la API');
      }

      console.log('📦 Stock ambulante recibido:', stockData.data.length, 'artículos');
      console.log('👤 Usuario ID:', usuarioId);
      console.log('👥 Cliente ID:', clienteId);
      console.log('🔑 Token del link (solo para registro):', token ? 'Presente' : 'No presente');

      // 2. Obtener item_id e imágenes para cada artículo
      const articulosConImagenes = await Promise.all(
        stockData.data.map(async (articulo) => {
          try {
            // Buscar en la tabla articulos usando codigo_interno
            const articuloResponse = await fetch(
              `/api/stock-ambulante/articulo?codigo=${encodeURIComponent(articulo.codigo_interno)}`
            );

            if (articuloResponse.ok) {
              const articuloData = await articuloResponse.json();
              
              if (articuloData.success && articuloData.data) {
                return {
                  ...articulo,
                  item_id: articuloData.data.item_id,
                  foto_portada: articuloData.data.foto_portada,
                  foto1_url: articuloData.data.foto1_url
                };
              }
            }

            // Si no se encuentra, retornar sin imágenes
            return articulo;
          } catch (error) {
            console.error(`Error obteniendo imágenes para ${articulo.codigo_interno}:`, error);
            return articulo;
          }
        })
      );

      setArticulos(articulosConImagenes);
    } catch (error) {
      console.error('Error al cargar stock ambulante:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido al cargar el stock';
      setError(errorMessage);
      
      // Log adicional para debugging
      console.error('Detalles del error:', {
        error,
        usuarioId,
        clienteId,
        hasToken: !!token
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = async (articulo: ArticuloStockAmbulante) => {
    if (!articulo.item_id) return;

    try {
      // Obtener todas las imágenes del item_detalle
      const response = await fetch(`/api/stock-ambulante/imagenes?item_id=${articulo.item_id}`);
      const data = await response.json();

      if (data.success && data.imagenes && data.imagenes.length > 0) {
        setCarruselImages(data.imagenes);
        setSelectedArticulo(articulo);
        setCurrentImageIndex(0);
        setIsCarruselOpen(true);
      } else {
        // Si no hay imágenes, mostrar una notificación
        alert('No hay imágenes disponibles para este producto');
      }
    } catch (error) {
      console.error('Error al obtener imágenes:', error);
    }
  };

  const handleCloseCarrusel = () => {
    setIsCarruselOpen(false);
    setSelectedArticulo(null);
    setCarruselImages([]);
    setCurrentImageIndex(0);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? carruselImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === carruselImages.length - 1 ? 0 : prev + 1
    );
  };

  const getImageSrc = (articulo: ArticuloStockAmbulante) => {
    return articulo.foto_portada || articulo.foto1_url;
  };

  const calcularPrecioARS = (articulo: ArticuloStockAmbulante) => {
    // Si es categoría "Accesorios y Repuestos", usar el dólar de la API
    const cotizacion = articulo.categoria_principal_nombre === 'Accesorios y Repuestos' 
      ? valorDolar 
      : articulo.cotizacion_aplicar;
    return (articulo.precio_unitario_usd * cotizacion).toFixed(2);
  };

  const getCotizacionDisplay = (articulo: ArticuloStockAmbulante) => {
    return articulo.categoria_principal_nombre === 'Accesorios y Repuestos' 
      ? valorDolar 
      : articulo.cotizacion_aplicar;
  };

  // Filtrar artículos basado en el término de búsqueda
  const articulosFiltrados = articulos.filter(articulo => {
    if (!searchTerm.trim()) return true;
    
    const termino = searchTerm.toLowerCase();
    return (
      articulo.descripcion.toLowerCase().includes(termino) ||
      articulo.modelo.toLowerCase().includes(termino) ||
      articulo.codigo_interno.toLowerCase().includes(termino) ||
      articulo.item_nombre.toLowerCase().includes(termino)
    );
  });

  const handleCantidadChange = (codigoInterno: string, cantidad: number | undefined) => {
    setCantidadesSeleccionadas(prev => ({
      ...prev,
      [codigoInterno]: cantidad
    }));
  };

  const handleEnviarIntencion = async (articulo: ArticuloStockAmbulante) => {
    const cantidad = cantidadesSeleccionadas[articulo.codigo_interno] || 0;

    if (cantidad <= 0) {
      alert('Por favor, ingresa una cantidad válida');
      return;
    }

    if (cantidad > articulo.cantidad_disponible) {
      alert(`La cantidad solicitada (${cantidad}) supera el stock disponible (${articulo.cantidad_disponible})`);
      return;
    }

    if (!clienteId) {
      alert('No se pudo identificar el cliente');
      return;
    }

    setEnviandoIntencion(articulo.codigo_interno);

    try {
      const response = await fetch('/api/stock-ambulante/intencion-compra', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cliente_id: clienteId,
          cliente_nombre: clienteNombre,
          usuario_id: usuarioId,
          codigo_interno: articulo.codigo_interno,
          cantidad_solicitada: cantidad,
          token_link: token,
        })
      });

      const data = await response.json();

      if (data.success) {
        setMensajeConfirmacion({
          codigo: articulo.codigo_interno,
          mensaje: '¡Intención de compra enviada! El vendedor será notificado.'
        });
        
        // Actualizar las intenciones previas con la nueva
        setIntencionesPrevias(prev => ({
          ...prev,
          [articulo.codigo_interno]: {
            id: data.id || 0,
            cliente_id: parseInt(clienteId),
            cliente_nombre: clienteNombre,
            usuario_id: parseInt(usuarioId || '0'),
            codigo_interno: articulo.codigo_interno,
            cantidad_solicitada: cantidad,
            token_link: token || '',
            fecha_creacion: new Date().toISOString(),
            fecha_actualizacion: new Date().toISOString()
          }
        }));
        
        // Ocultar mensaje después de 3 segundos
        setTimeout(() => {
          setMensajeConfirmacion(null);
        }, 3000);
      } else {
        alert('Error al enviar la intención de compra: ' + data.error);
      }
    } catch (error) {
      console.error('Error al enviar intención:', error);
      alert('Error al enviar la intención de compra');
    } finally {
      setEnviandoIntencion(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Stock Ambulante</h1>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
            <p className="text-gray-600">Cargando stock ambulante...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Stock Ambulante</h1>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center text-red-600">
            <p className="font-semibold">Error al cargar el stock</p>
            <p className="text-sm mt-1">{error}</p>
            <button
              onClick={fetchStockAmbulante}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              {clienteNombre ? (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    👋 ¡Hola, {clienteNombre}!
                  </h1>
                  <p className="text-orange-100 text-base md:text-lg">
                    🚚 Estamos por visitarte. Estos son los productos que llevamos en nuestra camioneta
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Stock Ambulante Disponible
                  </h1>
                  <p className="text-orange-100 text-base md:text-lg">
                    🚚 Productos disponibles para entrega inmediata
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Explicación de Intención de Compra */}
      <div className="p-4 pt-2">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold text-blue-800 mb-1">
                💡 ¿Qué es una Intención de Compra?
              </h3>
              <p className="text-xs md:text-sm text-blue-700">
                Puedes <strong>reservar productos</strong> indicando la cantidad que te interesa. 
                Esto notificará al vendedor sobre tu interés, pero <strong>no modifica el stock disponible</strong>. 
                El vendedor confirmará la disponibilidad cuando llegue.
              </p>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por descripción, modelo o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-11 pr-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              {articulosFiltrados.length} resultado{articulosFiltrados.length !== 1 ? 's' : ''} encontrado{articulosFiltrados.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="p-4 pt-0">"
        {articulos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No hay artículos disponibles en el stock ambulante</p>
          </div>
        ) : articulosFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-600">No se encontraron artículos que coincidan con tu búsqueda</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Vista Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Imagen
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Modelo
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Stock Disponible
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Precio ARS
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Intención de Compra
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articulosFiltrados.map((articulo, index) => (
                    <tr 
                      key={`${articulo.codigo_interno}-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div 
                          className="w-16 h-16 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleItemClick(articulo)}
                        >
                          {getImageSrc(articulo) ? (
                            <CldImage
                              src={getImageSrc(articulo)!}
                              alt={articulo.descripcion}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover rounded-lg"
                              quality="auto:eco"
                              format="auto"
                              loading="lazy"
                              sizes="64px"
                            />
                          ) : (
                            <img
                              src="/not-image.png"
                              alt="Sin imagen"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">
                            {articulo.descripcion}
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            {articulo.item_nombre}
                          </span>
                          <span className="text-xs text-gray-400 mt-0.5">
                            Código: {articulo.codigo_interno}
                          </span>
                          {intencionesPrevias[articulo.codigo_interno] && (
                            <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-700">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Reservado previamente
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-gray-700">
                          {articulo.modelo}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                          articulo.cantidad_disponible <= 0 
                            ? 'bg-red-50 text-red-700' 
                            : articulo.cantidad_disponible <= 10 
                            ? 'bg-yellow-50 text-yellow-700' 
                            : 'bg-green-50 text-green-700'
                        }`}>
                          {articulo.cantidad_disponible}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-semibold text-orange-600">
                            ${calcularPrecioARS(articulo)}
                          </span>
                          <span className="text-xs text-gray-500">
                            (${getCotizacionDisplay(articulo).toFixed(2)})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 justify-center">
                          {mensajeConfirmacion?.codigo === articulo.codigo_interno ? (
                            <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              <span>Enviado</span>
                            </div>
                          ) : (
                            <>
                              <input
                                type="number"
                                max={articulo.cantidad_disponible}
                                value={cantidadesSeleccionadas[articulo.codigo_interno] ?? ''}
                                onChange={(e) => handleCantidadChange(articulo.codigo_interno, e.target.value === '' ? undefined : parseInt(e.target.value))}
                                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="0"
                              />
                              <button
                                onClick={() => handleEnviarIntencion(articulo)}
                                disabled={enviandoIntencion === articulo.codigo_interno || !cantidadesSeleccionadas[articulo.codigo_interno]}
                                className="px-3 py-1 bg-orange-600 text-white text-xs font-medium rounded hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                              >
                                {enviandoIntencion === articulo.codigo_interno ? 'Enviando...' : 'Reservar'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista Mobile */}
            <div className="md:hidden divide-y divide-gray-200">
              {articulosFiltrados.map((articulo, index) => (
                <div
                  key={`${articulo.codigo_interno}-${index}`}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleItemClick(articulo)}
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 flex-shrink-0">
                      {getImageSrc(articulo) ? (
                        <CldImage
                          src={getImageSrc(articulo)!}
                          alt={articulo.descripcion}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover rounded-lg"
                          quality="auto:eco"
                          format="auto"
                          loading="lazy"
                          sizes="80px"
                        />
                      ) : (
                        <img
                          src="/not-image.png"
                          alt="Sin imagen"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">
                        {articulo.descripcion}
                      </h3>
                      
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold">{articulo.modelo}</span>
                        </p>
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                            articulo.cantidad_disponible <= 0 
                              ? 'bg-red-50 text-red-700' 
                              : articulo.cantidad_disponible <= 10 
                              ? 'bg-yellow-50 text-yellow-700' 
                              : 'bg-green-50 text-green-700'
                          }`}>
                            Stock: {articulo.cantidad_disponible}
                          </span>
                        </div>

                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-sm font-semibold text-orange-600">
                            ${calcularPrecioARS(articulo)}
                          </span>
                        </div>

                        <p className="text-xs text-gray-400">
                          Código: {articulo.codigo_interno}
                        </p>
                        
                        {intencionesPrevias[articulo.codigo_interno] && (
                          <span className="inline-flex items-center gap-1 mt-1 text-xs font-medium text-blue-700">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Reservado previamente
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Controles de Intención de Compra - Mobile */}
                  <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                    {mensajeConfirmacion?.codigo === articulo.codigo_interno ? (
                      <div className="flex items-center justify-center gap-2 text-green-600 text-sm font-medium py-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>¡Intención enviada!</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-medium text-gray-700 whitespace-nowrap">
                          Reservar:
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={articulo.cantidad_disponible}
                          value={cantidadesSeleccionadas[articulo.codigo_interno] ?? ''}
                          onChange={(e) => handleCantidadChange(articulo.codigo_interno, e.target.value === '' ? undefined : parseInt(e.target.value))}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                          placeholder="Cantidad"
                        />
                        <button
                          onClick={() => handleEnviarIntencion(articulo)}
                          disabled={enviandoIntencion === articulo.codigo_interno || !cantidadesSeleccionadas[articulo.codigo_interno]}
                          className="px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                        >
                          {enviandoIntencion === articulo.codigo_interno ? '...' : '📋 Reservar'}
                        </button>
                      </div>
                    )}
                  </div>                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal de imágenes */}
      {isCarruselOpen && selectedArticulo && (
        <div 
          className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseCarrusel}
        >
          <div 
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón cerrar mejorado */}
            <button
              onClick={handleCloseCarrusel}
              className="absolute -top-2 -right-2 md:-top-12 md:right-0 bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-all z-10 group"
              aria-label="Cerrar"
            >
              <svg className="w-6 h-6 text-gray-800 group-hover:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Contenedor de imagen */}
            <div className="relative bg-white rounded-lg p-6 shadow-2xl">
              {/* Información del producto */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">{selectedArticulo.descripcion}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Modelo: <span className="font-medium">{selectedArticulo.modelo}</span>
                </p>
              </div>

              {/* Imagen principal */}
              <div className="relative bg-white rounded-lg overflow-hidden" style={{ height: '400px' }}>
                {carruselImages.length > 0 ? (
                  <CldImage
                    src={carruselImages[currentImageIndex]}
                    alt={`${selectedArticulo.descripcion} - Imagen ${currentImageIndex + 1}`}
                    fill
                    className="object-contain"
                    quality="auto:good"
                    format="auto"
                    sizes="672px"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No hay imágenes disponibles</p>
                  </div>
                )}

                {/* Controles del carrusel */}
                {carruselImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-lg transition-all"
                    >
                      <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>

              {/* Indicadores de imagen */}
              {carruselImages.length > 1 && (
                <div className="mt-4">
                  <div className="flex justify-center gap-2">
                    {carruselImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-orange-600 w-8' 
                            : 'bg-gray-300 w-2 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Imagen {currentImageIndex + 1} de {carruselImages.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StockAmbulantePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Stock Ambulante</h1>
          </div>
        </div>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mb-2"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <StockAmbulanteContent />
    </Suspense>
  );
}
