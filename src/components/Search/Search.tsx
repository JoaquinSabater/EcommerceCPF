'use client';

import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import SearchResults from '@/components/Search/SearchResults';
import DetalleProductoModal from '@/components/Products/DetalleProductoModal';
import { useRouter } from 'next/navigation';

interface SearchResult {
  item_id: number;
  item: string;
  codigo_interno: string;
  modelo: string;
  marca_nombre?: string;
  precio_venta: number;
  stock_real: number;
  foto1_url?: string;
  foto_portada?: string;
  marca_modelo_completo?: string;
}

export default function Search() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  
  // ✅ MEJORADO: Usar un contador de búsqueda para evitar race conditions
  const searchCounterRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // ✅ Incrementar contador de búsqueda
    searchCounterRef.current++;
    const currentSearchCounter = searchCounterRef.current;

    // ✅ Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // ✅ Cancelar búsqueda anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // ✅ Si no hay suficientes caracteres, limpiar y salir
    if (search.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    // ✅ LIMPIAR RESULTADOS INMEDIATAMENTE al empezar nueva búsqueda
    setResults([]);
    setIsSearching(true);
    
    // ✅ Guardar el término de búsqueda actual
    const searchTerm = search.trim();

    // ✅ DEBOUNCE: Esperar 600ms antes de ejecutar la búsqueda (reducido para mejor UX)
    timeoutRef.current = setTimeout(async () => {
      // ✅ Verificar que esta siga siendo la búsqueda más reciente
      if (searchCounterRef.current !== currentSearchCounter) {
        console.log(`🚫 Búsqueda obsoleta cancelada: ${currentSearchCounter} != ${searchCounterRef.current}`);
        return;
      }

      // ✅ Crear nuevo AbortController para esta búsqueda
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        console.log(`🔍 Ejecutando búsqueda #${currentSearchCounter}: "${searchTerm}"`);
        
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}`,
          { 
            signal: abortController.signal
          }
        );

        // ✅ Verificar que no se canceló la petición
        if (abortController.signal.aborted) {
          console.log(`🚫 Petición abortada #${currentSearchCounter}`);
          return;
        }

        // ✅ VERIFICACIÓN CRÍTICA: Verificar que esta siga siendo la búsqueda actual
        if (searchCounterRef.current !== currentSearchCounter) {
          console.log(`🚫 Resultados descartados #${currentSearchCounter}, actual: ${searchCounterRef.current}`);
          return;
        }

        const data = await response.json();
        
        console.log(`✅ Resultados #${currentSearchCounter} para "${searchTerm}": ${data.results?.length || 0}`);
        
        // ✅ VERIFICACIÓN FINAL antes de actualizar estado
        if (searchCounterRef.current === currentSearchCounter) {
          setResults(data.results || []);
          setShowResults(true);
          setIsSearching(false);
        } else {
          console.log(`🚫 Estado no actualizado #${currentSearchCounter}, actual: ${searchCounterRef.current}`);
        }
        
      } catch (error) {
        // ✅ Ignorar errores de cancelación
        if (error instanceof Error && error.name === 'AbortError') {
          console.log(`🚫 Búsqueda cancelada #${currentSearchCounter}`);
          return;
        }
        
        console.error(`❌ Error en búsqueda #${currentSearchCounter}:`, error);
        
        // ✅ Solo limpiar si es la búsqueda actual
        if (searchCounterRef.current === currentSearchCounter) {
          setResults([]);
          setIsSearching(false);
        }
      }
    }, 600); // ✅ Reducido a 600ms para mejor UX

    // ✅ Cleanup al cambiar el search
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search]);

  // ✅ Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim().length >= 3) {
      setShowResults(true);
    }
  };

  const clearSearch = () => {
    // ✅ Incrementar contador para invalidar búsquedas en curso
    searchCounterRef.current++;
    
    // ✅ Cancelar búsquedas pendientes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setSearch('');
    setResults([]);
    setShowResults(false);
    setIsSearching(false);
  };

  const handleItemClick = (result: SearchResult) => {
    const productId = result.item_id.toString();
    setSelectedProductId(productId);
    setIsModalOpen(true);
    setShowResults(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  const handleAddToCart = (item: any) => {
    console.log('Agregado al carrito desde búsqueda:', item);
  };

  // ✅ NUEVO: Función para manejar click en filtros
  const handleFilterClick = () => {
    router.push('/public/filtros');
  };

  const getPlaceholderText = () => {
    const length = search.trim().length;
    if (length === 0) {
      return "Buscar por marca, modelo o producto...";
    } else if (length < 3) {
      return `Escribe ${3 - length} caracteres más para buscar...`;
    } else {
      return "Buscar por marca, modelo o producto...";
    }
  };

  const showHelper = search.length > 0 && search.length < 3;

  return (
    <>
      <div ref={searchRef} className="relative w-full">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder={getPlaceholderText()}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-lg border bg-white px-4 py-2 pr-36 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-600 transition-colors ${
              showHelper 
                ? 'border-yellow-300 focus:ring-yellow-500' 
                : 'border-neutral-200 focus:ring-orange-600'
            }`}
          />
          
          {showHelper && (
            <div className="absolute top-full left-0 right-0 mt-1 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-700 z-40">
              💡 Escribe al menos 3 caracteres para buscar
            </div>
          )}
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {/* ✅ MEJORADO: Botón de filtros con texto */}
            <button
              type="button"
              onClick={handleFilterClick}
              className="flex items-center gap-1 text-gray-500 hover:text-orange-600 px-2 py-1 text-xs transition-colors bg-gray-50 hover:bg-orange-50 rounded-md"
              title="Filtros avanzados"
            >
              <FunnelIcon className="h-3 w-3" />
              <span className="whitespace-nowrap">Filtros</span>
            </button>
            
            {search && (
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
              disabled={isSearching || search.trim().length < 3}
              className={`rounded-full p-1 transition-colors duration-200 ${
                search.trim().length >= 3 && !isSearching
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

        {showResults && !showHelper && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <SearchResults
              results={results}
              query={search}
              onItemClick={handleItemClick}
              onAddToCart={handleAddToCart}
            />
          </div>
        )}
      </div>

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
    </>
  );
}

export function SearchSkeleton() {
  return (
    <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg" />
  );
}