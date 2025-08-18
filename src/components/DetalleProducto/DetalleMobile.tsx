"use client";

import { CldImage } from 'next-cloudinary';
import React, { useState, useRef } from "react";

interface Caracteristica {
  label: string;
  value: string;
}

interface ProductoFormateado {
  imagen: string;
  nombre: string;
  descripcion: string;
  precio: number;
  caracteristicas: Caracteristica[];
  imagenes?: string[];
}

interface DetalleMobileProps {
  producto: ProductoFormateado;
}

export default function DetalleMobile({ producto }: DetalleMobileProps) {
  // Crear array de imágenes válidas
  const todasLasImagenes = [
    producto.imagen, // foto_portada o imagen principal
    ...(producto.imagenes || []) // fotos de galería
  ].filter(img => img && img.trim() !== '' && img !== 'not-image');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === todasLasImagenes.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? todasLasImagenes.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  // Manejo de eventos táctiles para swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (todasLasImagenes.length <= 1) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || todasLasImagenes.length <= 1) return;
    e.preventDefault(); // Prevenir scroll mientras se hace swipe
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || todasLasImagenes.length <= 1) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50; // Distancia mínima para considerar swipe

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        // Swipe hacia la izquierda - imagen siguiente
        nextImage();
      } else {
        // Swipe hacia la derecha - imagen anterior
        prevImage();
      }
    }

    setIsDragging(false);
    setStartX(0);
  };

  // Manejo de eventos de mouse para desktop (opcional)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (todasLasImagenes.length <= 1) return;
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || todasLasImagenes.length <= 1) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || todasLasImagenes.length <= 1) return;
    
    const endX = e.clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        nextImage();
      } else {
        prevImage();
      }
    }

    setIsDragging(false);
    setStartX(0);
  };

  return (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      {/* Carousel de imágenes */}
      <div className="relative mb-4">
        {/* ✅ Sin fondo gris - imagen flotante */}
        <div className="flex items-center justify-center rounded-lg overflow-hidden">
          {todasLasImagenes.length > 0 ? (
            <div 
              ref={imageRef}
              className="relative w-full h-[400px] flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                setIsDragging(false);
                setStartX(0);
              }}
            >
              <CldImage
                src={todasLasImagenes[currentImageIndex]}
                alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                width={380}
                height={400}
                className="object-contain max-h-full w-auto pointer-events-none rounded-lg"
                draggable={false}
              />
              
              {/* ✅ Elementos flotantes en una línea */}
              {todasLasImagenes.length > 1 && (
                <div className="absolute top-2 left-0 right-0 flex items-center justify-between px-2">
                  {/* Contador naranja sin fondo */}
                  <div className="text-orange-600 text-sm font-bold">
                    {currentImageIndex + 1} / {todasLasImagenes.length}
                  </div>
                  
                  {/* Texto de instrucción para swipe - Solo móvil */}
                  <div className="text-orange-600 text-xs font-medium md:hidden">
                    Desliza para ver más fotos
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Imagen placeholder si no hay imágenes
            <div className="w-full h-[400px] flex items-center justify-center">
              <img
                src="/not-image.png"
                alt="Sin imagen disponible"
                className="object-contain max-h-full w-auto opacity-50 rounded-lg"
              />
            </div>
          )}
        </div>
        
        {/* Puntos indicadores */}
        {todasLasImagenes.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {todasLasImagenes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-orange-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="mb-2 text-xs text-gray-500">Vidrio templado</div>
      <div className="font-bold text-xl mb-1">{producto.nombre}</div>
      <div className="text-gray-700 mb-2">{producto.descripcion}</div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="text-2xl font-semibold text-orange-600">${producto.precio.toLocaleString()}</div>
        {producto.precio > 0 && (
          <div className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
            Precio actualizado
          </div>
        )}
      </div>
      <div className="mb-2 font-bold text-orange-600">CARACTERÍSTICAS</div>
      <table className="w-full text-sm mb-4">
        <tbody>
          {producto.caracteristicas.map((c: any) => (
            <tr key={c.label} className="border-b">
              <td className="py-2 text-gray-500">{c.label}:</td>
              <td className="py-2 font-bold text-gray-800">{c.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}