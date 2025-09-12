'use client';

import { useState, useEffect } from 'react';

interface ProspectoData {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  cuit: string;
  negocio: string;
}

export function useProspectoMode() {
  const [isProspectoMode, setIsProspectoMode] = useState(false);
  const [prospectoData, setProspectoData] = useState<ProspectoData | null>(null);

  useEffect(() => {
    // Verificar si está en modo prospecto
    const prospectoModeActive = localStorage.getItem('prospecto_mode') === 'true';
    const prospectoDataStored = localStorage.getItem('prospecto_data');
    
    if (prospectoModeActive && prospectoDataStored) {
      setIsProspectoMode(true);
      setProspectoData(JSON.parse(prospectoDataStored));
    } else {
      setIsProspectoMode(false);
      setProspectoData(null);
    }
  }, []);

  const clearProspectoSession = () => {
    localStorage.removeItem('prospecto_mode');
    localStorage.removeItem('prospecto_data');
    localStorage.removeItem('prospecto_cart');
    localStorage.removeItem('prospecto_token');
    setIsProspectoMode(false);
    setProspectoData(null);
    // Recargar la página para limpiar el estado
    window.location.reload();
  };

  return {
    isProspectoMode,
    prospectoData,
    clearProspectoSession
  };
}