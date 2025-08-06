"use client";

import React, { useState, useEffect } from "react";
import { categorias } from "@/types/types";
import Image from "next/image";
import DetalleProductoModal from "./DetalleProductoModal";

// Solo mantenemos las imágenes, eliminamos los precios hardcodeados
const VIDRIO_INFO: Record<number, { imagen: string }> = {
  205: { imagen: "/vidrio-templado-celular-01.webp" },
  212: { imagen: "/images/vidrio-111d-glue.png" },
  216: { imagen: "/images/vidrio-feather-glass.png" },
};

interface CategoriaCardProps {
  categoria: categorias;
  onClick?: () => void;
}

export default function CategoriaCard({ categoria, onClick }: CategoriaCardProps) {
  const [precio, setPrecio] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const info = VIDRIO_INFO[categoria.id] || { imagen: undefined };

  useEffect(() => {
    const fetchPrecio = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/precio?itemId=${categoria.id}`);
        const data = await res.json();
        setPrecio(data.precio);
      } catch (error) {
        console.error("Error al obtener el precio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrecio();
  }, [categoria.id]);

  const handleVerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
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
        {/* Contenedor de imagen con fondo */}
        <div className="relative bg-gradient-to-b from-orange-50 to-white pt-10 px-4 flex justify-center items-center h-48 md:h-56">
          {info.imagen ? (
            <Image
              src={info.imagen}
              alt={categoria.nombre}
              width={160}
              height={160}
              className="object-contain max-h-40 md:max-h-48 transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <span className="text-gray-400 w-32 h-32 flex items-center justify-center bg-gray-100 rounded">Sin foto</span>
          )}
        </div>
        
        {/* Contenido */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="font-bold text-gray-800 text-lg mb-2 line-clamp-2 min-h-[3.5rem]">{categoria.nombre}</h3>
          
          {/* Footer con precio y botón */}
          <div className="mt-auto pt-4 flex items-center justify-between">
            {loading ? (
              <div className="inline-block h-6 animate-pulse bg-gray-200 rounded w-16"></div>
            ) : precio ? (
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-orange-600">${precio.toLocaleString()}</span>
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

      {/* Modal de detalle del producto */}
      <DetalleProductoModal 
        itemId={categoria.id.toString()}
        isOpen={modalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}