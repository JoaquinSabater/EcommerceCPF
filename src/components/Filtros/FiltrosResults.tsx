"use client";

import React from "react";
import { CldImage } from "next-cloudinary";
import FiltrosQuantityButton from "./FiltrosQuantityButton";

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

interface FiltrosResultsProps {
  productos: ProductoFiltrado[];
  isLoading?: boolean;
  onItemClick?: (producto: ProductoFiltrado) => void;
  onAddToCart?: (item: any) => void;
}

export default function FiltrosResults({ 
  productos, 
  isLoading = false,
  onItemClick, 
  onAddToCart 
}: FiltrosResultsProps) {

  const getImageSrc = (producto: ProductoFiltrado) => {
    return producto.foto_portada || producto.foto1_url;
  };

  const handleItemClick = (producto: ProductoFiltrado, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (onItemClick) {
      onItemClick(producto);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* ✅ CORREGIDO: Imagen más alta en móvil para fundas completas */}
              <div className="w-full h-48 sm:w-20 sm:h-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
              </div>
              <div className="w-full sm:w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-6m6 0H10m-6 0h6m0 0v5a2 2 0 002 2h2a2 2 0 002-2v-5" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay productos</h3>
        <p className="text-gray-500">
          No se encontraron productos que coincidan con los filtros seleccionados.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Productos encontrados ({productos.length})
        </h2>
      </div>

      <div className="space-y-3">
        {productos.map((producto, index) => (
          <div
            key={`${producto.codigo_interno}-${index}`}
            className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              
              {/* ✅ CORREGIDO: Imagen más alta para mostrar fundas completas */}
              <div className="w-full h-48 sm:w-20 sm:h-24 flex-shrink-0 bg-white">
                {getImageSrc(producto) ? (
                  <CldImage
                    src={getImageSrc(producto)!}
                    alt={producto.item}
                    width={400}
                    height={600}
                    className="w-full h-full object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handleItemClick(producto, e)}
                    crop="fit"
                    quality="auto"
                    format="auto"
                  />
                ) : (
                  <img
                    src="/not-image.png"
                    alt="Sin imagen"
                    className="w-full h-full object-contain rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => handleItemClick(producto, e)}
                  />
                )}
              </div>

              {/* Contenido principal: información + botón */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1 min-w-0 w-full">
                
                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={(e) => handleItemClick(producto, e)}
                    className="text-left w-full hover:bg-transparent group"
                    type="button"
                  >
                    <h3 className="font-medium text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                      {producto.item}
                    </h3>
                    
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-gray-700">
                        {producto.marca_modelo_completo}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-bold text-orange-600">
                          ${producto.precio_venta.toLocaleString()}
                        </span>
                        <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-full">
                          Stock: {producto.stock_real}
                        </span>
                        <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          {producto.marca_nombre}
                        </span>
                      </div>
                      
                      <p className="text-xs text-gray-500 mt-1">
                        Código: {producto.codigo_interno}
                      </p>
                    </div>
                  </button>
                </div>

                {/* ✅ CORREGIDO: Botón más alineado a la derecha */}
                <div 
                  className="w-full sm:w-48 flex-shrink-0" 
                  onClick={(e) => e.stopPropagation()}
                >
                  <FiltrosQuantityButton
                    itemId={producto.item_id}
                    codigoInterno={producto.codigo_interno}
                    itemName={producto.item}
                    modelo={producto.marca_modelo_completo}
                    maxStock={producto.stock_real}
                    precio={producto.precio_venta}
                    onAddToCart={onAddToCart}
                    className=""
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}