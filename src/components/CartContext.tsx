"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Articulo } from "@/types/types";

type CartItem = {
  codigo_interno: string;
  modelo: string;
  nombre: string;
  cantidad: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (articulo: Articulo, nombre: string) => void;
  removeFromCart: (codigo_interno: string) => void;
  changeQuantity: (codigo_interno: string, delta: number) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (articulo: Articulo, nombre: string) => {
    setCart((prev) => {
      const found = prev.find((i) => i.codigo_interno === articulo.codigo_interno);
      if (found) {
        return prev.map((i) =>
          i.codigo_interno === articulo.codigo_interno
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          codigo_interno: articulo.codigo_interno,
          modelo: articulo.modelo,
          nombre,
          cantidad: 1,
        },
      ];
    });
  };

  const removeFromCart = (codigo_interno: string) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.codigo_interno === codigo_interno
            ? { ...i, cantidad: i.cantidad - 1 }
            : i
        )
        .filter((i) => i.cantidad > 0)
    );
  };

  const changeQuantity = (codigo_interno: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.codigo_interno === codigo_interno
            ? { ...i, cantidad: Math.max(i.cantidad + delta, 0) }
            : i
        )
        .filter((i) => i.cantidad > 0)
    );
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, changeQuantity }}>
      {children}
    </CartContext.Provider>
  );
}