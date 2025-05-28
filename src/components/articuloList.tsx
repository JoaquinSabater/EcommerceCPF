"use client";
import { useCart } from "@/components/CartContext";
import { Articulo } from "@/types/types";
import QuantityButton from "./QuantityButton";

type ArticulosListProps = {
  articulos: Articulo[];
};

export default function ArticulosList({ articulos }: ArticulosListProps) {
  const { addToCart, removeFromCart, cart, setItemQuantity } = useCart();

  return (
    <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-2 mt-4">
      {articulos.map((articulo) => {
        const cartItem = cart.find(
          (item) => item.codigo_interno === articulo.codigo_interno
        );
        const cantidad = cartItem ? cartItem.cantidad : 0;

        return (
          <li
            key={articulo.codigo_interno}
            className="flex items-center justify-center py-1 bg-white/70 backdrop-blur-sm shadow-sm rounded-lg text-sm"
            style={{ minHeight: 60, flexDirection: "column" }}
          >
            <QuantityButton
              value={cantidad}
              onAdd={() => addToCart(articulo, articulo.modelo)}
              onRemove={() => removeFromCart(articulo.codigo_interno)}
              onSet={(val) => setItemQuantity(articulo.codigo_interno, val, articulo)}
              modelo={articulo.modelo}
            />
          </li>
        );
      })}
    </ul>
  );
}