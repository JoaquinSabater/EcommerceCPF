'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Marca {
  id: number;
  nombre: string;
}

interface FiltersContextType {
  selectedMarca: Marca | null;
  setSelectedMarca: (marca: Marca | null) => void;
  marcas: Marca[];
  setMarcas: (marcas: Marca[]) => void;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null);
  const [marcas, setMarcas] = useState<Marca[]>([]);

  return (
    <FiltersContext.Provider value={{
      selectedMarca,
      setSelectedMarca,
      marcas,
      setMarcas
    }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);
  if (context === undefined) {
    throw new Error('useFilters must be used within a FiltersProvider');
  }
  return context;
}