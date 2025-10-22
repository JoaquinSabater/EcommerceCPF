'use client';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import SearchResults from '@/components/Search/SearchResults';
import DetalleProductoModal from '@/components/Products/DetalleProductoModal';

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

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (search.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        //console.log(`🔍 Iniciando búsqueda con: "${search.trim()}" (${search.trim().length} caracteres)`);
        
        const response = await fetch(`/api/search?q=${encodeURIComponent(search.trim())}`);
        const data = await response.json();
        
        //console.log(`📊 Resultados obtenidos: ${data.results?.length || 0}`);
        
        setResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search]);

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
    setSearch('');
    setResults([]);
    setShowResults(false);
    setIsSearching(false);
  };

  const handleItemClick = (result: SearchResult) => {
    //console.log('Search - Producto seleccionado:', result);
    
    const productId = result.item_id.toString();
    //console.log('Search - Abriendo modal para producto:', productId);
    
    setSelectedProductId(productId);
    setIsModalOpen(true);
    
    setShowResults(false);
  };

  const handleCloseModal = () => {
    //console.log('Search - Cerrando modal');
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  const handleAddToCart = (item: any) => {
   // console.log('Agregado al carrito desde búsqueda:', item);
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
      {/* ✅ CORREGIDO: Sin max-width, ancho completo siempre */}
      <div ref={searchRef} className="relative w-full">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder={getPlaceholderText()}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full rounded-lg border bg-white px-4 py-2 pr-20 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:border-orange-600 transition-colors ${
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
          
          <div className="absolute right-2 top-2 flex items-center gap-1">
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

        {/* ✅ CORREGIDO: Resultados ocupan todo el ancho */}
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

      {/* Modal de Detalle del Producto usando Portal - FUERA del dropdown */}
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