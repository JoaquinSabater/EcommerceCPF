"use client";

import { useState, useEffect } from "react";
import QuantityButton from "@/components/QuantityButton";
import { Articulo } from "@/types/types";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/hooks/useAuth";

interface ProductoUnicoProps {
  subcategoriaId: number;
  sugerenciaActual?: string;
}

export default function ProductoUnico({ subcategoriaId, sugerenciaActual = '' }: ProductoUnicoProps) {
  const [articulo, setArticulo] = useState<Articulo | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [dolar, setDolar] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const { addToCart } = useCart();
  const { getPrecioConDescuento, isDistribuidor } = useAuth();

  // ✅ Detectar si es categoría "Otros" (electrónica)
  const subcategoriasElectronica = [18, 19, 20, 21];
  const esElectronica = subcategoriasElectronica.includes(subcategoriaId);

  // ✅ Función para formatear precios (igual que en ModelosSelector)
  const formatModeloDisplay = (articulo: Articulo) => {
    const marcaModelo = articulo.marca_nombre 
      ? `${articulo.marca_nombre} ${articulo.modelo}` 
      : articulo.modelo;
    
    const precioOriginalUsd = Number(articulo.precio_venta || 0);
    const precioConDescuentoUsd = esElectronica 
      ? precioOriginalUsd 
      : getPrecioConDescuento(precioOriginalUsd);
    
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

    return {
      marcaModelo: marcaModelo,
      precioUsd: precioConDescuentoUsd,
      precioOriginalUsd: precioOriginalUsd,
      precioArs: precioArs,
      esPesificado: esPesificado,
      esElectronica: esElectronica,
      stockReal: Number(articulo.stock_real || 0)
    };
  };

  // ✅ Cargar cotización del dólar
  useEffect(() => {
    async function fetchDolar() {
      try {
        const endpoint = esElectronica ? '/api/dolar-electronica' : '/api/dolar';
        const res = await fetch(endpoint);
        const data = await res.json();
        setDolar(data.dolar || 1);
      } catch (e) {
        console.error('Error cargando cotización:', e);
        setDolar(1);
      }
    }
    fetchDolar();
  }, [esElectronica]);

  // ✅ Cargar el artículo único
  useEffect(() => {
    setLoading(true);
    
    fetch(`/api/articulosPorSubcategoria?subcategoriaId=${subcategoriaId}`)
      .then(res => res.json())
      .then(data => {
        const articulosConStock = (data.articulos || []).filter((a: Articulo) => 
          Number(a.stock_real || 0) > 0
        );
        
        if (articulosConStock.length === 1) {
          setArticulo(articulosConStock[0]);
        }
      })
      .catch(error => {
        console.error('Error cargando artículo:', error);
        setArticulo(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [subcategoriaId]);

  // ✅ Manejar cambio de cantidad
  const handleCantidadChange = (value: number) => {
    if (articulo) {
      const stockDisponible = Number(articulo.stock_real || 0);
      const cantidadFinal = Math.min(value, stockDisponible);
      setCantidad(Math.max(1, cantidadFinal));
    }
  };

  // ✅ Agregar al carrito
  const handleAddToCart = () => {
    if (articulo && cantidad > 0) {
      const stockDisponible = Number(articulo.stock_real || 0);
      const cantidadFinal = Math.min(cantidad, stockDisponible);
      
      if (cantidadFinal <= 0) {
        return;
      }
      
      const articuloConCantidad = {
        ...articulo,
        cantidad: cantidadFinal,
        precio_venta: Number(articulo.precio_venta)
      };
      
      addToCart(articuloConCantidad, articulo.modelo, cantidadFinal, sugerenciaActual);
      
      const displayInfo = formatModeloDisplay(articulo);
      const totalArs = displayInfo.precioArs * cantidadFinal;
      
      const tieneDescuento = !esElectronica && isDistribuidor();
      const tipoProducto = esElectronica ? ' (Electrónica)' : '';
      
      const mensaje = sugerenciaActual 
        ? `✅ Se agregó ${articulo.modelo} al carrito con sugerencias especiales${tipoProducto}. Total: $${Math.round(totalArs).toLocaleString()} ARS${tieneDescuento ? ' (con descuento distribuidor)' : ''}`
        : `✅ Se agregó ${articulo.modelo} al carrito${tipoProducto}. Total: $${Math.round(totalArs).toLocaleString()} ARS${tieneDescuento ? ' (con descuento distribuidor)' : ''}`;
        
      alert(mensaje);
      setCantidad(1);
    }
  };

  if (loading) {
    return (
      <div className="w-full mt-4 rounded-lg bg-white shadow-sm p-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!articulo) {
    return (
      <div className="w-full mt-4 rounded-lg bg-white shadow-sm p-4">
        <p className="text-gray-500 text-center">No hay artículos disponibles</p>
      </div>
    );
  }

  const displayInfo = formatModeloDisplay(articulo);
  const stockDisponible = displayInfo.stockReal;

  return (
    <div className="w-full mt-4 rounded-lg bg-white shadow-sm p-4">
      {/* ✅ Título simplificado */}
      <h3 className="text-lg font-bold mb-3 text-gray-800">
        Producto seleccionado
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

      {/* ✅ NUEVA ESTRUCTURA: Info del producto + QuantityButton grande a la derecha */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
        {/* Información del producto - Ocupa más espacio */}
        <div className="flex-1 border border-gray-300 px-4 py-2 rounded bg-white w-full">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {displayInfo.marcaModelo}
                {displayInfo.esPesificado && <span className="ml-1">🏷️</span>}
                {displayInfo.esElectronica && <span className="ml-1">⚡</span>}
              </span>
              <span className="text-sm text-gray-500">
                {articulo.modelo}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-green-600">
                ${displayInfo.precioUsd.toFixed(2)} USD
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
        </div>

        <div className="w-full md:w-auto md:min-w-[200px]">
          <QuantityButton
            value={cantidad}
            onAdd={() => {
              if (cantidad < stockDisponible) {
                setCantidad(cantidad + 1);
              }
            }}
            onRemove={() => setCantidad(Math.max(1, cantidad - 1))}
            onSet={handleCantidadChange}
            modelo={articulo.modelo}
            hideModelo={false} // ✅ Mostrar el modelo en el QuantityButton grande
            size="large" // ✅ Tamaño grande
            maxStock={stockDisponible}
          />
        </div>
      </div>


      {/* ✅ Botón principal */}
      <button
        className="w-full text-white px-6 py-3 rounded font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#ea580c' }}
        onClick={handleAddToCart}
        disabled={stockDisponible <= 0}
      >
        {stockDisponible <= 0 
          ? 'Sin stock' 
          : `Añadir al carrito${esElectronica ? ' (Electrónica)' : ''}${sugerenciaActual ? ' con sugerencias ✨' : ''}${!esElectronica && isDistribuidor() ? ' (20% OFF)' : ''}`
        }
      </button>
    </div>
  );
}