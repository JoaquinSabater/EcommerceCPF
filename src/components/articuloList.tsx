"use client";
import { useState } from "react";
import { Articulo } from "@/types/types";
import QuantityButton from "./QuantityButton";

type ArticulosListProps = {
  articulos: Articulo[];
};

export default function ArticulosList({ articulos }: ArticulosListProps) {
  const [quantities, setQuantities] = useState<{ [codigo: string]: number }>({});

  const handleAdd = (codigo: string) => {
    setQuantities((q) => ({ ...q, [codigo]: (q[codigo] || 0) + 1 }));
  };

  const handleRemove = (codigo: string) => {
    setQuantities((q) => ({
      ...q,
      [codigo]: Math.max((q[codigo] || 0) - 1, 0),
    }));
  };

  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-2 mt-4">
      {articulos.map((articulo) => (
        <li
          key={articulo.codigo_interno}
          className="flex items-center justify-center gap-2 py-2 border rounded text-sm"
        >
          <QuantityButton
            onAdd={() => handleAdd(articulo.codigo_interno)}
            onRemove={() => handleRemove(articulo.codigo_interno)}
          >
            {articulo.modelo}
          </QuantityButton>
        </li>
      ))}
    </ul>
  );
}