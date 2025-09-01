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
  const [dolar, setDolar] = useState<number>(1);
  
  // Estados para recomendaciones (máximo 5)
  const [modelosRecomendados, setModelosRecomendados] = useState<string[]>([]);
  const [isEditingRecomendados, setIsEditingRecomendados] = useState<boolean>(false);
  const [tempRecomendados, setTempRecomendados] = useState<string[]>([]);
  const [modeloSeleccionadoAdmin, setModeloSeleccionadoAdmin] = useState<Articulo | null>(null);

  const { addToCart } = useCart();
  const { isAdmin } = useAuth();

  // ✅ Función helper para mostrar marca + modelo
  const formatModeloDisplay = (articulo: Articulo) => {
    if (articulo.marca_nombre) {
      return `${articulo.marca_nombre} ${articulo.modelo}`;
    }
    return articulo.modelo;
  };

  // ✅ Obtener cotización del dólar
  useEffect(() => {
    async function fetchDolar() {
      try {
        const res = await fetch('/api/dolar');
        const data = await res.json();
        setDolar(data.dolar || 1);
      } catch (e) {
        setDolar(1);
      }
    }
    fetchDolar();
  }, []);

  useEffect(() => {
    // Cargar modelos de la subcategoría
    fetch(`/api/articulosPorSubcategoria?subcategoriaId=${subcategoriaId}`)
      .then(res => res.json())
      .then(data => {
        setModelos(data.articulos || []);
      });

    // ✅ Cargar recomendaciones desde la BD usando subcategoriaId como itemId
    fetch(`/api/recomendaciones?itemId=${subcategoriaId}`)
      .then(res => res.json())
      .then(data => {
        const recomendaciones = data.recomendaciones || [];
        setModelosRecomendados(recomendaciones);
        setTempRecomendados(recomendaciones);
      })
      .catch(() => {
        // Fallback a recomendaciones por defecto (máximo 5)
        const recomendacionesDefault = ["A25", "A15", "G04", "G14", "EDGE 50 ULTRA"];
        setModelosRecomendados(recomendacionesDefault);
        setTempRecomendados(recomendacionesDefault);
      });
  }, [subcategoriaId]);

  const modelosDisponibles = modelos.filter(
    (m) => !seleccionados.some((s) => s.articulo.modelo === m.modelo)
  );

  // ✅ Buscar tanto en modelo como en marca
  const modelosFiltrados = modelosDisponibles.filter(modelo =>
    modelo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (modelo.marca_nombre && modelo.marca_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
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
    
    // ✅ Calcular total en pesos
    const totalUsd = seleccionados.reduce((sum, { articulo, cantidad }) => 
      sum + (Number(articulo.precio_venta || 0) * cantidad), 0);
    const totalPesos = totalUsd * dolar;
      
    alert(`Se agregaron ${seleccionados.length} modelo(s) al carrito. Total: $${Math.round(totalPesos).toLocaleString()} ARS`);
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
    setModeloSeleccionadoAdmin(null);
  };

  const handleCancelEdit = () => {
    setIsEditingRecomendados(false);
    setTempRecomendados([...modelosRecomendados]);
    setModeloSeleccionadoAdmin(null);
  };

  // ✅ Función para guardar hasta 5 recomendaciones en la BD
  const handleSaveRecomendados = async () => {
    try {
      const response = await fetch('/api/recomendaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: subcategoriaId, // ✅ Usar subcategoriaId como itemId
          recomendaciones: tempRecomendados.slice(0, 5) // ✅ Limitar a 5
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

  // ✅ Función para agregar modelo seleccionado del Listbox (máximo 5)
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
      
      {/* Sección de últimos modelos recomendados (máximo 5) */}
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
              
              {/* ✅ Listbox para seleccionar modelos (solo si no se alcanzó el máximo) */}
              {tempRecomendados.length < 5 && (
                <div className="mb-4">
                  <Listbox value={modeloSeleccionadoAdmin} onChange={setModeloSeleccionadoAdmin}>
                    <div className="relative">
                      <Listbox.Button className="w-full flex items-center justify-between border border-gray-300 px-4 py-2 rounded bg-white text-left hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200">
                        <span className="block truncate">
                          {modeloSeleccionadoAdmin ? formatModeloDisplay(modeloSeleccionadoAdmin) : "Seleccionar modelo para agregar"}
                        </span>
                        <span className="pointer-events-none">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </span>
                      </Listbox.Button>
                      <Listbox.Options className="absolute z-30 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-full max-h-60 overflow-auto focus:outline-none">
                        {modelos.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                            {chunkModelos(modelos).map((chunk, chunkIndex) => (
                              <div key={chunkIndex} className="flex flex-col">
                                {chunk.map((m) => (
                                  <Listbox.Option 
                                    key={m.modelo} 
                                    value={m} 
                                    className={({ active }) => `
                                      cursor-pointer select-none relative py-2 px-4
                                      ${active ? 'bg-orange-100 text-orange-900' : 'text-gray-900'}
                                      ${tempRecomendados.includes(m.modelo) ? 'opacity-50' : ''}
                                    `}
                                    disabled={tempRecomendados.includes(m.modelo)}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {formatModeloDisplay(m)}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        {m.modelo}
                                      </span>
                                      {tempRecomendados.includes(m.modelo) && (
                                        <span className="text-xs text-green-600">Ya agregado</span>
                                      )}
                                    </div>
                                  </Listbox.Option>
                                ))}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-2 text-gray-500 text-sm italic">
                            No hay modelos disponibles
                          </div>
                        )}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                  
                  {/* Botón para agregar el modelo seleccionado */}
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

              {/* Botones de rápida selección (solo si no se alcanzó el máximo) */}
              {tempRecomendados.length < 5 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {modelos.slice(0, 10).map((modelo) => (
                    <button
                      key={modelo.modelo}
                      onClick={() => handleAddToRecomendados(modelo.modelo)}
                      disabled={tempRecomendados.includes(modelo.modelo) || tempRecomendados.length >= 5}
                      className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + {formatModeloDisplay(modelo)}
                    </button>
                  ))}
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

      {/* Buscador */}
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
            {modelosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1 py-1">
                {chunkModelos(modelosFiltrados.slice(0, 20)).map((chunk, chunkIndex) => (
                  <div key={chunkIndex} className="flex flex-col">
                    {chunk.map((modelo) => (
                      <button
                        key={modelo.modelo}
                        onClick={() => handleSearchSelect(modelo)}
                        className="cursor-pointer select-none relative py-2 px-4 hover:bg-orange-100 hover:text-orange-900 transition-colors text-left"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {formatModeloDisplay(modelo)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {modelo.modelo}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
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

      {/* Selector de modelo y cantidad */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <Listbox value={modeloActual} onChange={setModeloActual}>
          <div className="relative flex-1">
            <Listbox.Button className="w-full flex items-center justify-between border border-gray-300 px-4 py-2 rounded bg-white text-left hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200">
              <span className="block truncate">
                {modeloActual ? formatModeloDisplay(modeloActual) : "Elegí un modelo"}
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
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {formatModeloDisplay(m)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {m.modelo}
                            </span>
                          </div>
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
                <div className="flex-1">
                  <span className="font-medium text-gray-800">
                    {formatModeloDisplay(s.articulo)}
                  </span>
                  <span className="text-gray-600 text-sm ml-2">
                    Cantidad: {s.cantidad}
                  </span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 hover:underline text-sm font-medium"
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

      {isSearchFocused && searchTerm && (
        <div 
          className="fixed inset-0 z-10" 
          onClick={() => setIsSearchFocused(false)}
        />
      )}
    </div>
  );
}