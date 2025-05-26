"use client";
import { useCart } from "@/components/CartContext";
import { Articulo } from "@/types/types";
import QuantityButton from "./QuantityButton";

type ArticulosListProps = {
  articulos: Articulo[];
};

export default function ArticulosList({ articulos }: ArticulosListProps) {
  const { addToCart, removeFromCart, cart } = useCart();

  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-2 mt-4">
      {articulos.map((articulo) => (
        <li
          key={articulo.codigo_interno}
          className="flex items-center justify-center gap-2 py-2 border rounded text-sm"
        >
          <QuantityButton
            onAdd={() => addToCart(articulo, articulo.modelo)}
            onRemove={() => removeFromCart(articulo.codigo_interno)}
          >
            {articulo.modelo}
          </QuantityButton>
        </li>
      ))}
    </ul>
  );
}