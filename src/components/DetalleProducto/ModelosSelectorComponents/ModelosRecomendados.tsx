"use client";

import { useState } from "react";
import { Listbox } from "@headlessui/react";
import { PencilIcon } from "@heroicons/react/24/outline";
import { Articulo } from "@/types/types";
import { formatModeloDisplay, getStockDisponible } from "./ModelosUtils";
import { useAuth } from "@/hooks/useAuth";

type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

interface ModelosRecomendadosProps {
  modelosRecomendados: string[];
  setModelosRecomendados: (modelos: string[]) => void;
  modelos: Articulo[];
  seleccionados: ModeloSeleccionado[];
  subcategoriaId: number;
  esSinDescuento: boolean;
  dolar: number;
  getPrecioConDescuento: (precio: number) => number;
  isDistribuidor: () => boolean;
  onRecomendadoSelect: (modeloNombre: string) => void;
  loadingModelos: boolean;
}

export default function ModelosRecomendados({
  modelosRecomendados,
  setModelosRecomendados,
  modelos,
  seleccionados,
  subcategoriaId,
  esSinDescuento,
  dolar,
  getPrecioConDescuento,
  isDistribuidor,
  onRecomendadoSelect,
  loadingModelos
}: ModelosRecomendadosProps) {

  const [isEditingRecomendados, setIsEditingRecomendados] = useState<boolean>(false);
  const [tempRecomendados, setTempRecomendados] = useState<string[]>(modelosRecomendados);
  const [modeloSeleccionadoAdmin, setModeloSeleccionadoAdmin] = useState<Articulo | null>(null);
  const { isAdmin } = useAuth();

  const handleStartEdit = () => {
    setIsEditingRecomendados(true);
    setTempRecomendados([...modelosRecomendados]);
    setModeloSeleccionadoAdmin(null);
  };

  const handleCancelEdit = () => {
    setIsEditingRecomendados(false);
    setTempRecomendados([...modelosRecomendados]);
    setModeloSeleccionadoAdmin(null);
  };

  const handleSaveRecomendados = async () => {
    try {
      const response = await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: subcategoriaId,
          recomendaciones: tempRecomendados.slice(0, 5)
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setModelosRecomendados([...tempRecomendados.slice(0, 5)]);
        setIsEditingRecomendados(false);
        setModeloSeleccionadoAdmin(null);
        
        let mensaje = `${data.count} recomendaciones guardadas exitosamente`;
        if (data.limitado) {
          mensaje += `\n${data.limitado}`;
        }
        alert(mensaje);
      } else {
        throw new Error(data.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar las recomendaciones');
    }
  };

  const handleAddModeloFromListbox = () => {
    if (modeloSeleccionadoAdmin && tempRecomendados.length < 5) {
      const modeloNombre = modeloSeleccionadoAdmin.modelo;
      if (!tempRecomendados.includes(modeloNombre)) {
        setTempRecomendados([...tempRecomendados, modeloNombre]);
      }
      setModeloSeleccionadoAdmin(null);
    }
  };

  const handleAddToRecomendados = (modeloNombre: string) => {
    if (!tempRecomendados.includes(modeloNombre) && tempRecomendados.length < 5) {
      setTempRecomendados([...tempRecomendados, modeloNombre]);
    }
  };

  const handleRemoveFromRecomendados = (modeloNombre: string) => {
    setTempRecomendados(tempRecomendados.filter(m => m !== modeloNombre));
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 font-medium">
          Últimos modelos: ({modelosRecomendados.length}/5)
        </span>
        {isAdmin && (
          <button
            onClick={isEditingRecomendados ? handleCancelEdit : handleStartEdit}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700"
          >
            <PencilIcon className="h-4 w-4" />
            {isEditingRecomendados ? 'Cancelar' : 'Editar'}
          </button>
        )}
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(isEditingRecomendados ? tempRecomendados : modelosRecomendados).map((modeloNombre, index) => {
            const modeloCompleto = modelos.find(m => m.modelo === modeloNombre);
            const displayInfo = modeloCompleto ? formatModeloDisplay(modeloCompleto, esSinDescuento, dolar, getPrecioConDescuento) : null;
            const stockDisponible = modeloCompleto ? getStockDisponible(modeloCompleto, seleccionados) : 0;
            
            return (
              <div key={index} className="relative">
                <button
                  onClick={() => onRecomendadoSelect(modeloNombre)}
                  disabled={isEditingRecomendados || stockDisponible <= 0}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isEditingRecomendados 
                      ? 'bg-gray-100 text-gray-600 cursor-default' 
                      : stockDisponible <= 0
                        ? 'bg-red-50 text-red-400 cursor-not-allowed opacity-50'
                        : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                  }`}
                  title={displayInfo ? `$${displayInfo.precioUsd} USD - $${displayInfo.precioArs.toLocaleString()} ARS - Stock: ${stockDisponible}${displayInfo.esPesificado ? ' (Precio especial)' : ''}${esSinDescuento ? ' (Sin descuento)' : ''}${!esSinDescuento && isDistribuidor() ? ' (con descuento)' : ''}` : ''}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {modeloNombre}
                      {displayInfo?.esPesificado && <span className="ml-1">🏷️</span>}
                      {displayInfo?.esSinDescuento && <span className="ml-1">📦</span>}
                    </span>
                    {displayInfo && !isEditingRecomendados && (
                      <div className="flex flex-col text-xs">
                        <span className="text-pink-600">
                          ${displayInfo.precioUsd} USD
                          {!esSinDescuento && isDistribuidor() && (
                            <span className="ml-1 text-green-600">(-20%)</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
                {isEditingRecomendados && (
                  <button
                    onClick={() => handleRemoveFromRecomendados(modeloNombre)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel de edición para admin */}
        {isEditingRecomendados && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">
                Agregar modelos disponibles: ({tempRecomendados.length}/5)
              </p>
              {tempRecomendados.length >= 5 && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                  Máximo alcanzado
                </span>
              )}
            </div>
            
            {tempRecomendados.length < 5 && (
              <div className="mb-4">
                <Listbox value={modeloSeleccionadoAdmin} onChange={setModeloSeleccionadoAdmin}>
                  <div className="relative">
                    <Listbox.Button className="w-full flex items-center justify-between border border-gray-300 px-4 py-2 rounded bg-white text-left hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200">
                      <span className="block truncate">
                        {modeloSeleccionadoAdmin ? formatModeloDisplay(modeloSeleccionadoAdmin, esSinDescuento, dolar, getPrecioConDescuento).texto : "Seleccionar modelo para agregar"}
                      </span>
                      <span className="pointer-events-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    </Listbox.Button>
                    <Listbox.Options className="absolute z-30 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-full max-h-60 overflow-auto focus:outline-none">
                      {loadingModelos ? (
                        <div className="px-4 py-2 text-gray-500 text-sm italic">
                          Cargando modelos...
                        </div>
                      ) : modelos.length > 0 ? (
                        <div className="grid grid-cols-1 gap-1">
                          {modelos.map((m) => {
                            const displayInfo = formatModeloDisplay(m, esSinDescuento, dolar, getPrecioConDescuento);
                            const stockDisponible = getStockDisponible(m, seleccionados);
                            return (
                              <Listbox.Option 
                                key={m.codigo_interno} 
                                value={m} 
                                className={({ active }) => `
                                  cursor-pointer select-none relative py-2 px-4
                                  ${active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'}
                                  ${tempRecomendados.includes(m.modelo) ? 'opacity-50' : ''}
                                  ${stockDisponible <= 0 ? 'opacity-30' : ''}
                                `}
                                disabled={tempRecomendados.includes(m.modelo)}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-col">
                                    <span className="font-medium">
                                      {displayInfo.marcaModelo}
                                      {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                                      {displayInfo.esSinDescuento && <span className="ml-1">📦</span>}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      {m.modelo}
                                    </span>
                                    {tempRecomendados.includes(m.modelo) && (
                                      <span className="text-xs text-green-600">Ya agregado</span>
                                    )}
                                    {stockDisponible <= 0 && (
                                      <span className="text-xs text-red-600">Sin stock</span>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm font-medium text-green-600">
                                      ${displayInfo.precioUsd} USD
                                      {!esSinDescuento && isDistribuidor() && (
                                        <span className="ml-1 text-xs text-green-700">(-20%)</span>
                                      )}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      ${displayInfo.precioArs.toLocaleString()} ARS
                                      {displayInfo.esPesificado && (
                                        <span className="ml-1 text-orange-600">🏷️</span>
                                      )}
                                      {displayInfo.esSinDescuento && (
                                        <span className="ml-1 text-gray-600">📦</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Listbox.Option>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="px-4 py-2 text-gray-500 text-sm italic">
                          No hay modelos disponibles
                        </div>
                      )}
                    </Listbox.Options>
                  </div>
                </Listbox>
                
                {modeloSeleccionadoAdmin && (
                  <button
                    onClick={handleAddModeloFromListbox}
                    className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    disabled={tempRecomendados.includes(modeloSeleccionadoAdmin.modelo) || tempRecomendados.length >= 5}
                  >
                    {tempRecomendados.includes(modeloSeleccionadoAdmin.modelo) 
                      ? 'Ya está agregado' 
                      : tempRecomendados.length >= 5
                        ? 'Máximo alcanzado (5)'
                        : `Agregar ${modeloSeleccionadoAdmin.modelo}`
                    }
                  </button>
                )}
              </div>
            )}

            {tempRecomendados.length < 5 && !loadingModelos && (
              <div className="flex flex-wrap gap-2 mb-4">
                {modelos.slice(0, 10).map((modelo) => {
                  const displayInfo = formatModeloDisplay(modelo, esSinDescuento, dolar, getPrecioConDescuento);
                  const stockDisponible = getStockDisponible(modelo, seleccionados);
                  return (
                    <button
                      key={modelo.codigo_interno}
                      onClick={() => handleAddToRecomendados(modelo.modelo)}
                      disabled={tempRecomendados.includes(modelo.modelo) || tempRecomendados.length >= 5 || stockDisponible <= 0}
                      className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`$${displayInfo.precioUsd} USD - $${displayInfo.precioArs.toLocaleString()} ARS - Stock: ${stockDisponible}${displayInfo.esPesificado ? ' (Precio especial)' : ''}${esSinDescuento ? ' (Sin descuento)' : ''}${!esSinDescuento && isDistribuidor() ? ' (con descuento)' : ''}`}
                    >
                      + {displayInfo.marcaModelo} (${displayInfo.precioUsd}) Stock: {stockDisponible}
                      {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                      {displayInfo.esSinDescuento && <span className="ml-1">📦</span>}
                    </button>
                  );
                })}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={handleSaveRecomendados}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-green-700"
              >
                Guardar
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}