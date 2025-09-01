// filepath: c:\Users\joaqu\Desktop\EcommerceCPF\src\components\DetalleProducto\DetalleDesktop.tsx
"use client";

import { CldImage } from 'next-cloudinary';
import React, { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ProductoFormateado {
  imagen: string;
  nombre: string;
  descripcion: string;
  precio: number; // ✅ Ya viene en pesos desde el modal padre
  caracteristicas: any[];
  imagenes?: string[];
}

interface DetalleDesktopProps {
  producto: ProductoFormateado;
}

export default function DetalleDesktop({ producto }: DetalleDesktopProps) {
  const todasLasImagenes = [
    producto.imagen,
    ...(producto.imagenes || [])
  ].filter(img => img && img.trim() !== '' && img !== 'not-image');

  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="flex w-full items-start p-6">
        <div className="flex-1 flex flex-col justify-start pr-8">
          <div className="mb-2 text-xs text-gray-500">Vidrio templado</div>
          <div className="font-bold text-3xl mb-2">{producto.nombre}</div>
          <div className="text-gray-700 mb-4 text-lg">{producto.descripcion}</div>
          <div className="flex items-center gap-2 mb-4">
            {/* ✅ Mostrar precio en pesos */}
            <div className="text-2xl font-semibold text-orange-600">
              ${producto.precio.toLocaleString()} <span className="text-lg font-normal">ARS</span>
            </div>
            {producto.precio > 0 && (
              <div className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                Precio actualizado
              </div>
            )}
          </div>
          <div className="mb-2 font-bold text-orange-600 text-xl">CARACTERÍSTICAS</div>
          <div className="flex-1 flex flex-col justify-between">
            <table className="w-full text-base">
              <tbody>
                {producto.caracteristicas.map((c: any) => (
                  <tr key={c.label} className="border-b align-top">
                    <td className="py-2 text-gray-500">{c.label}:</td>
                    <td className="py-2 font-bold text-gray-800">{c.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-1">
          <div className="relative">
            <div className="flex items-center justify-center rounded-lg overflow-hidden">
              {todasLasImagenes.length > 0 ? (
                <div className="relative w-full h-[500px] flex items-center justify-center">
                  <CldImage
                    src={todasLasImagenes[currentImageIndex]}
                    alt={`${producto.nombre} - Imagen ${currentImageIndex + 1}`}
                    width={400}
                    height={500}
                    className="object-contain max-h-full w-auto rounded-lg"
                  />
                  
                  {todasLasImagenes.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-gray-700 p-3 rounded-full hover:bg-opacity-40 transition-all z-10 backdrop-blur-sm"
                      >
                        <ChevronLeftIcon className="w-6 h-6" />
                      </button>
                      
                      <button
                        onClick={nextImage}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 text-gray-700 p-3 rounded-full hover:bg-opacity-40 transition-all z-10 backdrop-blur-sm"
                      >
                        <ChevronRightIcon className="w-6 h-6" />
                      </button>
                    </>
                  )}
                  
                  {todasLasImagenes.length > 1 && (
                    <div className="absolute top-3 right-3 text-orange-600 text-sm font-bold">
                      {currentImageIndex + 1} / {todasLasImagenes.length}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-[500px] flex items-center justify-center">
                  <img
                    src="/not-image.png"
                    alt="Sin imagen disponible"
                    className="object-contain max-h-full w-auto opacity-50 rounded-lg"
                  />
                </div>
              )}
            </div>
            
            {todasLasImagenes.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
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
        </div>
      </div>
    </div>
  );
}