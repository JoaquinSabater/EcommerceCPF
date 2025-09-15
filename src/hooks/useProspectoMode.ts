'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth(); // ✅ AGREGAR HOOK DE AUTH

  useEffect(() => {
    // ✅ SI HAY UN USUARIO AUTENTICADO, NO ACTIVAR MODO PROSPECTO
    if (user) {
      setIsProspectoMode(false);
      setProspectoData(null);
      return;
    }

    // Solo verificar modo prospecto si NO hay usuario autenticado
    const prospectoModeActive = localStorage.getItem('prospecto_mode') === 'true';
    const prospectoDataStored = localStorage.getItem('prospecto_data');
    
    if (prospectoModeActive && prospectoDataStored) {
      setIsProspectoMode(true);
      setProspectoData(JSON.parse(prospectoDataStored));
    } else {
      setIsProspectoMode(false);
      setProspectoData(null);
    }
  }, [user]); // ✅ AGREGAR DEPENDENCIA DE USER

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