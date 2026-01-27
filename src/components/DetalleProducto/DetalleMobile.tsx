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
  sugerencia?: string;
  mostrarCaracteristicas?: boolean;
}

interface DetalleMobileProps {
  producto: ProductoFormateado;
  onSugerenciaChange?: (sugerencia: string) => void;
}

export default function DetalleMobile({ producto, onSugerenciaChange }: DetalleMobileProps) {
  const todasLasImagenes = [
    producto.imagen,
    ...(producto.imagenes || [])
  ].filter(img => img && img.trim() !== '' && img !== 'not-image');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [sugerencia, setSugerencia] = useState(producto.sugerencia || '');
  const [imageLoading, setImageLoading] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const nextImage = () => {
    setImageLoading(true);
    setCurrentImageIndex((prev) => 
      prev === todasLasImagenes.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setImageLoading(true);
    setCurrentImageIndex((prev) => 
      prev === 0 ? todasLasImagenes.length - 1 : prev - 1
    );
  };

  const goToImage = (index: number) => {
    if (index !== currentImageIndex) {
      setImageLoading(true);
      setCurrentImageIndex(index);
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (todasLasImagenes.length <= 1 || imageLoading) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || todasLasImagenes.length <= 1 || imageLoading) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || todasLasImagenes.length <= 1 || imageLoading) return;
    
    const endX = e.changedTouches[0].clientX;
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

  const handleMouseDown = (e: React.MouseEvent) => {
    if (todasLasImagenes.length <= 1 || imageLoading) return;
    setStartX(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || todasLasImagenes.length <= 1 || imageLoading) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || todasLasImagenes.length <= 1 || imageLoading) return;
    
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

  const handleSugerenciaChange = (value: string) => {
    setSugerencia(value);
    if (onSugerenciaChange) {
      onSugerenciaChange(value);
    }
  };

  return (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      {/* ✅ SIEMPRE MOSTRAR: Sección de imágenes */}
      <div className="relative mb-4">
        <div className="flex items-center justify-center rounded-lg overflow-hidden">
          {todasLasImagenes.length > 0 ? (
            <div 
              ref={imageRef}
              className={`relative w-full h-[400px] flex items-center justify-center select-none ${
                imageLoading ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
              }`}
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
              {/* Loading overlay */}
              {imageLoading && (
                <div className="absolute inset-0 bg-white flex items-center justify-center z-20 rounded-lg">
                  <div className="flex flex-col items-center">
                    <div 
                      className="animate-spin rounded-full h-6 w-6 border-b-2 mb-2"
                      style={{ borderColor: '#ea580c' }}
                    ></div>
                    <span className="text-xs text-gray-500">Cargando...</span>
                  </div>
                </div>
              )}

              <CldImage
                src={todasLasImagenes[currentImageIndex]}
                alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                width={380}
                height={400}
                className={`object-contain max-h-full w-auto pointer-events-none rounded-lg transition-opacity duration-200 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                draggable={false}
                onLoad={handleImageLoad}
              />
              
              {todasLasImagenes.length > 1 && (
                <div className="absolute top-2 left-0 right-0 flex items-center justify-between px-2">
                  <div 
                    className="text-sm font-bold"
                    style={{ color: '#ea580c' }}
                  >
                    {currentImageIndex + 1} / {todasLasImagenes.length}
                  </div>
                  
                  <div 
                    className={`text-xs font-medium md:hidden ${
                      imageLoading ? 'opacity-50' : ''
                    }`}
                    style={{ color: '#ea580c' }}
                  >
                    {imageLoading ? 'Cargando...' : 'Desliza para ver más fotos'}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-[400px] flex items-center justify-center">
              <img
                src="/not-image.png"
                alt="Sin imagen disponible"
                className="object-contain max-h-full w-auto opacity-50 rounded-lg"
              />
            </div>
          )}
        </div>
        
        {todasLasImagenes.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {todasLasImagenes.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                disabled={imageLoading}
                className={`w-3 h-3 rounded-full transition-all disabled:cursor-not-allowed ${
                  index === currentImageIndex 
                    ? 'text-white'
                    : 'bg-gray-300 hover:bg-gray-400'
                } ${imageLoading ? 'opacity-50' : ''}`}
                style={index === currentImageIndex ? { backgroundColor: '#ea580c' } : {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Nombre y descripción */}
      <div className="font-bold text-xl mb-1 break-words">{producto.nombre}</div>
      <div className="text-gray-700 mb-2 break-words overflow-hidden">{producto.descripcion}</div>

      {/* Características */}
      {producto.mostrarCaracteristicas && (
        <>
          <div 
            className="mb-2 font-bold"
            style={{ color: '#ea580c' }}
          >
            CARACTERÍSTICAS
          </div>
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
        </>
      )}

      {/* Sugerencias especiales - AHORA AL FINAL */}
      <div className="mb-4">
        <label 
          className="block text-sm font-bold mb-2"
          style={{ color: '#ea580c' }}
        >
          SUGERENCIAS ESPECIALES
        </label>
        <textarea
          value={sugerencia}
          onChange={(e) => handleSugerenciaChange(e.target.value)}
          placeholder="Escribe aquí cualquier sugerencia especial..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none text-sm"
          rows={3}
        />
        <div className="text-xs text-gray-500 mt-1">
          Opcional: Agrega detalles específicos sobre este producto
        </div>
      </div>
    </div>
  );
}