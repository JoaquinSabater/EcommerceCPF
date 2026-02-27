"use client";

import React, { useState, useMemo } from "react";
import { categorias } from "@/types/types";
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";
import { useDolar } from "@/contexts/DolarContext";

interface CategoriaCardProps {
  categoria: categorias;
  onClick?: () => void;
}

export default function CategoriaCard({ categoria, onClick }: CategoriaCardProps) {
  const [imageError, setImageError] = useState(false);

  const { getPrecioConDescuento, isDistribuidor, esCategoriaExcluida } = useAuth();
  const { dolar } = useDolar(); 
  const router = useRouter();

  const itemExcluido = esCategoriaExcluida(categoria.subcategoria_id);

  // ✅ OPTIMIZADO: Usar datos pre-cargados desde la API de categorías
  // en vez de hacer 2 API calls individuales por tarjeta
  const imagenPrincipal = useMemo(() => {
    if (categoria.foto_portada && categoria.foto_portada.trim() !== '') return categoria.foto_portada;
    if (categoria.foto1_url && categoria.foto1_url.trim() !== '') return categoria.foto1_url;
    if (categoria.foto2_url && categoria.foto2_url.trim() !== '') return categoria.foto2_url;
    if (categoria.foto3_url && categoria.foto3_url.trim() !== '') return categoria.foto3_url;
    if (categoria.foto4_url && categoria.foto4_url.trim() !== '') return categoria.foto4_url;
    return '';
  }, [categoria.foto_portada, categoria.foto1_url, categoria.foto2_url, categoria.foto3_url, categoria.foto4_url]);

  // Rango de precios pre-cargado desde getCategorias()
  const rangoPrecio = useMemo(() => {
    // MySQL devuelve decimales como strings, convertir a number
    const precioMinimo = categoria.precioMinimo != null ? Number(categoria.precioMinimo) : null;
    const precioMaximo = categoria.precioMaximo != null ? Number(categoria.precioMaximo) : null;
    if (!precioMinimo && !precioMaximo) return null;
    return {
      precioMinimo,
      precioMaximo,
      tieneVariacion: precioMinimo !== precioMaximo,
      totalArticulos: categoria.modelosDisponibles || 0,
    };
  }, [categoria.precioMinimo, categoria.precioMaximo, categoria.modelosDisponibles]);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('navigation-start'));
    router.push(`/public/items/${categoria.id}`);
    if (onClick) {
      onClick();
    }
  };

  const renderPrecio = () => {
    if (!rangoPrecio || (!rangoPrecio.precioMinimo && !rangoPrecio.precioMaximo)) {
      return null;
    }

    const { precioMinimo, precioMaximo, tieneVariacion } = rangoPrecio;

    if (!precioMinimo && !precioMaximo) return null;

    let precioMinimoConDescuento: number;
    let precioMaximoConDescuento: number;

    if (itemExcluido) {
      precioMinimoConDescuento = precioMinimo || 0;
      precioMaximoConDescuento = precioMaximo || 0;
    } else {
      precioMinimoConDescuento = precioMinimo ? getPrecioConDescuento(precioMinimo, { id: categoria.subcategoria_id }) : 0;
      precioMaximoConDescuento = precioMaximo ? getPrecioConDescuento(precioMaximo, { id: categoria.subcategoria_id }) : 0;
    }

    const precioMinimoPesos = Math.round(precioMinimoConDescuento * dolar);
    const precioMaximoPesos = Math.round(precioMaximoConDescuento * dolar);

    const hayDescuentoAplicado = isDistribuidor() && !itemExcluido && precioMinimo && (precioMinimoConDescuento < precioMinimo);

    if (tieneVariacion && precioMinimo !== precioMaximo) {
      return (
        <div className="text-green-600 font-bold">
          <div className="text-lg">
            ${precioMinimoPesos.toLocaleString('es-AR')} - ${precioMaximoPesos.toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-gray-500">
            USD ${precioMinimoConDescuento.toFixed(2)} - ${precioMaximoConDescuento.toFixed(2)}
            {hayDescuentoAplicado && (
              <span className="ml-1 text-green-600">(-20%)</span>
            )}
          </div>
        </div>
      );
    } else {
      return (
        <div className="text-green-600 font-bold">
          <div className="text-lg">
            ${precioMinimoPesos.toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-gray-500">
            USD ${precioMinimoConDescuento.toFixed(2)}
            {hayDescuentoAplicado && (
              <span className="ml-1 text-green-600">(-20%)</span>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
      onClick={handleCardClick}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles de ${categoria.nombre}`}
    >
      <div className="relative bg-white p-2 flex justify-center items-center h-72 md:h-80 border-b border-gray-100">

        {imageError || !imagenPrincipal ? (
          <img
            src="/not-image.png"
            alt={categoria.nombre}
            className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
            width={400}
            height={400}
          />
        ) : (
          <CldImage
            src={imagenPrincipal}
            alt={categoria.nombre}
            width={600}
            height={600}
            className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
            crop="fit"
            quality="auto:eco"
            format="auto"
            loading="lazy"
            sizes="(max-width: 640px) 150px, (max-width: 1024px) 250px, 300px"
            onError={() => {
              setImageError(true);
            }}
          />
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 min-h-[2.5rem]">
          {categoria.nombre}
        </h3>
        
        <div className="mt-auto flex items-center justify-between">
          <div className="flex-1">
            {renderPrecio()}
            
            {!itemExcluido && isDistribuidor() && rangoPrecio?.precioMinimo && (
              <div className="mt-1">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  20% OFF aplicado
                </span>
              </div>
            )}
            
            {itemExcluido && isDistribuidor() && (
              <div className="mt-1">
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                  📱 Sin descuento distribuidor
                </span>
              </div>
            )}
            
            {rangoPrecio?.tieneVariacion && (
              <div className="text-xs text-gray-400 mt-1">
                {rangoPrecio.totalArticulos} modelos disponibles
              </div>
            )}
          </div>
          
          <div className="text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-1 shadow-sm hover:shadow ml-auto" style={{ backgroundColor: '#ea580c' }}>
            ver +
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}