"use client";

import React from "react";
import Image from "next/image";
import SearchQuantityButton from "@/components/SearchQuantityButton";
import { CldImage } from "next-cloudinary";

interface SearchResult {
  item_id: number;
  item: string;
  codigo_interno: string;
  modelo: string;
  precio_venta: number;
  stock_real: number;
  foto1_url?: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onItemClick?: (result: SearchResult) => void;
  onAddToCart?: (item: any) => void;
}

export default function SearchResults({ 
  results, 
  query, 
  onItemClick, 
  onAddToCart 
}: SearchResultsProps) {

  const handleItemClick = (result: SearchResult, event?: React.MouseEvent) => {
    // Prevenir que el evento se propague
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    console.log('SearchResults - handleItemClick ejecutado:', {
      result,
      itemId: result.item_id.toString()
    });
    
    // Llamar al callback del componente padre (Search.tsx)
    if (onItemClick) {
      onItemClick(result);
    }
  };

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No se encontraron productos para "{query}"
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {results.map((result, index) => (
        <div
          key={`${result.codigo_interno}-${index}`}
          className="p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
        >
          {/* Layout responsive: stack en móvil, horizontal en desktop */}
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            
            {/* Contenido principal: imagen + información */}
            <div className="flex items-start gap-3 flex-1 min-w-0">
              {/* Imagen del producto */}
              <div className="w-12 h-12 flex-shrink-0">
                {result.foto1_url ? (
                  <CldImage
                    src={result.foto1_url}
                    alt={result.item}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handleItemClick(result, e)}
                  />
                ) : (
                  <img
                    src="/not-image.png"
                    alt="Sin imagen"
                    className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handleItemClick(result, e)}
                  />
                )}
              </div>

              {/* Información del producto */}
              <div className="flex-1 min-w-0">
                <button
                  onClick={(e) => handleItemClick(result, e)}
                  className="text-left w-full hover:bg-transparent group"
                  type="button"
                >
                  <h3 className="font-medium text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                    {result.item}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    Modelo: {result.modelo}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-orange-600">
                      ${result.precio_venta.toLocaleString()}
                    </span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Stock: {result.stock_real}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* SearchQuantityButton - En su propia columna */}
            <div 
              className="flex justify-center sm:justify-end items-start" 
              onClick={(e) => e.stopPropagation()}
            >
              <SearchQuantityButton
                itemId={result.item_id}
                codigoInterno={result.codigo_interno}
                itemName={result.item}
                modelo={result.modelo}
                maxStock={result.stock_real}
                precio={result.precio_venta}
                onAddToCart={onAddToCart}
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}