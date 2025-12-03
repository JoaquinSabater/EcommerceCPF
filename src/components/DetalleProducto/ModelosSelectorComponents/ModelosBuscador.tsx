"use client";

import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Articulo } from "@/types/types";
import { formatModeloDisplay, getStockDisponible } from "./ModelosUtils";

type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

interface ModelosBuscadorProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (focused: boolean) => void;
  modelosFiltrados: Articulo[];
  seleccionados: ModeloSeleccionado[];
  esSinDescuento: boolean; // ✅ CAMBIAR: de esElectronica a esSinDescuento
  dolar: number;
  getPrecioConDescuento: (precio: number) => number;
  isDistribuidor: () => boolean;
  onSearchSelect: (modelo: Articulo) => void;
  loadingModelos: boolean;
}

export default function ModelosBuscador({
  searchTerm,
  setSearchTerm,
  isSearchFocused,
  setIsSearchFocused,
  modelosFiltrados,
  seleccionados,
  esSinDescuento, // ✅ CAMBIAR: de esElectronica a esSinDescuento
  dolar,
  getPrecioConDescuento,
  isDistribuidor,
  onSearchSelect,
  loadingModelos
}: ModelosBuscadorProps) {
  const clearSearch = () => {
    setSearchTerm("");
    setIsSearchFocused(false);
  };

  return (
    <div className="mb-4 relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar por modelo o marca..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {isSearchFocused && searchTerm && (
        <div className="absolute z-20 bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {loadingModelos ? (
            <div className="px-4 py-2 text-gray-500 text-sm italic">
              Cargando modelos...
            </div>
          ) : modelosFiltrados.length > 0 ? (
            <div className="grid grid-cols-1 gap-1 py-1">
              {modelosFiltrados.slice(0, 20).map((modelo) => {
                const displayInfo = formatModeloDisplay(modelo, esSinDescuento, dolar, getPrecioConDescuento);
                const stockDisponible = getStockDisponible(modelo, seleccionados);
                return (
                  <button
                    key={modelo.codigo_interno}
                    onClick={() => onSearchSelect(modelo)}
                    disabled={stockDisponible <= 0}
                    className={`cursor-pointer select-none relative py-2 px-4 hover:bg-orange-100 hover:text-orange-900 transition-colors text-left ${stockDisponible <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {displayInfo.marcaModelo}
                          {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                          {esSinDescuento && <span className="ml-1">📦</span>}
                        </span>
                        <span className="text-sm text-gray-500">
                          {modelo.modelo}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          ${displayInfo.precioUsd} USD
                          {/* ✅ CAMBIAR: Solo mostrar descuento si NO está excluido */}
                          {!esSinDescuento && isDistribuidor() && (
                            <span className="ml-1 text-xs text-green-700">(-20%)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${displayInfo.precioArs.toLocaleString()} ARS
                          {displayInfo.esPesificado && (
                            <span className="ml-1 text-orange-600">🏷️</span>
                          )}
                          {esSinDescuento && (
                            <span className="ml-1 text-gray-600">📦</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-4 py-2 text-gray-500 text-sm italic">
              No se encontraron modelos
            </div>
          )}
          {modelosFiltrados.length > 20 && (
            <div className="px-4 py-2 text-sm text-gray-500 border-t">
              Y {modelosFiltrados.length - 20} modelos más...
            </div>
          )}
        </div>
      )}
    </div>
  );
}