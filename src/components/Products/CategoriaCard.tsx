"use client";

import React, { useState, useEffect } from "react";
import { categorias } from "@/types/types";
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation';
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";
import { useAuth } from "@/hooks/useAuth";

interface CategoriaCardProps {
  categoria: categorias;
  onClick?: () => void;
}

interface RangoPrecio {
  precioMinimo: number | null;
  precioMaximo: number | null;
  tieneVariacion: boolean;
  totalArticulos?: number;
  articulosConPrecio?: number;
}

export default function CategoriaCard({ categoria, onClick }: CategoriaCardProps) {
  const [rangoPrecio, setRangoPrecio] = useState<RangoPrecio | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [descripcion, setDescripcion] = useState<string>('');
  const [dolar, setDolar] = useState<number>(1);

  const { getPrecioConDescuento, isDistribuidor } = useAuth();
  const router = useRouter();

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
    const fetchData = async () => {
      setLoading(true);
      setImageError(false);
      
      try {
        const [resDetail, resPrecio] = await Promise.all([
          fetch(`/api/detalle?id=${categoria.id}`),
          fetch(`/api/rangoPrecio?itemId=${categoria.id}`)
        ]);

        if (resDetail.ok) {
          const dataDetail = await resDetail.json();
          
          setDescripcion(dataDetail.descripcion || '');
          
          if (dataDetail.foto_portada && dataDetail.foto_portada.trim() !== '') {
            setImagenPrincipal(dataDetail.foto_portada);
            setImageError(false);
          } else if (dataDetail.foto1_url && dataDetail.foto1_url.trim() !== '') {
            setImagenPrincipal(dataDetail.foto1_url);
            setImageError(false);
          } else if (dataDetail.foto2_url && dataDetail.foto2_url.trim() !== '') {
            setImagenPrincipal(dataDetail.foto2_url);
            setImageError(false);
          } else if (dataDetail.foto3_url && dataDetail.foto3_url.trim() !== '') {
            setImagenPrincipal(dataDetail.foto3_url);
            setImageError(false);
          } else if (dataDetail.foto4_url && dataDetail.foto4_url.trim() !== '') {
            setImagenPrincipal(dataDetail.foto4_url);
            setImageError(false);
          } else {
            setImagenPrincipal('');
            setImageError(true);
          }
        } else {
          console.warn(`❌ No se pudieron obtener detalles para ${categoria.nombre}`);
          setImagenPrincipal('');
          setImageError(true);
          setDescripcion('');
        }

        if (resPrecio.ok) {
          const dataPrecio = await resPrecio.json();
          setRangoPrecio(dataPrecio);
          
          console.log(`💰 Rango de precios para ${categoria.nombre}:`, {
            minimo: dataPrecio.precioMinimo,
            maximo: dataPrecio.precioMaximo,
            variacion: dataPrecio.tieneVariacion,
            articulos: dataPrecio.totalArticulos
          });
        } else {
          console.warn(`❌ No se pudo obtener rango de precios para ${categoria.nombre}`);
          setRangoPrecio(null);
        }

      } catch (error) {
        console.error(`❌ Error al obtener datos para ${categoria.nombre}:`, error);
        setImagenPrincipal('');
        setImageError(true);
        setDescripcion('');
        setRangoPrecio(null);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [categoria.id, categoria.nombre]);

  // ✅ CAMBIO PRINCIPAL: Navegar en vez de abrir modal
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/public/items/${categoria.id}`);
    if (onClick) {
      onClick();
    }
  };

  // ✅ Función para formatear el display de precios
  const renderPrecio = () => {
    if (!rangoPrecio || (!rangoPrecio.precioMinimo && !rangoPrecio.precioMaximo)) {
      return null;
    }

    const { precioMinimo, precioMaximo, tieneVariacion } = rangoPrecio;

    if (!precioMinimo && !precioMaximo) return null;

    // ✅ Aplicar descuentos si corresponde
    const precioMinimoConDescuento = precioMinimo ? getPrecioConDescuento(precioMinimo) : 0;
    const precioMaximoConDescuento = precioMaximo ? getPrecioConDescuento(precioMaximo) : 0;

    // ✅ Convertir a pesos
    const precioMinimoPesos = Math.round(precioMinimoConDescuento * dolar);
    const precioMaximoPesos = Math.round(precioMaximoConDescuento * dolar);

    if (tieneVariacion && precioMinimo !== precioMaximo) {
      // ✅ Mostrar rango
      return (
        <div className="text-green-600 font-bold">
          <div className="text-lg">
            ${precioMinimoPesos.toLocaleString('es-AR')} - ${precioMaximoPesos.toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-gray-500">
            USD ${precioMinimoConDescuento.toFixed(2)} - ${precioMaximoConDescuento.toFixed(2)}
            {isDistribuidor() && (
              <span className="ml-1 text-green-600">(-20%)</span>
            )}
          </div>
        </div>
      );
    } else {
      // ✅ Precio único
      return (
        <div className="text-green-600 font-bold">
          <div className="text-lg">
            ${precioMinimoPesos.toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-gray-500">
            USD ${precioMinimoConDescuento.toFixed(2)}
            {isDistribuidor() && (
              <span className="ml-1 text-green-600">(-20%)</span>
            )}
          </div>
        </div>
      );
    }
  };

  if (loading) {
    return <CategoriaCardSkeleton />;
  }

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
            quality="auto"
            format="auto"
            onError={() => {
              console.warn(`❌ Error cargando imagen: ${imagenPrincipal}`);
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
            {isDistribuidor() && rangoPrecio?.precioMinimo && (
              <div className="mt-1">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  20% OFF aplicado
                </span>
              </div>
            )}
            {rangoPrecio?.tieneVariacion && (
              <div className="text-xs text-gray-400 mt-1">
                {rangoPrecio.totalArticulos} modelos disponibles
              </div>
            )}
          </div>
          
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1 shadow-sm hover:shadow ml-auto">
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