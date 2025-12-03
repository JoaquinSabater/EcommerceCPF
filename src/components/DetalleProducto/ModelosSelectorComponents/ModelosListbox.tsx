"use client";

import { Listbox } from "@headlessui/react";
import QuantityButton from "@/components/QuantityButton";
import { Articulo } from "@/types/types";
import { formatModeloDisplay, getStockDisponible, chunkModelos } from "./ModelosUtils";

type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

interface ModelosListboxProps {
  modeloActual: Articulo | null;
  setModeloActual: (modelo: Articulo | null) => void;
  cantidadActual: number;
  setCantidadActual: (cantidad: number) => void;
  modelosFiltrados: Articulo[];
  seleccionados: ModeloSeleccionado[];
  searchTerm: string;
  esSinDescuento: boolean; // ✅ CAMBIAR: de esElectronica a esSinDescuento
  dolar: number;
  getPrecioConDescuento: (precio: number) => number;
  isDistribuidor: () => boolean;
  onAddModelo: () => void;
  onCantidadChange: (value: number) => void;
  loadingModelos: boolean;
}

export default function ModelosListbox({
  modeloActual,
  setModeloActual,
  cantidadActual,
  setCantidadActual,
  modelosFiltrados,
  seleccionados,
  searchTerm,
  esSinDescuento, // ✅ CAMBIAR: de esElectronica a esSinDescuento
  dolar,
  getPrecioConDescuento,
  isDistribuidor,
  onAddModelo,
  onCantidadChange,
  loadingModelos
}: ModelosListboxProps) {
  const modelosChunks = chunkModelos(modelosFiltrados);

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <Listbox value={modeloActual} onChange={setModeloActual}>
        <div className="relative flex-1">
          <Listbox.Button className="w-full flex items-center justify-between border border-gray-300 px-4 py-2 rounded bg-white text-left hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200">
            <span className="block truncate">
              {modeloActual ? formatModeloDisplay(modeloActual, esSinDescuento, dolar, getPrecioConDescuento).texto : "Elegí un modelo"}
            </span>
            <span className="pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute z-10 bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg w-full max-h-60 overflow-auto focus:outline-none">
            {loadingModelos ? (
              <div className="px-4 py-2 text-gray-500 text-sm italic">
                Cargando modelos...
              </div>
            ) : modelosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-1">
                {modelosChunks.map((chunk, chunkIndex) => (
                  <div key={chunkIndex} className="flex flex-col">
                    {chunk.map((m) => {
                      const displayInfo = formatModeloDisplay(m, esSinDescuento, dolar, getPrecioConDescuento);
                      const stockDisponible = getStockDisponible(m, seleccionados);
                      return (
                        <Listbox.Option 
                          key={m.codigo_interno} 
                          value={m} 
                          disabled={stockDisponible <= 0}
                          className={({ active }) => `
                            cursor-pointer select-none relative py-2 px-4
                            ${active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'}
                            ${stockDisponible <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
                          `}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {displayInfo.marcaModelo}
                                {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                                {esSinDescuento && <span className="ml-1">📦</span>}
                              </span>
                              <span className="text-sm text-gray-500">
                                {m.modelo}
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
                        </Listbox.Option>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm italic">
                {searchTerm ? 'No hay modelos que coincidan' : 'No hay modelos disponibles'}
              </div>
            )}
          </Listbox.Options>
        </div>
      </Listbox>

      {modeloActual && (
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <QuantityButton
              value={cantidadActual}
              onAdd={() => {
                const stockDisponible = getStockDisponible(modeloActual, seleccionados);
                if (cantidadActual < stockDisponible) {
                  setCantidadActual(cantidadActual + 1);
                }
              }}
              onRemove={() => setCantidadActual(Math.max(1, cantidadActual - 1))}
              onSet={onCantidadChange}
              modelo={modeloActual.modelo}
              hideModelo={true}
              size="normal"
              maxStock={getStockDisponible(modeloActual, seleccionados)}
            />
          </div>
          <button
            className="flex-1 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#ea580c' }}
            onClick={onAddModelo}
            disabled={getStockDisponible(modeloActual, seleccionados) <= 0}
          >
            {getStockDisponible(modeloActual, seleccionados) <= 0 ? 'Sin stock' : 'Añadir modelo'}
          </button>
        </div>
      )}
    </div>
  );
}