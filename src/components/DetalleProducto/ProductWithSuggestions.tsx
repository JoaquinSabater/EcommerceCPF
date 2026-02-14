"use client";

import { useState } from 'react';
import DetalleMobile from './DetalleMobile';
import DetalleDesktop from './DetalleDesktop';
import ModelosSelector from './ModelosSelector';

interface ProductWithSuggestionsProps {
  producto: any;
  subcategoriaId: number; // Para exclusiones de descuento
  itemId: number; // Para APIs
}

export default function ProductWithSuggestions({ producto, subcategoriaId, itemId }: ProductWithSuggestionsProps) {
  const [sugerenciaActual, setSugerenciaActual] = useState('');

  const handleSugerenciaChange = (nuevaSugerencia: string) => {
    setSugerenciaActual(nuevaSugerencia);
  };

  return (
    <>
      {/* Vista móvil */}
      <div className="md:hidden">
        <DetalleMobile 
          producto={producto} 
          subcategoriaId={subcategoriaId}
          onSugerenciaChange={handleSugerenciaChange}
        />
        <div className="mt-6">
          <ModelosSelector 
            subcategoriaId={subcategoriaId}
            itemId={itemId}
            sugerenciaActual={sugerenciaActual}
          />
        </div>
      </div>
      
      {/* Vista desktop */}
      <div className="hidden md:block">
        <DetalleDesktop 
          producto={producto}
          subcategoriaId={subcategoriaId}
          onSugerenciaChange={handleSugerenciaChange}
        />
        <div className="mt-8">
          <ModelosSelector 
            subcategoriaId={subcategoriaId}
            itemId={itemId}
            sugerenciaActual={sugerenciaActual}
          />
        </div>
      </div>
    </>
  );
}