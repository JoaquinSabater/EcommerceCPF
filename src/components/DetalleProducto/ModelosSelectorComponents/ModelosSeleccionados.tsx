"use client";

import { Articulo } from "@/types/types";
import { formatModeloDisplay } from "./ModelosUtils";

type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

interface ModelosSeleccionadosProps {
  seleccionados: ModeloSeleccionado[];
  esSinDescuento: boolean; // ✅ CAMBIAR: de esElectronica a esSinDescuento
  dolar: number;
  getPrecioConDescuento: (precio: number) => number;
  isDistribuidor: () => boolean;
  onRemoveSeleccionado: (modelo: string) => void;
  onAddToCart: () => void;
  sugerenciaActual: string;
}

export default function ModelosSeleccionados({
  seleccionados,
  esSinDescuento, // ✅ CAMBIAR
  dolar,
  getPrecioConDescuento,
  isDistribuidor,
  onRemoveSeleccionado,
  onAddToCart,
  sugerenciaActual
}: ModelosSeleccionadosProps) {
  if (seleccionados.length === 0) {
    return (
      <button
        className="mt-2 text-white px-6 py-3 rounded font-bold w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ backgroundColor: '#ea580c' }}
        disabled={true}
      >
        Añadir al carrito
      </button>
    );
  }

  return (
    <>
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Modelos seleccionados:</h4>
        <div className={`flex flex-col gap-2 ${seleccionados.length > 3 ? "max-h-48 overflow-y-auto pr-1" : ""}`}>
          {seleccionados.map((s) => {
            const displayInfo = formatModeloDisplay(s.articulo, esSinDescuento, dolar, getPrecioConDescuento);
            const subtotalArs = displayInfo.precioArs * s.cantidad;
            
            return (
              <div key={s.articulo.codigo_interno} className="flex items-center gap-3 border border-gray-200 rounded px-3 py-2 bg-gray-50 hover:bg-gray-100">
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-medium text-gray-800">
                        {displayInfo.marcaModelo}
                        {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                        {displayInfo.esSinDescuento && <span className="ml-1">📦</span>}
                      </span>
                      <div className="text-sm text-gray-600">
                        Cantidad: {s.cantidad} x ${displayInfo.precioUsd} USD
                        {!esSinDescuento && isDistribuidor() && (
                          <span className="ml-1 text-green-600 text-xs">(-20%)</span>
                        )}
                        {displayInfo.esPesificado && (
                          <span className="ml-1 text-orange-600 text-xs">(Precio especial)</span>
                        )}
                        {esSinDescuento && (
                          <span className="ml-1 text-gray-600 text-xs">(Sin descuento)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        ${(displayInfo.precioUsd * s.cantidad).toFixed(2)} USD
                        {!esSinDescuento && isDistribuidor() && (
                          <span className="ml-1 text-xs text-green-700">(-20%)</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ${Math.round(subtotalArs).toLocaleString()} ARS
                        {displayInfo.esPesificado && (
                          <span className="ml-1 text-orange-600">🏷️</span>
                        )}
                        {esSinDescuento && (
                          <span className="ml-1 text-gray-600">📦</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 hover:underline text-sm font-medium"
                  onClick={() => onRemoveSeleccionado(s.articulo.modelo)}
                >
                  Quitar
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Total de seleccionados */}
        <div className="mt-2 pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total:</span>
            <div className="text-right">
              <div className="font-bold text-green-600">
                ${seleccionados.reduce((sum, s) => {
                  const displayInfo = formatModeloDisplay(s.articulo, esSinDescuento, dolar, getPrecioConDescuento);
                  return sum + (displayInfo.precioUsd * s.cantidad);
                }, 0).toFixed(2)} USD
                {!esSinDescuento && isDistribuidor() && (
                  <span className="ml-1 text-xs text-green-700">(-20%)</span>
                )}
              </div>
              <div className="text-sm text-gray-500">
                ${Math.round(seleccionados.reduce((sum, s) => {
                  const displayInfo = formatModeloDisplay(s.articulo, esSinDescuento, dolar, getPrecioConDescuento);
                  return sum + (displayInfo.precioArs * s.cantidad);
                }, 0)).toLocaleString()} ARS
                {seleccionados.some(s => formatModeloDisplay(s.articulo, esSinDescuento, dolar, getPrecioConDescuento).esPesificado) && (
                  <span className="ml-1 text-orange-600">🏷️</span>
                )}
                {esSinDescuento && (
                  <span className="ml-1 text-gray-600">📦</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón añadir al carrito */}
      <button
        className="mt-2 text-white px-6 py-3 rounded font-bold w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ backgroundColor: '#ea580c' }}
        disabled={seleccionados.length === 0}
        onClick={onAddToCart}
      >
        {seleccionados.length > 0 
          ? `Añadir ${seleccionados.length} modelo(s) al carrito${esSinDescuento ? ' (Sin descuento especial)' : ''}${sugerenciaActual ? ' con sugerencias ✨' : ''}${!esSinDescuento && isDistribuidor() ? ' (20% OFF)' : ''}` 
          : 'Añadir al carrito'
        }
      </button>
    </>
  );
}