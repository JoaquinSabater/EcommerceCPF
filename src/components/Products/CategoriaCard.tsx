"use client";

import React, { useState, useEffect } from "react";
import { categorias } from "@/types/types";
import { CldImage } from 'next-cloudinary';
import DetalleProductoModal from "./DetalleProductoModal";

interface CategoriaCardProps {
  categoria: categorias;
  onClick?: () => void;
}

export default function CategoriaCard({ categoria, onClick }: CategoriaCardProps) {
  const [precio, setPrecio] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [imagenPrincipal, setImagenPrincipal] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setImageError(false);
      
      try {
        const resPrice = await fetch(`/api/precio?itemId=${categoria.id}`);
        const dataPrice = await resPrice.json();
        setPrecio(dataPrice.precio);

        // Buscar la foto_portada específicamente
        const resDetail = await fetch(`/api/detalle?id=${categoria.id}`);
        if (resDetail.ok) {
          const dataDetail = await resDetail.json();
          
          console.log('Datos del producto:', dataDetail); // Para debug
          
          // Priorizar foto_portada, si no existe usar foto1_url como fallback
          if (dataDetail.foto_portada && dataDetail.foto_portada.trim() !== '') {
            setImagenPrincipal(dataDetail.foto_portada);
            setImageError(false);
          } else if (dataDetail.foto1_url && dataDetail.foto1_url.trim() !== '') {
            setImagenPrincipal(dataDetail.foto1_url);
            setImageError(false);
          } else {
            setImagenPrincipal('');
            setImageError(true);
          }
        } else {
          console.log('Error en la respuesta del detalle:', resDetail.status);
          setImagenPrincipal('');
          setImageError(true);
        }
      } catch (error) {
        console.error("Error al obtener datos:", error);
        setImagenPrincipal('');
        setImageError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoria.id]);

  const handleVerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Callback para actualizar la imagen cuando se edite en el modal
  const handleProductUpdate = (updatedProduct: any) => {
    console.log('Actualizando producto en card:', updatedProduct);
    
    // Priorizar foto_portada en la actualización
    if (updatedProduct.foto_portada && updatedProduct.foto_portada.trim() !== '') {
      setImagenPrincipal(updatedProduct.foto_portada);
      setImageError(false);
    } else if (updatedProduct.foto1_url && updatedProduct.foto1_url.trim() !== '') {
      setImagenPrincipal(updatedProduct.foto1_url);
      setImageError(false);
    } else {
      setImagenPrincipal('');
      setImageError(true);
    }
  };

  const handleImageError = () => {
    console.log('Error al cargar imagen de Cloudinary:', imagenPrincipal);
    setImageError(true);
  };

  return (
    <>
      <div
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col h-full"
        onClick={onClick}
        tabIndex={0}
        role="button"
        aria-label={`Ver detalles de ${categoria.nombre}`}
      >
        {/* ✅ Imagen aún más grande con padding mínimo */}
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
              onError={handleImageError}
              crop="fit"
              quality="auto"
              format="auto"
            />
          )}
        </div>
        
        {/* ✅ Contenido compacto */}
        <div className="p-4 flex flex-col flex-grow">
          <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 min-h-[2.5rem]">{categoria.nombre}</h3>
          
          <div className="mt-auto flex items-center justify-between">
            {loading ? (
              <div className="inline-block h-6 animate-pulse bg-gray-200 rounded w-16"></div>
            ) : precio ? (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-orange-600">${precio.toLocaleString()}</span>
                <span className="text-xs text-gray-500">Precio actualizado</span>
              </div>
            ) : (
              <div className="w-16"></div>
            )}
            
            <button
              className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center gap-1 shadow-sm hover:shadow"
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