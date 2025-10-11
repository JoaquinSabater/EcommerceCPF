"use client";

import React, { useState, useEffect } from "react";
import { categorias } from "@/types/types";
import { CldImage } from 'next-cloudinary';
import DetalleProductoModal from "./DetalleProductoModal";
import CategoriaCardSkeleton from "@/components/Skeletons/CategoriaCardSkeleton";

interface CategoriaCardProps {
  categoria: categorias;
  onClick?: () => void;
}

export default function CategoriaCard({ categoria, onClick }: CategoriaCardProps) {
  const [precioEnPesos, setPrecioEnPesos] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [descripcion, setDescripcion] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setImageError(false);
      
      try {
        const [resDetail] = await Promise.all([
          fetch(`/api/detalle?id=${categoria.id}`)
        ]);


        if (resDetail.ok) {
          const dataDetail = await resDetail.json();
          
          console.log(`🖼️ Datos obtenidos para ${categoria.nombre}:`, {
            foto_portada: dataDetail.foto_portada,
            foto1_url: dataDetail.foto1_url,
            descripcion: dataDetail.descripcion,
            activo: dataDetail.activo
          });
          
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
      } catch (error) {
        console.error(`❌ Error al obtener datos para ${categoria.nombre}:`, error);
        setImagenPrincipal('');
        setImageError(true);
        setDescripcion('');
      }
      
      setLoading(false);
    };

    fetchData();
  }, [categoria.id, categoria.nombre]);

  const handleVerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const handleProductUpdate = (updatedProduct: any) => {
    console.log('🔄 Actualizando producto en card:', updatedProduct);
    
    setDescripcion(updatedProduct.descripcion || '');
    
    if (updatedProduct.foto_portada && updatedProduct.foto_portada.trim() !== '') {
      setImagenPrincipal(updatedProduct.foto_portada);
      setImageError(false);
    } else if (updatedProduct.foto1_url && updatedProduct.foto1_url.trim() !== '') {
      setImagenPrincipal(updatedProduct.foto1_url);
      setImageError(false);
    } else if (updatedProduct.foto2_url && updatedProduct.foto2_url.trim() !== '') {
      setImagenPrincipal(updatedProduct.foto2_url);
      setImageError(false);
    } else if (updatedProduct.foto3_url && updatedProduct.foto3_url.trim() !== '') {
      setImagenPrincipal(updatedProduct.foto3_url);
      setImageError(false);
    } else if (updatedProduct.foto4_url && updatedProduct.foto4_url.trim() !== '') {
      setImagenPrincipal(updatedProduct.foto4_url);
      setImageError(false);
    } else {
      setImagenPrincipal('');
      setImageError(true);
    }
  };

  // ✅ Mostrar skeleton mientras carga
  if (loading) {
    return <CategoriaCardSkeleton />;
  }

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full"
        onClick={onClick}
        tabIndex={0}
        role="button"
        aria-label={`Ver detalles de ${categoria.nombre}`}
      >
        {/* ✅ Sección de imagen */}
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
        
        {/* ✅ Información del producto */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 min-h-[2.5rem]">
            {categoria.nombre}
          </h3>
          
          <div className="mt-auto flex items-center justify-between">
            {/* ✅ Mostrar precio si está disponible */}
            {precioEnPesos && (
              <div className="text-lg font-bold text-green-600">
                ${precioEnPesos.toLocaleString('es-AR')}
              </div>
            )}
            
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1 shadow-sm hover:shadow ml-auto"
              onClick={handleVerClick}
            >
              ver +
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <DetalleProductoModal 
        itemId={categoria.id.toString()}
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onUpdate={handleProductUpdate}
      />
    </>
  );
}