"use client";

import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
import QuantityButton from "@/components/QuantityButton";
import { Articulo } from "@/types/types";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/hooks/useAuth";

type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

export default function ModelosSelector({ subcategoriaId }: { subcategoriaId: number }) {
  const [modelos, setModelos] = useState<Articulo[]>([]);
  const [seleccionados, setSeleccionados] = useState<ModeloSeleccionado[]>([]);
  const [modeloActual, setModeloActual] = useState<Articulo | null>(null);
  const [cantidadActual, setCantidadActual] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  
  // Estados para recomendaciones
  const [modelosRecomendados, setModelosRecomendados] = useState<string[]>([]);
  const [isEditingRecomendados, setIsEditingRecomendados] = useState<boolean>(false);
  const [tempRecomendados, setTempRecomendados] = useState<string[]>([]);

  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  useEffect(() => {
    // Cargar modelos de la subcategoría (consulta existente)
    fetch(`/api/articulosPorSubcategoria?subcategoriaId=${subcategoriaId}`)
      .then(res => res.json())
      .then(data => {
        setModelos(data.articulos || []);
      });

    // Cargar recomendaciones (hardcodeadas por ahora)
    const recomendacionesDefault = ["A25", "A15", "G04", "G14", "EDGE 50 ULTRA"];
    setModelosRecomendados(recomendacionesDefault);
    setTempRecomendados(recomendacionesDefault);
  }, [subcategoriaId]);

  const modelosDisponibles = modelos.filter(
    (m) => !seleccionados.some((s) => s.articulo.modelo === m.modelo)
  );

  const modelosFiltrados = modelosDisponibles.filter(modelo =>
    modelo.modelo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddModelo = () => {
    if (modeloActual && cantidadActual > 0) {
      setSeleccionados([...seleccionados, { articulo: modeloActual, cantidad: cantidadActual }]);
      setModeloActual(null);
      setCantidadActual(1);
      setSearchTerm("");
    }
  };

  const handleCantidadChange = (value: number) => {
    setCantidadActual(value);
  };

  const handleRemoveSeleccionado = (modelo: string) => {
    setSeleccionados(seleccionados.filter((s) => s.articulo.modelo !== modelo));
  };

  const handleAddToCart = () => {
    seleccionados.forEach(({ articulo, cantidad }) => {
      if (!articulo.precio_venta || isNaN(Number(articulo.precio_venta))) {
        console.warn(`Artículo sin precio válido: ${articulo.modelo}`);
        articulo.precio_venta = 0;
      }
      
      const articuloConCantidad = {
        ...articulo,
        cantidad: cantidad,
        precio_venta: Number(articulo.precio_venta)
      };
      
      addToCart(articuloConCantidad, articulo.modelo, cantidad);
    });
    
    const total = seleccionados.reduce((sum, { articulo, cantidad }) => 
      sum + (Number(articulo.precio_venta || 0) * cantidad), 0);
      
    alert(`Se agregaron ${seleccionados.length} modelo(s) al carrito. Total: $${total.toFixed(2)}`);
    setSeleccionados([]);
  };

  const handleSearchSelect = (modelo: Articulo) => {
    setModeloActual(modelo);
    setSearchTerm("");
    setIsSearchFocused(false);
  };

  // Función para seleccionar modelo recomendado
  const handleRecomendadoSelect = (modeloNombre: string) => {
    const modeloEncontrado = modelos.find(m => m.modelo === modeloNombre);
    if (modeloEncontrado) {
      setModeloActual(modeloEncontrado);
      setCantidadActual(1);
    }
  };

  // Funciones de admin para recomendaciones
  const handleStartEdit = () => {
    setIsEditingRecomendados(true);
    setTempRecomendados([...modelosRecomendados]);
  };

  const handleCancelEdit = () => {
    setIsEditingRecomendados(false);
    setTempRecomendados([...modelosRecomendados]);
  };

  const handleSaveRecomendados = () => {
    setModelosRecomendados([...tempRecomendados]);
    setIsEditingRecomendados(false);
    // Aquí podrías agregar la llamada a la API para guardar en BD
    alert('Recomendaciones guardadas exitosamente');
  };

  const handleAddToRecomendados = (modeloNombre: string) => {
    if (!tempRecomendados.includes(modeloNombre)) {
      setTempRecomendados([...tempRecomendados, modeloNombre]);
    }
  };

  const handleRemoveFromRecomendados = (modeloNombre: string) => {
    setTempRecomendados(tempRecomendados.filter(m => m !== modeloNombre));
  };

  const clearSearch = () => {
    setSearchTerm("");
    setIsSearchFocused(false);
  };

  const chunkModelos = (modelosArray: Articulo[]) => {
    const chunks = [];
    for (let i = 0; i < modelosArray.length; i += 5) {
      chunks.push(modelosArray.slice(i, i + 5));
    }
    return chunks;
  };

  const modelosChunks = chunkModelos(modelosFiltrados);

  return (
    <div className="w-full mt-4 rounded-lg bg-white shadow-sm p-4">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Selección de modelos</h3>
      
      {/* Sección de últimos modelos recomendados */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-600 font-medium">Últimos modelos:</span>
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
            {(isEditingRecomendados ? tempRecomendados : modelosRecomendados).map((modeloNombre, index) => (
              <div key={index} className="relative">
                <button
                  onClick={() => handleRecomendadoSelect(modeloNombre)}
                  disabled={isEditingRecomendados}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    isEditingRecomendados 
                      ? 'bg-gray-100 text-gray-600 cursor-default' 
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                  }`}
                >
                  {modeloNombre}
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
            ))}
          </div>

          {/* Panel de edición para admin */}
          {isEditingRecomendados && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-3">Agregar modelos disponibles:</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {modelos.slice(0, 15).map((modelo) => (
                  <button
                    key={modelo.modelo}
                    onClick={() => handleAddToRecomendados(modelo.modelo)}
                    disabled={tempRecomendados.includes(modelo.modelo)}
                    className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + {modelo.modelo}
                  </button>
                ))}
              </div>
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

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar modelo..."
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
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {modelosFiltrados.length > 0 ? (
              <div className="py-1">
                {modelosFiltrados.slice(0, 10).map((modelo) => (
                  <button
                    key={modelo.modelo}
                    onClick={() => handleSearchSelect(modelo)}
                    className="w-full text-left px-4 py-2 hover:bg-orange-50 hover:text-orange-900 transition-colors"
                  >
                    <span className="block truncate">{modelo.modelo}</span>
                  </button>
                ))}
                {modelosFiltrados.length > 10 && (
                  <div className="px-4 py-2 text-sm text-gray-500 border-t">
                    Y {modelosFiltrados.length - 10} modelos más...
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-2 text-gray-500 text-sm italic">
                No se encontraron modelos
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selector de modelo y cantidad */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <Listbox value={modeloActual} onChange={setModeloActual}>
          <div className="relative flex-1">
            <Listbox.Button className="w-full flex items-center justify-between border border-gray-300 px-4 py-2 rounded bg-white text-left hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200">
              <span className="block truncate">
                {modeloActual ? modeloActual.modelo : "Elegí un modelo"}
              </span>
              <span className="pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
            </Listbox.Button>
            <Listbox.Options className="absolute z-10 bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg w-full max-h-60 overflow-auto focus:outline-none">
              {modelosFiltrados.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                  {modelosChunks.map((chunk, chunkIndex) => (
                    <div key={chunkIndex} className="flex flex-col">
                      {chunk.map((m) => (
                        <Listbox.Option 
                          key={m.modelo} 
                          value={m} 
                          className={({ active }) => `
                            cursor-pointer select-none relative py-2 px-4
                            ${active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'}
                          `}
                        >
                          {m.modelo}
                        </Listbox.Option>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm italic">
                  {searchTerm ? 'No hay modelos que coincidan' : 'No hay más modelos'}
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
                onAdd={() => setCantidadActual(cantidadActual + 1)}
                onRemove={() => setCantidadActual(Math.max(1, cantidadActual - 1))}
                onSet={handleCantidadChange}
                modelo={modeloActual.modelo}
                hideModelo={true}
                size="normal"
              />
            </div>
            <button
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded font-semibold transition-colors"
              onClick={handleAddModelo}
            >
              Añadir modelo
            </button>
          </div>
        )}
      </div>

      {/* Lista de modelos seleccionados */}
      {seleccionados.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Modelos seleccionados:</h4>
          <div className={`flex flex-col gap-2 ${seleccionados.length > 3 ? "max-h-48 overflow-y-auto pr-1" : ""}`}>
            {seleccionados.map((s) => (
              <div key={s.articulo.modelo} className="flex items-center gap-3 border border-gray-200 rounded px-3 py-2 bg-gray-50 hover:bg-gray-100">
                <span className="font-medium text-gray-800">{s.articulo.modelo}</span>
                <span className="text-gray-600 text-sm">Cantidad: {s.cantidad}</span>
                <button
                  className="ml-auto text-red-500 hover:text-red-700 hover:underline text-sm font-medium"
                  onClick={() => handleRemoveSeleccionado(s.articulo.modelo)}
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón añadir al carrito */}
      <button
        className="mt-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded font-bold w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        disabled={seleccionados.length === 0}
        onClick={handleAddToCart}
      >
        {seleccionados.length > 0 ? `Añadir ${seleccionados.length} modelo(s) al carrito` : 'Añadir al carrito'}
      </button>

      {/* Overlay para cerrar búsqueda al hacer clic fuera */}
      {isSearchFocused && searchTerm && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsSearchFocused(false)}
        />
      )}
    </div>
  );
}