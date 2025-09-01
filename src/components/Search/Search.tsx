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
  marca_nombre?: string; // ✅ Nueva propiedad
  precio_venta: number;
  stock_real: number;
  foto1_url?: string;
  foto_portada?: string;
  marca_modelo_completo?: string; // ✅ Nueva propiedad
}

export default function Search() {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Estados para el modal
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Búsqueda con debounce
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (search.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    timeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(search.trim())}`);
        const data = await response.json();
        
        setResults(data.results || []);
        setShowResults(true);
      } catch (error) {
        console.error('Error en búsqueda:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [search]);

  // Cerrar resultados al hacer clic fuera
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
    if (search.trim().length >= 2) {
      setShowResults(true);
    }
  };

  const clearSearch = () => {
    setSearch('');
    setResults([]);
    setShowResults(false);
  };

  const handleItemClick = (result: SearchResult) => {
    console.log('Search - Producto seleccionado:', result);
    
    // Abrir modal PRIMERO
    const productId = result.item_id.toString();
    console.log('Search - Abriendo modal para producto:', productId);
    
    setSelectedProductId(productId);
    setIsModalOpen(true);
    
    // DESPUÉS cerrar los resultados de búsqueda
    setShowResults(false);
  };

  const handleCloseModal = () => {
    console.log('Search - Cerrando modal');
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  const handleAddToCart = (item: any) => {
    console.log('Agregado al carrito desde búsqueda:', item);
  };

  return (
    <>
      <div ref={searchRef} className="relative w-full max-w-[400px]">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            placeholder="Buscar por marca, modelo o producto..." // ✅ Placeholder actualizado
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2 pr-20 text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-orange-600"
          />
          
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
              disabled={isSearching}
              className="text-gray-500 hover:text-white hover:bg-orange-600 rounded-full p-1 transition-colors duration-200 disabled:opacity-50"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
              ) : (
                <MagnifyingGlassIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </form>

        {showResults && (
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
    <div className="w-full max-w-[400px] h-10 bg-gray-200 animate-pulse rounded-lg" />
  );
}