'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DolarContextType {
  dolar: number;
  loading: boolean;
  error: string | null;
}

const DolarContext = createContext<DolarContextType>({
  dolar: 1,
  loading: true,
  error: null
});

export function DolarProvider({ children }: { children: ReactNode }) {
  const [dolar, setDolar] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDolar() {
      try {
        const res = await fetch('/api/dolar', {
          // Cache en el cliente por 1 hora
          next: { revalidate: 3600 }
        });
        
        if (!res.ok) {
          throw new Error('Error al obtener cotización del dólar');
        }
        
        const data = await res.json();
        setDolar(data.dolar || 1);
        setError(null);
      } catch (err) {
        console.error('Error fetching dolar:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setDolar(1); // Valor por defecto en caso de error
      } finally {
        setLoading(false);
      }
    }

    fetchDolar();

    // Actualizar cada 1 hora (3600000 ms)
    const interval = setInterval(fetchDolar, 3600000);

    return () => clearInterval(interval);
  }, []);

  return (
    <DolarContext.Provider value={{ dolar, loading, error }}>
      {children}
    </DolarContext.Provider>
  );
}

export const useDolar = () => {
  const context = useContext(DolarContext);
  if (!context) {
    throw new Error('useDolar debe usarse dentro de un DolarProvider');
  }
  return context;
};
