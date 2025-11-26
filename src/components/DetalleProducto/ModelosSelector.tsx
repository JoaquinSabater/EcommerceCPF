"use client";

import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import { MagnifyingGlassIcon, XMarkIcon, PencilIcon } from "@heroicons/react/24/outline";
import QuantityButton from "@/components/QuantityButton";
import { Articulo } from "@/types/types";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/hooks/useAuth";
import ProductoUnico from "./ProductoUnico"; 


type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

interface ModelosSelectorProps {
  subcategoriaId: number;
  sugerenciaActual?: string;
}

export default function ModelosSelector({ subcategoriaId, sugerenciaActual = '' }: ModelosSelectorProps) {
  const [modelos, setModelos] = useState<Articulo[]>([]);
  const [seleccionados, setSeleccionados] = useState<ModeloSeleccionado[]>([]);
  const [modeloActual, setModeloActual] = useState<Articulo | null>(null);
  const [cantidadActual, setCantidadActual] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [dolar, setDolar] = useState<number>(1);
  const [loadingModelos, setLoadingModelos] = useState<boolean>(true);
  
  const [modelosRecomendados, setModelosRecomendados] = useState<string[]>([]);
  const [isEditingRecomendados, setIsEditingRecomendados] = useState<boolean>(false);
  const [tempRecomendados, setTempRecomendados] = useState<string[]>([]);
  const [modeloSeleccionadoAdmin, setModeloSeleccionadoAdmin] = useState<Articulo | null>(null);
  const [esModoSimple, setEsModoSimple] = useState<boolean>(false);

  const { addToCart } = useCart();
  const { isAdmin, getPrecioConDescuento, isDistribuidor } = useAuth();

  // ✅ NUEVA LÓGICA: Detectar si es categoría "Otros" (electrónica)
  const subcategoriasElectronica = [18, 19, 20, 21];
  const esElectronica = subcategoriasElectronica.includes(subcategoriaId);

  useEffect(() => {
  }, [sugerenciaActual]);

  // ✅ FUNCIÓN MEJORADA: Manejar precios pesificados + electrónica + no descuento + STOCK
  const formatModeloDisplay = (articulo: Articulo) => {
    const marcaModelo = articulo.marca_nombre 
      ? `${articulo.marca_nombre} ${articulo.modelo}` 
      : articulo.modelo;
    
    const precioOriginalUsd = Number(articulo.precio_venta || 0);
    
    // ✅ CAMBIO PRINCIPAL: No aplicar descuento si es electrónica
    const precioConDescuentoUsd = esElectronica 
      ? precioOriginalUsd 
      : getPrecioConDescuento(precioOriginalUsd);
    
    // ✅ CAMBIO: Verificar si es pesificado
    let precioArs: number;
    let esPesificado = false;
    
    if (articulo.es_pesificado === 1 && articulo.precio_pesos && articulo.precio_pesos > 0) {
      const precioOriginalPesos = Number(articulo.precio_pesos);
      
      if (esElectronica) {
        precioArs = Math.round(precioOriginalPesos);
      } else {
        const factorDescuento = precioConDescuentoUsd / precioOriginalUsd;
        precioArs = Math.round(precioOriginalPesos * factorDescuento);
      }
      
      esPesificado = true;
    } else {
      precioArs = Math.round(precioConDescuentoUsd * dolar);
    }

    // ✅ NUEVO: Solo mostrar indicador de disponibilidad limitada (SIN NÚMEROS)
    const stockReal = Number(articulo.stock_real || 0);
    const stockIndicador = stockReal <= 0 ? ' - Sin stock' : stockReal <= 10 ? ' - Últimos disponibles' : '';
    
    return {
      texto: `${marcaModelo} - $${precioConDescuentoUsd.toFixed(2)} USD ($${precioArs.toLocaleString()} ARS${esPesificado ? ' 🏷️' : ''}${esElectronica ? ' ⚡' : ''})${stockIndicador}`,
      marcaModelo: marcaModelo,
      precioUsd: precioConDescuentoUsd,
      precioOriginalUsd: precioOriginalUsd,
      precioArs: precioArs,
      esPesificado: esPesificado,
      esElectronica: esElectronica,
      stockReal: stockReal,
      stockIndicador: stockIndicador
    };
  };

  // ✅ NUEVA FUNCIÓN: Obtener stock disponible considerando los ya seleccionados
  const getStockDisponible = (articulo: Articulo) => {
    const stockTotal = Number(articulo.stock_real || 0);
    const yaSeleccionado = seleccionados.find(s => s.articulo.codigo_interno === articulo.codigo_interno);
    const cantidadSeleccionada = yaSeleccionado ? yaSeleccionado.cantidad : 0;
    return Math.max(0, stockTotal - cantidadSeleccionada);
  };

  // ✅ MODIFICADO: Obtener cotización del dólar correspondiente
  useEffect(() => {
    async function fetchDolar() {
      try {
        // ✅ Usar API correspondiente según tipo de producto
        const endpoint = esElectronica ? '/api/dolar-electronica' : '/api/dolar';
        const res = await fetch(endpoint);
        const data = await res.json();
        setDolar(data.dolar || 1);
        
        console.log(`🟡 Cotización cargada para ${esElectronica ? 'electrónica' : 'general'}:`, data.dolar);
      } catch (e) {
        console.error('Error cargando cotización:', e);
        setDolar(1);
      }
    }
    fetchDolar();
  }, [esElectronica]); // ✅ Recargar si cambia el tipo

  useEffect(() => {
    setLoadingModelos(true);
    
    // Cargar modelos de la subcategoría
    fetch(`/api/articulosPorSubcategoria?subcategoriaId=${subcategoriaId}`)
      .then(res => res.json())
      .then(data => {
        const articulosConStock = (data.articulos || []).filter((a: Articulo) => 
          Number(a.stock_real || 0) > 0
        );
        
        console.log('🟡 Artículos cargados con stock:', articulosConStock.slice(0, 3).map((a: Articulo) => ({
          modelo: a.modelo,
          stock_real: a.stock_real,
          es_pesificado: a.es_pesificado,
          precio_pesos: a.precio_pesos,
          precio_venta: a.precio_venta
        })));
        
        setModelos(data.articulos || []);
        
        setEsModoSimple(articulosConStock.length === 1);
      })
      .catch(error => {
        console.error('Error cargando modelos:', error);
        setModelos([]);
        setEsModoSimple(false);
      })
      .finally(() => {
        setLoadingModelos(false);
      });

    // Cargar recomendaciones desde la BD usando subcategoriaId como itemId
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

    if (esModoSimple) {
      return (
        <ProductoUnico 
          subcategoriaId={subcategoriaId} 
          sugerenciaActual={sugerenciaActual} 
        />
      );
    }

  const modelosDisponibles = modelos.filter(
    (m) => !seleccionados.some((s) => s.articulo.modelo === m.modelo) && Number(m.stock_real || 0) > 0
  );

  // ✅ Buscar tanto en modelo como en marca
  const modelosFiltrados = modelosDisponibles.filter(modelo =>
    modelo.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (modelo.marca_nombre && modelo.marca_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddModelo = () => {
    if (modeloActual && cantidadActual > 0) {
      const stockDisponible = getStockDisponible(modeloActual);
      const cantidadFinal = Math.min(cantidadActual, stockDisponible);
      
      if (cantidadFinal <= 0) {
        alert(`No hay stock suficiente para ${modeloActual.modelo}. Stock disponible: ${stockDisponible}`);
        return;
      }
      
      if (cantidadFinal < cantidadActual) {
        alert(`Solo se pueden agregar ${cantidadFinal} unidades de ${modeloActual.modelo} (stock disponible limitado)`);
      }
      
      setSeleccionados([...seleccionados, { articulo: modeloActual, cantidad: cantidadFinal }]);
      setModeloActual(null);
      setCantidadActual(1);
      setSearchTerm("");
    }
  };

  const handleCantidadChange = (value: number) => {
    if (modeloActual) {
      const stockDisponible = getStockDisponible(modeloActual);
      const cantidadMaxima = Math.min(value, stockDisponible);
      setCantidadActual(cantidadMaxima);
      
      if (value > stockDisponible) {
        console.warn(`Cantidad limitada por stock disponible: ${stockDisponible}`);
      }
    } else {
      setCantidadActual(value);
    }
  };

  const handleRemoveSeleccionado = (modelo: string) => {
    setSeleccionados(seleccionados.filter((s) => s.articulo.modelo !== modelo));
  };

  // ✅ Función modificada para agregar al carrito CON PRECIO ORIGINAL Y VALIDACIÓN DE STOCK
  const handleAddToCart = () => {
    // ✅ VALIDAR STOCK ANTES DE AGREGAR
    for (const { articulo, cantidad } of seleccionados) {
      const stockActual = Number(articulo.stock_real || 0);
      if (cantidad > stockActual) {
        alert(`Error: ${articulo.modelo} tiene solo ${stockActual} unidades en stock, pero intentas agregar ${cantidad}.`);
        return;
      }
    }

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
      
      addToCart(articuloConCantidad, articulo.modelo, cantidad, sugerenciaActual);
    });
    
    const totalOriginalUsd = seleccionados.reduce((sum, { articulo, cantidad }) => 
      sum + (Number(articulo.precio_venta || 0) * cantidad), 0);
    
    // ✅ CAMBIO: No aplicar descuento si es electrónica
    const totalConDescuentoUsd = esElectronica 
      ? totalOriginalUsd 
      : getPrecioConDescuento(totalOriginalUsd);
    
    // ✅ CALCULAR TOTAL EN PESOS CON PESIFICADOS + ELECTRÓNICA
    const totalPesos = seleccionados.reduce((sum, { articulo, cantidad }) => {
      const displayInfo = formatModeloDisplay(articulo);
      return sum + (displayInfo.precioArs * cantidad);
    }, 0);
    
    // ✅ MENSAJE MODIFICADO: Sin descuento para electrónica
    const tieneDescuento = !esElectronica && isDistribuidor();
    const tipoProducto = esElectronica ? ' (Electrónica)' : '';
    
    const mensajeConSugerencia = sugerenciaActual 
      ? `Se agregaron ${seleccionados.length} modelo(s) al carrito con sugerencias especiales${tipoProducto}. Total: $${Math.round(totalPesos).toLocaleString()} ARS${tieneDescuento ? ' (con descuento distribuidor)' : ''}`
      : `Se agregaron ${seleccionados.length} modelo(s) al carrito${tipoProducto}. Total: $${Math.round(totalPesos).toLocaleString()} ARS${tieneDescuento ? ' (con descuento distribuidor)' : ''}`;
      
    alert(mensajeConSugerencia);
    setSeleccionados([]);
  };

  const handleSearchSelect = (modelo: Articulo) => {
    setModeloActual(modelo);
    setSearchTerm("");
    setIsSearchFocused(false);
    // ✅ NUEVO: Ajustar cantidad si excede el stock
    const stockDisponible = getStockDisponible(modelo);
    if (cantidadActual > stockDisponible) {
      setCantidadActual(Math.max(1, stockDisponible));
    }
  };

  // Función para seleccionar modelo recomendado
  const handleRecomendadoSelect = (modeloNombre: string) => {
    const modeloEncontrado = modelos.find(m => m.modelo === modeloNombre);
    if (modeloEncontrado) {
      const stockDisponible = getStockDisponible(modeloEncontrado);
      if (stockDisponible > 0) {
        setModeloActual(modeloEncontrado);
        setCantidadActual(1);
      } else {
        alert(`${modeloNombre} no tiene stock disponible`);
      }
    }
  };

  // ... (mantener todas las funciones de admin existentes sin cambios)
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
      <h3 className="text-lg font-bold mb-3 text-gray-800">
        Selección de modelos
        {!esElectronica && isDistribuidor() && (
          <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
            20% OFF Distribuidor 🎉
          </span>
        )}
        {esElectronica && (
          <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            Electrónica ⚡
          </span>
        )}
        {sugerenciaActual && (
          <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
            Con sugerencias especiales ✨
          </span>
        )}
      </h3>
      
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
            {(isEditingRecomendados ? tempRecomendados : modelosRecomendados).map((modeloNombre, index) => {
              const modeloCompleto = modelos.find(m => m.modelo === modeloNombre);
              const displayInfo = modeloCompleto ? formatModeloDisplay(modeloCompleto) : null;
              const stockDisponible = modeloCompleto ? getStockDisponible(modeloCompleto) : 0;
              
              return (
                <div key={index} className="relative">
                  <button
                    onClick={() => handleRecomendadoSelect(modeloNombre)}
                    disabled={isEditingRecomendados || stockDisponible <= 0}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      isEditingRecomendados 
                        ? 'bg-gray-100 text-gray-600 cursor-default' 
                        : stockDisponible <= 0
                          ? 'bg-red-50 text-red-400 cursor-not-allowed opacity-50'
                          : 'bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200'
                    }`}
                    title={displayInfo ? `$${displayInfo.precioUsd} USD - $${displayInfo.precioArs.toLocaleString()} ARS - Stock: ${stockDisponible}${displayInfo.esPesificado ? ' (Precio especial)' : ''}${displayInfo.esElectronica ? ' (Electrónica)' : ''}${!esElectronica && isDistribuidor() ? ' (con descuento)' : ''}` : ''}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">
                        {modeloNombre}
                        {displayInfo?.esPesificado && <span className="ml-1">🏷️</span>}
                        {displayInfo?.esElectronica && <span className="ml-1">⚡</span>}
                      </span>
                      {displayInfo && !isEditingRecomendados && (
                        <div className="flex flex-col text-xs">
                          <span className="text-pink-600">
                            ${displayInfo.precioUsd} USD
                            {!esElectronica && isDistribuidor() && (
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
                          {modeloSeleccionadoAdmin ? formatModeloDisplay(modeloSeleccionadoAdmin).texto : "Seleccionar modelo para agregar"}
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
                              const displayInfo = formatModeloDisplay(m);
                              const stockDisponible = getStockDisponible(m);
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
                                        {displayInfo.esElectronica && <span className="ml-1">⚡</span>}
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
                                        {!esElectronica && isDistribuidor() && (
                                          <span className="ml-1 text-xs text-green-700">(-20%)</span>
                                        )}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        ${displayInfo.precioArs.toLocaleString()} ARS
                                        {displayInfo.esPesificado && (
                                          <span className="ml-1 text-orange-600">🏷️</span>
                                        )}
                                        {displayInfo.esElectronica && (
                                          <span className="ml-1 text-blue-600">⚡</span>
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
                    const displayInfo = formatModeloDisplay(modelo);
                    const stockDisponible = getStockDisponible(modelo);
                    return (
                      <button
                        key={modelo.codigo_interno}
                        onClick={() => handleAddToRecomendados(modelo.modelo)}
                        disabled={tempRecomendados.includes(modelo.modelo) || tempRecomendados.length >= 5 || stockDisponible <= 0}
                        className="px-2 py-1 text-xs bg-gray-100 border border-gray-300 text-gray-700 rounded hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`$${displayInfo.precioUsd} USD - $${displayInfo.precioArs.toLocaleString()} ARS - Stock: ${stockDisponible}${displayInfo.esPesificado ? ' (Precio especial)' : ''}${displayInfo.esElectronica ? ' (Electrónica)' : ''}${!esElectronica && isDistribuidor() ? ' (con descuento)' : ''}`}
                      >
                        + {displayInfo.marcaModelo} (${displayInfo.precioUsd}) Stock: {stockDisponible}
                        {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                        {displayInfo.esElectronica && <span className="ml-1">⚡</span>}
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
            {loadingModelos ? (
              <div className="px-4 py-2 text-gray-500 text-sm italic">
                Cargando modelos...
              </div>
            ) : modelosFiltrados.length > 0 ? (
              <div className="grid grid-cols-1 gap-1 py-1">
                {modelosFiltrados.slice(0, 20).map((modelo) => {
                  const displayInfo = formatModeloDisplay(modelo);
                  const stockDisponible = getStockDisponible(modelo);
                  return (
                    <button
                      key={modelo.codigo_interno}
                      onClick={() => handleSearchSelect(modelo)}
                      disabled={stockDisponible <= 0}
                      className={`cursor-pointer select-none relative py-2 px-4 hover:bg-orange-100 hover:text-orange-900 transition-colors text-left ${stockDisponible <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900">
                            {displayInfo.marcaModelo}
                            {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                            {displayInfo.esElectronica && <span className="ml-1">⚡</span>}
                          </span>
                          <span className="text-sm text-gray-500">
                            {modelo.modelo}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">
                            ${displayInfo.precioUsd} USD
                            {!esElectronica && isDistribuidor() && (
                              <span className="ml-1 text-xs text-green-700">(-20%)</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${displayInfo.precioArs.toLocaleString()} ARS
                            {displayInfo.esPesificado && (
                              <span className="ml-1 text-orange-600">🏷️</span>
                            )}
                            {displayInfo.esElectronica && (
                              <span className="ml-1 text-blue-600">⚡</span>
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

      {/* Selector de modelo y cantidad */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <Listbox value={modeloActual} onChange={setModeloActual}>
          <div className="relative flex-1">
            <Listbox.Button className="w-full flex items-center justify-between border border-gray-300 px-4 py-2 rounded bg-white text-left hover:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-200">
              <span className="block truncate">
                {modeloActual ? formatModeloDisplay(modeloActual).texto : "Elegí un modelo"}
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
                        const displayInfo = formatModeloDisplay(m);
                        const stockDisponible = getStockDisponible(m);
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
                                  {displayInfo.esElectronica && <span className="ml-1">⚡</span>}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {m.modelo}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-green-600">
                                  ${displayInfo.precioUsd} USD
                                  {!esElectronica && isDistribuidor() && (
                                    <span className="ml-1 text-xs text-green-700">(-20%)</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ${displayInfo.precioArs.toLocaleString()} ARS
                                  {displayInfo.esPesificado && (
                                    <span className="ml-1 text-orange-600">🏷️</span>
                                  )}
                                  {displayInfo.esElectronica && (
                                    <span className="ml-1 text-blue-600">⚡</span>
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
                  const stockDisponible = getStockDisponible(modeloActual);
                  if (cantidadActual < stockDisponible) {
                    setCantidadActual(cantidadActual + 1);
                  }
                }}
                onRemove={() => setCantidadActual(Math.max(1, cantidadActual - 1))}
                onSet={handleCantidadChange}
                modelo={modeloActual.modelo}
                hideModelo={true}
                size="normal"
                maxStock={getStockDisponible(modeloActual)} // ✅ NUEVO: Pasar stock máximo
              />
            </div>
            <button
              className="flex-1 text-white px-4 py-2 rounded font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#ea580c' }}
              onClick={handleAddModelo}
              disabled={getStockDisponible(modeloActual) <= 0}
            >
              {getStockDisponible(modeloActual) <= 0 ? 'Sin stock' : 'Añadir modelo'}
            </button>
          </div>
        )}
      </div>

      {/* Lista de modelos seleccionados */}
      {seleccionados.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-700 mb-2">Modelos seleccionados:</h4>
          <div className={`flex flex-col gap-2 ${seleccionados.length > 3 ? "max-h-48 overflow-y-auto pr-1" : ""}`}>
            {seleccionados.map((s) => {
              const displayInfo = formatModeloDisplay(s.articulo);
              const subtotalArs = displayInfo.precioArs * s.cantidad;
              
              return (
                <div key={s.articulo.codigo_interno} className="flex items-center gap-3 border border-gray-200 rounded px-3 py-2 bg-gray-50 hover:bg-gray-100">
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium text-gray-800">
                          {displayInfo.marcaModelo}
                          {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                          {displayInfo.esElectronica && <span className="ml-1">⚡</span>}
                        </span>
                        <div className="text-sm text-gray-600">
                          Cantidad: {s.cantidad} x ${displayInfo.precioUsd} USD
                          {!esElectronica && isDistribuidor() && (
                            <span className="ml-1 text-green-600 text-xs">(-20%)</span>
                          )}
                          {displayInfo.esPesificado && (
                            <span className="ml-1 text-orange-600 text-xs">(Precio especial)</span>
                          )}
                          {displayInfo.esElectronica && (
                            <span className="ml-1 text-blue-600 text-xs">(Electrónica)</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-green-600">
                          ${(displayInfo.precioUsd * s.cantidad).toFixed(2)} USD
                          {!esElectronica && isDistribuidor() && (
                            <span className="ml-1 text-xs text-green-700">(-20%)</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${Math.round(subtotalArs).toLocaleString()} ARS
                          {displayInfo.esPesificado && (
                            <span className="ml-1 text-orange-600">🏷️</span>
                          )}
                          {displayInfo.esElectronica && (
                            <span className="ml-1 text-blue-600">⚡</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700 hover:underline text-sm font-medium"
                    onClick={() => handleRemoveSeleccionado(s.articulo.modelo)}
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
                    const displayInfo = formatModeloDisplay(s.articulo);
                    return sum + (displayInfo.precioUsd * s.cantidad);
                  }, 0).toFixed(2)} USD
                  {!esElectronica && isDistribuidor() && (
                    <span className="ml-1 text-xs text-green-700">(-20%)</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  ${Math.round(seleccionados.reduce((sum, s) => {
                    const displayInfo = formatModeloDisplay(s.articulo);
                    return sum + (displayInfo.precioArs * s.cantidad);
                  }, 0)).toLocaleString()} ARS
                  {seleccionados.some(s => formatModeloDisplay(s.articulo).esPesificado) && (
                    <span className="ml-1 text-orange-600">🏷️</span>
                  )}
                  {esElectronica && (
                    <span className="ml-1 text-blue-600">⚡</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón añadir al carrito */}
      <button
        className="mt-2 text-white px-6 py-3 rounded font-bold w-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        style={{ backgroundColor: '#ea580c' }}
        disabled={seleccionados.length === 0}
        onClick={handleAddToCart}
      >
        {seleccionados.length > 0 
          ? `Añadir ${seleccionados.length} modelo(s) al carrito${esElectronica ? ' (Electrónica)' : ''}${sugerenciaActual ? ' con sugerencias ✨' : ''}${!esElectronica && isDistribuidor() ? ' (20% OFF)' : ''}` 
          : 'Añadir al carrito'
        }
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