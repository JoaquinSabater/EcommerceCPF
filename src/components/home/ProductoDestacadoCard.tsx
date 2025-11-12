"use client";

import React, { useState, useEffect } from "react";
import { categorias } from "@/types/types";
import { CldImage } from 'next-cloudinary';
import { useRouter } from 'next/navigation'; // ✅ Agregar router

interface ProductoDestacadoCardProps {
  categoria: categorias;
  onClick: () => void;
}

export default function ProductoDestacadoCard({ categoria, onClick }: ProductoDestacadoCardProps) {
  const [loading, setLoading] = useState(true);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [descripcion, setDescripcion] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  
  // ✅ Estados específicos para controlar loading
  const [loadingImagen, setLoadingImagen] = useState(true);
  
  const router = useRouter(); // ✅ Agregar router

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingImagen(true);
      setImageError(false);
      
      try {
        // ✅ Obtener solo detalles de imagen
        const resDetail = await fetch(`/api/detalle?id=${categoria.id}`);

        // ✅ Procesar detalles de imagen
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
          console.warn(`❌ No se pudieron obtener detalles para ${categoria.nombre} (destacado)`);
          setImagenPrincipal('');
          setImageError(true);
          setDescripcion('');
        }
        setLoadingImagen(false);

      } catch (error) {
        console.error(`❌ Error al obtener datos para ${categoria.nombre} (destacado):`, error);
        setImagenPrincipal('');
        setImageError(true);
        setDescripcion('');
        setLoadingImagen(false);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [categoria.id]);

  // ✅ CAMBIO PRINCIPAL: Navegar en lugar de abrir modal
  const handleVerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // ✅ Navegar a la página del producto
    router.push(`/public/items/${categoria.id}`);
    
    // ✅ Mantener callback por compatibilidad
    if (onClick) {
      onClick();
    }
  };

  // ✅ Mostrar skeleton mientras carga la imagen
  if (loading || loadingImagen) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full relative animate-pulse">
        {/* Badge destacado skeleton */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-gray-300 h-6 w-24 rounded-full"></div>
        </div>

        {/* Skeleton de imagen */}
        <div className="relative bg-gray-200 p-2 flex justify-center items-center h-72 md:h-80 border-b border-gray-100">
          <div className="w-full h-full bg-gray-300 rounded"></div>
        </div>
        
        {/* Skeleton de contenido */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Skeleton del título */}
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
          
          {/* Skeleton del contenido inferior */}
          <div className="mt-auto flex items-center justify-between">
            {/* Área donde estaban los precios - ahora vacía */}
            <div className="flex-1">
              {/* Sin precios */}
            </div>
            
            {/* Skeleton del botón */}
            <div className="h-10 bg-gray-300 rounded-lg w-16 ml-auto flex items-center justify-center">
              <div className="w-12 h-4 bg-gray-400 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full relative cursor-pointer"
      onClick={handleVerClick}
      tabIndex={0}
      role="button"
      aria-label={`Ver detalles de ${categoria.nombre} (producto destacado)`}
    >
      {/* ✅ BADGE DE DESTACADO */}
      <div className="absolute top-2 left-2 z-10">
        <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-yellow-300">
          ⭐ DESTACADO
        </span>
      </div>

      {/* ✅ SECCIÓN DE IMAGEN */}
      <div className="relative bg-white p-2 flex justify-center items-center h-72 md:h-80 border-b border-gray-100">
        {imageError || !imagenPrincipal ? (
          <img
            src="/not-image.png"
            alt={categoria.nombre}
            className="object-contain w-full h-full transition-transform duration-300 hover:scale-105"
            width={400}
            height={400}
            onError={() => console.log('Error cargando not-image.png')}
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
              console.warn(`❌ Error cargando imagen destacada: ${imagenPrincipal}`);
              setImageError(true);
            }}
          />
        )}
      </div>
      
      {/* ✅ SECCIÓN DE CONTENIDO - SIN PRECIOS */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 min-h-[2.5rem]">
          {categoria.nombre}
        </h3>
        
        <div className="mt-auto flex items-center justify-between">
          {/* ✅ Sin información de precios */}
          <div className="flex-1">
            {/* Área vacía donde estaban los precios */}
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