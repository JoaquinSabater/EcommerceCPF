"use client";

import { useState } from 'react';
import DetalleMobile from './DetalleMobile';
import DetalleDesktop from './DetalleDesktop';
import ModelosSelector from './ModelosSelector';

interface ProductWithSuggestionsProps {
  producto: any;
  subcategoriaId: number;
}

export default function ProductWithSuggestions({ producto, subcategoriaId }: ProductWithSuggestionsProps) {
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
          onSugerenciaChange={handleSugerenciaChange}
        />
        <div className="mt-6">
          <ModelosSelector 
            subcategoriaId={subcategoriaId} 
            sugerenciaActual={sugerenciaActual}
          />
        </div>
      </div>
      
      {/* Vista desktop */}
      <div className="hidden md:block">
        <DetalleDesktop 
          producto={producto}
          onSugerenciaChange={handleSugerenciaChange}
        />
        <div className="mt-8">
          <ModelosSelector 
            subcategoriaId={subcategoriaId}
            sugerenciaActual={sugerenciaActual}
          />
        </div>
      </div>
    </>
  );
}