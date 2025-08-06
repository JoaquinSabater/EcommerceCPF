"use client";

import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";
import QuantityButton from "@/components/QuantityButton";
import { Articulo } from "@/types/types";
import { useCart } from "@/components/CartContext";

type ModeloSeleccionado = {
  articulo: Articulo;
  cantidad: number;
};

export default function ModelosSelector({ subcategoriaId }: { subcategoriaId: number }) {
  const [modelos, setModelos] = useState<Articulo[]>([]);
  const [seleccionados, setSeleccionados] = useState<ModeloSeleccionado[]>([]);
  const [modeloActual, setModeloActual] = useState<Articulo | null>(null);
  const [cantidadActual, setCantidadActual] = useState<number>(1);

  const { addToCart } = useCart();

  useEffect(() => {
    fetch(`/api/articulosPorSubcategoria?subcategoriaId=${subcategoriaId}`)
      .then(res => res.json())
      .then(data => {
        setModelos(data.articulos || []);
      });
  }, [subcategoriaId]);

  // Modelos disponibles para elegir (no repetidos)
  const modelosDisponibles = modelos.filter(
    (m) => !seleccionados.some((s) => s.articulo.modelo === m.modelo)
  );

  const handleAddModelo = () => {
    if (modeloActual && cantidadActual > 0) {
      setSeleccionados([...seleccionados, { articulo: modeloActual, cantidad: cantidadActual }]);
      setModeloActual(null);
      setCantidadActual(1);
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
      // Verificamos que el precio_venta exista y sea un número
      if (!articulo.precio_venta || isNaN(Number(articulo.precio_venta))) {
        console.warn(`Artículo sin precio válido: ${articulo.modelo}`);
        // Si no tiene precio, le asignamos un valor por defecto o lo obtenemos de la API
        articulo.precio_venta = 0; // Aquí podrías hacer un fetch para obtener el precio real
      }
      
      // Creamos una copia completa del artículo
      const articuloConCantidad = {
        ...articulo,
        cantidad: cantidad,
        precio_venta: Number(articulo.precio_venta) // Aseguramos que sea número
      };
      
      console.log("Añadiendo al carrito:", articuloConCantidad); // Para debuggear
      addToCart(articuloConCantidad, articulo.modelo, cantidad);
    });
    
    // Feedback visual (mejorado)
    const total = seleccionados.reduce((sum, { articulo, cantidad }) => 
      sum + (Number(articulo.precio_venta || 0) * cantidad), 0);
      
    alert(`Se agregaron ${seleccionados.length} modelo(s) al carrito. Total: $${total.toFixed(2)}`);
    
    // Limpiar selección
    setSeleccionados([]);
  };

  const chunkModelos = () => {
    const chunks = [];
    for (let i = 0; i < modelosDisponibles.length; i += 5) {
      chunks.push(modelosDisponibles.slice(i, i + 5));
    }
    return chunks;
  };

  const modelosChunks = chunkModelos();

  return (
    <div className="w-full mt-4 rounded-lg bg-white shadow-sm p-4">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Selección de modelos</h3>
      
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
              {modelosDisponibles.length > 0 ? (
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
                <div className="px-4 py-2 text-gray-500 text-sm italic">No hay más modelos</div>
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
    </div>
  );
}