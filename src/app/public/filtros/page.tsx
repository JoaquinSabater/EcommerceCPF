'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronLeftIcon, FunnelIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import { createPortal } from 'react-dom';
import FiltrosResults from '@/components/Filtros/FiltrosResults';
import DetalleProductoModal from '@/components/Products/DetalleProductoModal';
export const dynamic = 'force-dynamic';

interface Marca {
  id: number;
  nombre: string;
}

interface Modelo {
  modelo: string;
  marca_id: number;
  marca_nombre: string;
}

interface ProductoFiltrado {
  item_id: number;
  item: string;
  codigo_interno: string;
  modelo: string;
  marca_nombre: string;
  precio_venta: number;
  stock_real: number;
  foto1_url?: string;
  foto_portada?: string;
  marca_modelo_completo: string;
}

export default function FiltrosPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ✅ NUEVO: Obtener query parameter de búsqueda
  const initialSearch = searchParams.get('search') || '';
  
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [modelos, setModelos] = useState<Modelo[]>([]);
  const [productos, setProductos] = useState<ProductoFiltrado[]>([]);
  const [selectedMarcas, setSelectedMarcas] = useState<number[]>([]);
  const [selectedModelos, setSelectedModelos] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingModelos, setIsLoadingModelos] = useState(false);
  const [isLoadingProductos, setIsLoadingProductos] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // ✅ ACTUALIZADO: Inicializar con búsqueda del URL
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [searchResults, setSearchResults] = useState<ProductoFiltrado[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'filters' | 'search'>(initialSearch ? 'search' : 'filters');
  
  // Estados para el modal
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para controlar si las secciones están abiertas/cerradas
  const [marcasOpen, setMarcasOpen] = useState(false);
  const [modelosOpen, setModelosOpen] = useState(false);

  // Referencias para detectar clicks afuera
  const marcasRef = useRef<HTMLDivElement>(null);
  const modelosRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ NUEVO: Efecto para procesar búsqueda inicial del URL
  useEffect(() => {
    if (initialSearch && initialSearch.length >= 3) {
      console.log(`🔗 Búsqueda inicial desde URL: "${initialSearch}"`);
      setSearchQuery(initialSearch);
      setActiveTab('search');
      // Realizar búsqueda automáticamente
      performSearch(initialSearch);
    }
  }, [initialSearch]);

  // Hook para cerrar dropdowns al hacer click afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (marcasRef.current && !marcasRef.current.contains(event.target as Node)) {
        setMarcasOpen(false);
      }
      
      if (modelosRef.current && !modelosRef.current.contains(event.target as Node)) {
        setModelosOpen(false);
      }
    };

    if (marcasOpen || modelosOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [marcasOpen, modelosOpen]);

  // ✅ ACTUALIZADO: Efecto para búsqueda con debounce - solo si no es búsqueda inicial
  useEffect(() => {
    // No hacer debounce para la búsqueda inicial del URL
    if (searchQuery === initialSearch) return;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    searchTimeoutRef.current = setTimeout(async () => {
      await performSearch(searchQuery.trim());
    }, 600);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, initialSearch]);

  // Carga rápida de marcas
  useEffect(() => {
    const fetchMarcas = async () => {
      try {
        const response = await fetch('/api/filtros/marcas');
        const data = await response.json();
        
        if (data.success) {
          setMarcas(data.marcas);
        } else {
          console.error('Error al cargar marcas:', data.error);
        }
      } catch (error) {
        console.error('Error al cargar marcas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarcas();
  }, []);

  // Carga rápida de modelos
  useEffect(() => {
    const fetchModelos = async () => {
      if (selectedMarcas.length === 0) {
        setModelos([]);
        setSelectedModelos([]);
        return;
      }

      setIsLoadingModelos(true);
      try {
        const marcasIds = selectedMarcas.join(',');
        const response = await fetch(`/api/filtros/modelos?marcas=${marcasIds}`);
        const data = await response.json();
        
        if (data.success) {
          setModelos(data.modelos);
          setSelectedModelos(prev => 
            prev.filter(modelo => 
              data.modelos.some((m: Modelo) => m.modelo === modelo)
            )
          );
        } else {
          console.error('Error al cargar modelos:', data.error);
          setModelos([]);
        }
      } catch (error) {
        console.error('Error al cargar modelos:', error);
        setModelos([]);
      } finally {
        setIsLoadingModelos(false);
      }
    };

    fetchModelos();
  }, [selectedMarcas]);

  // ✅ ACTUALIZADO: Función para realizar búsqueda
  const performSearch = async (query: string) => {
    try {
      console.log(`🔍 Buscando en filtros: "${query}"`);
      setIsSearching(true);
      
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Resultados de búsqueda: ${data.results.length}`);
        setSearchResults(data.results);
        setShowSearchResults(true);
        setActiveTab('search');
      } else {
        console.error('Error en búsqueda:', data.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ ACTUALIZADO: Manejar submit de búsqueda
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 3) {
      // ✅ ACTUALIZAR URL con nueva búsqueda
      const newUrl = `/public/filtros?search=${encodeURIComponent(searchQuery.trim())}`;
      window.history.pushState({}, '', newUrl);
      performSearch(searchQuery.trim());
    }
  };

  // ✅ ACTUALIZADO: Limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    setActiveTab('filters');
    
    // ✅ LIMPIAR URL
    window.history.pushState({}, '', '/public/filtros');
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const handleMarcaToggle = (marcaId: number) => {
    setSelectedMarcas(prev => 
      prev.includes(marcaId) 
        ? prev.filter(id => id !== marcaId)
        : [...prev, marcaId]
    );
    setShowResults(false);
    setProductos([]);
    setActiveTab('filters');
  };

  const handleModeloToggle = (modeloNombre: string) => {
    setSelectedModelos(prev => 
      prev.includes(modeloNombre) 
        ? prev.filter(nombre => nombre !== modeloNombre)
        : [...prev, modeloNombre]
    );
    setShowResults(false);
    setProductos([]);
    setActiveTab('filters');
  };

  const handleLimpiarFiltros = () => {
    setSelectedMarcas([]);
    setSelectedModelos([]);
    setProductos([]);
    setShowResults(false);
    setMarcasOpen(false);
    setModelosOpen(false);
    setActiveTab('filters');
  };

  const handleAplicarFiltros = async () => {
    if (selectedMarcas.length === 0) {
      alert('Selecciona al menos una marca para aplicar filtros');
      return;
    }

    setMarcasOpen(false);
    setModelosOpen(false);
    setActiveTab('filters');

    setIsLoadingProductos(true);
    try {
      const marcasIds = selectedMarcas.join(',');
      const modelosQuery = selectedModelos.length > 0 ? `&modelos=${selectedModelos.join(',')}` : '';
      
      console.log('🔍 Aplicando filtros con consulta pesada...');
      const response = await fetch(`/api/filtros/productos?marcas=${marcasIds}${modelosQuery}`);
      const data = await response.json();
      
      if (data.success) {
        setProductos(data.productos);
        setShowResults(true);
        console.log(`✅ Productos cargados: ${data.productos.length}`);
      } else {
        console.error('Error al cargar productos:', data.error);
        setProductos([]);
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProductos([]);
    } finally {
      setIsLoadingProductos(false);
    }
  };

  const handleItemClick = (producto: ProductoFiltrado) => {
    const productId = producto.item_id.toString();
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  const handleAddToCart = (item: any) => {
    console.log('Agregado al carrito desde filtros:', item);
  };

  // ✅ ACTUALIZADO: Obtener datos actuales según tab activo
  const getCurrentResults = () => {
    if (activeTab === 'search') {
      return {
        data: searchResults,
        loading: isSearching,
        show: showSearchResults,
        count: searchResults.length
      };
    } else {
      return {
        data: productos,
        loading: isLoadingProductos,
        show: showResults,
        count: productos.length
      };
    }
  };

  const currentResults = getCurrentResults();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="flex items-center justify-between p-4">
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-6 h-6"></div>
          </div>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {[1, 2].map(i => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ ACTUALIZADO: Header con navegación */}
      <div className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-orange-600" />
            {initialSearch ? `Resultados: "${initialSearch}"` : 'Filtros y Búsqueda'}
          </h1>
          
          <div className="w-8"></div>
        </div>
      </div>

      {/* ✅ ACTUALIZADO: Barra de búsqueda */}
      <div className="bg-white border-b border-gray-200 p-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Buscar por marca, modelo o producto..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-12 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600 transition-colors"
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            
            <button 
              type="submit" 
              disabled={isSearching || searchQuery.trim().length < 3}
              className={`rounded-full p-1 transition-colors duration-200 ${
                searchQuery.trim().length >= 3 && !isSearching
                  ? 'text-gray-500 hover:text-white hover:bg-orange-600'
                  : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>

        {/* Helper de búsqueda */}
        {searchQuery.length > 0 && searchQuery.length < 3 && (
          <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700">
            💡 Escribe al menos 3 caracteres para buscar
          </div>
        )}

        {/* ✅ NUEVO: Mostrar origen de la búsqueda */}
        {initialSearch && (
          <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-700">
            🔗 Búsqueda desde página principal: "<span className="font-medium">{initialSearch}</span>"
          </div>
        )}
      </div>

      {/* Tabs para alternar entre filtros y búsqueda */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'filters'
                ? 'border-orange-600 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FunnelIcon className="w-4 h-4 inline mr-2" />
            Filtros Avanzados
            {(selectedMarcas.length > 0 || selectedModelos.length > 0) && (
              <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                {selectedMarcas.length + selectedModelos.length}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'search'
                ? 'border-orange-600 text-orange-600 bg-orange-50'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
            Resultados de Búsqueda
            {showSearchResults && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {searchResults.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sección de filtros - Solo visible en tab filtros */}
      {activeTab === 'filters' && (
        <div className="bg-white border-b border-gray-200 p-4">
          {/* Filtros en línea */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Marcas Dropdown */}
            <div ref={marcasRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marcas ({marcas.length} disponibles)
              </label>
              <div className="relative">
                <button
                  onClick={() => setMarcasOpen(!marcasOpen)}
                  className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex items-center justify-between"
                >
                  <span>
                    {selectedMarcas.length === 0 
                      ? 'Todas las marcas' 
                      : `${selectedMarcas.length} marca${selectedMarcas.length > 1 ? 's' : ''} seleccionada${selectedMarcas.length > 1 ? 's' : ''}`
                    }
                  </span>
                  {marcasOpen ? (
                    <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                {marcasOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {marcas.map((marca) => (
                        <label key={marca.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMarcas.includes(marca.id)}
                            onChange={() => handleMarcaToggle(marca.id)}
                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <span className="flex-1 text-sm text-gray-700">{marca.nombre}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modelos Dropdown */}
            <div ref={modelosRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelos {modelos.length > 0 && `(${modelos.length} disponibles)`}
              </label>
              <div className="relative">
                <button
                  onClick={() => setModelosOpen(!modelosOpen)}
                  disabled={selectedMarcas.length === 0}
                  className="w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {isLoadingModelos ? 'Cargando modelos...' : 
                     selectedModelos.length === 0 
                      ? 'Todos los modelos' 
                      : `${selectedModelos.length} modelo${selectedModelos.length > 1 ? 's' : ''} seleccionado${selectedModelos.length > 1 ? 's' : ''}`
                    }
                  </span>
                  {isLoadingModelos ? (
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    modelosOpen ? (
                      <ChevronUpIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    )
                  )}
                </button>
                
                {modelosOpen && !isLoadingModelos && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      {modelos.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {selectedMarcas.length === 0 
                            ? 'Selecciona una marca primero'
                            : 'No hay modelos disponibles'
                          }
                        </div>
                      ) : (
                        modelos.map((modelo, index) => (
                          <label key={`${modelo.modelo}-${modelo.marca_id}-${index}`} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedModelos.includes(modelo.modelo)}
                              onChange={() => handleModeloToggle(modelo.modelo)}
                              className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                            />
                            <span className="flex-1 text-sm text-gray-700">
                              {modelo.modelo}
                              <span className="text-xs text-gray-500 ml-1">({modelo.marca_nombre})</span>
                            </span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Barra de estadísticas y botones */}
          <div className="flex flex-col gap-4">
            {/* Estadísticas */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Marcas disponibles: <strong className="text-gray-900">{marcas.length}</strong></span>
              {showResults && (
                <span>Productos encontrados: <strong className="text-orange-600">{productos.length}</strong></span>
              )}
            </div>
            
            {/* Botones lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button
                onClick={handleLimpiarFiltros}
                disabled={selectedMarcas.length === 0 && selectedModelos.length === 0}
                className="py-3 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300"
              >
                <XMarkIcon className="w-5 h-5" />
                Limpiar filtros
                {(selectedMarcas.length > 0 || selectedModelos.length > 0) && (
                  <span className="bg-gray-300 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {selectedMarcas.length + selectedModelos.length}
                  </span>
                )}
              </button>

              <button
                onClick={handleAplicarFiltros}
                disabled={selectedMarcas.length === 0 || isLoadingProductos}
                className="py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingProductos ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Buscando productos...
                  </>
                ) : (
                  <>
                    <FunnelIcon className="w-5 h-5" />
                    Aplicar filtros
                    {(selectedMarcas.length > 0 || selectedModelos.length > 0) && (
                      <span className="bg-orange-500 text-xs px-2 py-1 rounded-full">
                        {selectedMarcas.length + selectedModelos.length}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Área de contenido unificada */}
      <div className="flex-1 p-4">
        {currentResults.show ? (
          <>
            {/* Header de resultados */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {activeTab === 'search' ? 'Resultados de búsqueda' : 'Productos filtrados'}
                </h2>
                {activeTab === 'search' && searchQuery && (
                  <p className="text-sm text-gray-600 mt-1">
                    Búsqueda: "<span className="font-medium">{searchQuery}</span>"
                  </p>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {currentResults.count} producto{currentResults.count !== 1 ? 's' : ''} encontrado{currentResults.count !== 1 ? 's' : ''}
              </span>
            </div>

            <FiltrosResults
              productos={currentResults.data}
              isLoading={currentResults.loading}
              onItemClick={handleItemClick}
              onAddToCart={handleAddToCart}
            />
          </>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            {activeTab === 'search' ? (
              <>
                {/* Mostrar spinner cuando está buscando */}
                <div className="mb-4">
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-orange-600 mx-auto"></div>
                  ) : (
                    <MagnifyingGlassIcon className="w-16 h-16 mx-auto text-gray-300" />
                  )}
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {isSearching ? (
                    'Buscando productos...'
                  ) : (
                    searchQuery.length === 0 ? 'Busca productos' : 'Busca para ver resultados'
                  )}
                </h3>
                
                <p className="text-gray-500 mb-4">
                  {isSearching ? (
                    `Buscando: "${searchQuery}"`
                  ) : (
                    searchQuery.length === 0 
                      ? 'Escribe en el campo de búsqueda para encontrar productos específicos.'
                      : searchQuery.length < 3
                      ? 'Escribe al menos 3 caracteres para buscar.'
                      : 'Presiona Enter o haz clic en la lupa para buscar.'
                  )}
                </p>
              </>
            ) : (
              <>
                <FunnelIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {selectedMarcas.length === 0 ? 'Selecciona filtros' : 'Aplica los filtros'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {selectedMarcas.length === 0 
                    ? 'Selecciona al menos una marca para comenzar a filtrar productos.'
                    : 'Haz clic en "Aplicar filtros" para buscar productos con stock disponible.'
                  }
                </p>
                
                {/* Mostrar filtros activos */}
                {(selectedMarcas.length > 0 || selectedModelos.length > 0) && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Filtros seleccionados:</h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {selectedMarcas.map(marcaId => {
                        const marca = marcas.find(m => m.id === marcaId);
                        return marca && (
                          <span key={marcaId} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                            📱 {marca.nombre}
                          </span>
                        );
                      })}
                      {selectedModelos.map(modeloNombre => (
                        <span key={modeloNombre} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          📋 {modeloNombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal de detalle del producto */}
      {selectedProductId && isModalOpen && typeof window !== 'undefined' && (
        createPortal(
          <DetalleProductoModal
            itemId={selectedProductId}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
          />,
          document.body
        )
      )}
    </div>
  );
}