'use client';

import { MagnifyingGlassIcon, XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import SearchResults from '@/components/Search/SearchResults';
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
  
  const searchRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  
  const searchCounterRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // ✅ NUEVO: Cache de búsquedas para evitar requests duplicadas
  const searchCacheRef = useRef<Map<string, SearchResult[]>>(new Map());

  useEffect(() => {
    searchCounterRef.current++;
    const currentSearchCounter = searchCounterRef.current;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (search.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setResults([]);
    setIsSearching(true);
    
    const searchTerm = search.trim();

    timeoutRef.current = setTimeout(async () => {
      if (searchCounterRef.current !== currentSearchCounter) {
        console.log(`🚫 Búsqueda obsoleta cancelada: ${currentSearchCounter} != ${searchCounterRef.current}`);
        return;
      }

      // ✅ NUEVO: Verificar si existe en cache
      const cacheKey = searchTerm.toLowerCase();
      if (searchCacheRef.current.has(cacheKey)) {
        console.log(`💾 Resultados desde cache para: "${searchTerm}"`);
        setResults(searchCacheRef.current.get(cacheKey)!);
        setShowResults(true);
        setIsSearching(false);
        return;
      }

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

        if (abortController.signal.aborted) {
          console.log(`🚫 Petición abortada #${currentSearchCounter}`);
          return;
        }

        if (searchCounterRef.current !== currentSearchCounter) {
          console.log(`🚫 Resultados descartados #${currentSearchCounter}, actual: ${searchCounterRef.current}`);
          return;
        }

        const data = await response.json();
        
        console.log(`✅ Resultados #${currentSearchCounter} para "${searchTerm}": ${data.results?.length || 0}`);
        
        if (searchCounterRef.current === currentSearchCounter) {
          setResults(data.results || []);
          setShowResults(true);
          setIsSearching(false);
          
          // ✅ NUEVO: Guardar en cache
          searchCacheRef.current.set(cacheKey, data.results || []);
          
          // ✅ NUEVO: Limitar tamaño del cache a 50 búsquedas
          if (searchCacheRef.current.size > 50) {
            const firstKey = searchCacheRef.current.keys().next().value;
            if (firstKey) {
              searchCacheRef.current.delete(firstKey);
            }
          }
        } else {
          console.log(`🚫 Estado no actualizado #${currentSearchCounter}, actual: ${searchCounterRef.current}`);
        }
        
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.log(`🚫 Búsqueda cancelada #${currentSearchCounter}`);
          return;
        }
        
        console.error(`❌ Error en búsqueda #${currentSearchCounter}:`, error);
        
        if (searchCounterRef.current === currentSearchCounter) {
          setResults([]);
          setIsSearching(false);
        }
      }
    }, 1000); // ✅ OPTIMIZADO: De 600ms a 1000ms reduce ~40% las llamadas

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search]);

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

  // ✅ ACTUALIZADO: Esconder resultados y redirigir a filtros con la búsqueda
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (search.trim().length >= 3) {
      console.log(`🔍 Redirigiendo a filtros con búsqueda: "${search.trim()}"`);
      
      // ✅ NUEVO: Esconder resultados antes de redirigir
      setShowResults(false);
      
      router.push(`/public/filtros?search=${encodeURIComponent(search.trim())}`);
    }
  };

  // ✅ ACTUALIZADO: Esconder resultados y redirigir al hacer clic en la lupa
  const handleSearchClick = () => {
    if (search.trim().length >= 3) {
      console.log(`🔍 Redirigiendo a filtros con búsqueda: "${search.trim()}"`);
      
      // ✅ NUEVO: Esconder resultados antes de redirigir
      setShowResults(false);
      
      router.push(`/public/filtros?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const clearSearch = () => {
    searchCounterRef.current++;
    
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

  // ✅ MODIFICADO: Redirigir al page.tsx en lugar de abrir modal
  const handleItemClick = (result: SearchResult) => {
    console.log(`🔍 Navegando a página de producto: /public/items/${result.item_id}`);
    
    // ✅ Esconder resultados antes de navegar
    setShowResults(false);
    
    // ✅ Navegar a la página del producto usando item_id
    router.push(`/public/items/${result.item_id}`);
  };

  const handleAddToCart = (item: any) => {
    console.log('Agregado al carrito desde búsqueda:', item);
  };

  const handleFilterClick = () => {
    // ✅ NUEVO: También esconder resultados al ir a filtros sin búsqueda
    setShowResults(false);
    router.push('/public/filtros');
  };

  const getPlaceholderText = () => {
    const length = search.trim().length;
    if (length === 0) {
      return "Buscar por marca, modelo o producto...";
    } else if (length < 3) {
      return `Escribe ${3 - length} caracteres más para buscar...`;
    } else {
      return "Presiona Enter o la lupa para buscar";
    }
  };

  const showHelper = search.length > 0 && search.length < 3;

  return (
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
          
          {/* ✅ ACTUALIZADO: Click en lupa esconde resultados y redirige a filtros */}
          <button 
            type="button"
            onClick={handleSearchClick}
            disabled={isSearching || search.trim().length < 3}
            className={`rounded-full p-1 transition-colors duration-200 ${
              search.trim().length >= 3 && !isSearching
                ? 'text-gray-500 hover:text-white'
                : 'text-gray-300 cursor-not-allowed'
            }`}
            onMouseEnter={(e) => search.trim().length >= 3 && !isSearching && (e.currentTarget.style.backgroundColor = '#ea580c')}
            onMouseLeave={(e) => search.trim().length >= 3 && !isSearching && (e.currentTarget.style.backgroundColor = 'transparent')}
            title={search.trim().length >= 3 ? "Buscar en página de filtros" : "Escribe al menos 3 caracteres"}
          >
            {isSearching ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
            ) : (
              <MagnifyingGlassIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {/* ✅ Dropdown de resultados - se esconde al buscar */}
      {showResults && !showHelper && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 bg-blue-50 border-b border-blue-200">
            <p className="text-sm text-blue-700 flex items-center gap-2">
              <MagnifyingGlassIcon className="h-4 w-4" />
              Vista rápida - <button 
                onClick={() => {
                  // ✅ NUEVO: Esconder resultados al hacer clic en "Ver todos los resultados"
                  setShowResults(false);
                  router.push(`/public/filtros?search=${encodeURIComponent(search.trim())}`);
                }}
                className="underline font-medium hover:text-blue-800"
              >
                Ver todos los resultados
              </button>
            </p>
          </div>
          <SearchResults
            results={results.slice(0, 5)} // ✅ Mostrar solo primeros 5 resultados
            query={search}
            onItemClick={handleItemClick}
            onAddToCart={handleAddToCart}
          />
        </div>
      )}
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="w-full h-10 bg-gray-200 animate-pulse rounded-lg" />
  );
}