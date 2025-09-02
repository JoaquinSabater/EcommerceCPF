"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Articulo } from "@/types/types";

type CartItem = {
  codigo_interno: string;
  modelo: string;
  item_nombre: string;
  cantidad: number;
  precio_venta: number; 
  sugerencia?: string; // ✅ Nueva propiedad para sugerencias
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (articulo: Articulo, nombre: string, cantidad?: number, sugerencia?: string) => void; // ✅ Agregar sugerencia
  removeFromCart: (codigo_interno: string) => void;
  changeQuantity: (codigo_interno: string, delta: number) => void;
  setItemQuantity: (codigo_interno: string, cantidad: number, articulo?: Articulo) => void;
  updateSugerencia: (codigo_interno: string, sugerencia: string) => void; // ✅ Nueva función
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (articulo: Articulo, nombre: string, cantidad: number = 1, sugerencia: string = '') => {
    console.log("🟢 === DEBUG ADDTOCART COMPLETO ===");
    console.log("Artículo código:", articulo?.codigo_interno);
    console.log("Nombre:", nombre);
    console.log("Cantidad:", cantidad);
    console.log("Sugerencia recibida:", `"${sugerencia}"`);
    console.log("¿Sugerencia tiene contenido?", !!sugerencia && sugerencia.trim() !== '');
    console.log("Longitud sugerencia:", sugerencia?.length || 0);
    
    setCart((prev) => {
      const found = prev.find((i) => i.codigo_interno === articulo.codigo_interno);
      if (found) {
        console.log("🟡 Item ya existe en carrito, actualizando...");
        const updatedCart = prev.map((i) =>
          i.codigo_interno === articulo.codigo_interno
            ? { 
                ...i, 
                cantidad: i.cantidad + cantidad,
                precio_venta: articulo.precio_venta || i.precio_venta,
                sugerencia: sugerencia || i.sugerencia // ✅ Usar nueva sugerencia o mantener existente
              }
            : i
        );
        console.log("🟢 Carrito actualizado:", updatedCart);
        return updatedCart;
      }
      
      console.log("🟡 Item nuevo, agregando al carrito...");
      const nuevoItem = {
        codigo_interno: articulo.codigo_interno,
        modelo: articulo.modelo,
        item_nombre: articulo.item_nombre || nombre || 'Sin nombre',
        cantidad: cantidad,
        precio_venta: Number(articulo.precio_venta) || 0,
        sugerencia: sugerencia, // ✅ Agregar sugerencia
      };
      
      console.log("🟢 Nuevo item creado:", nuevoItem);
      const nuevoCarrito = [...prev, nuevoItem];
      console.log("🟢 Carrito completo después de agregar:", nuevoCarrito);
      
      return nuevoCarrito;
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

  const setItemQuantity = (codigo_interno: string, cantidad: number, articulo?: Articulo) => {
    setCart((prev) => {
      const found = prev.find((i) => i.codigo_interno === codigo_interno);
      if (found) {
        if (cantidad === 0) {
          return prev.filter((i) => i.codigo_interno !== codigo_interno);
        } else {
          return prev.map((i) =>
            i.codigo_interno === codigo_interno
              ? { ...i, cantidad: Math.max(cantidad, 0) }
              : i
          );
        }
      } else if (cantidad > 0 && articulo) {
        return [
          ...prev,
          {
            codigo_interno: articulo.codigo_interno,
            modelo: articulo.modelo,
            item_nombre: articulo.item_nombre || 'Sin nombre',
            cantidad,
            precio_venta: articulo.precio_venta,
            sugerencia: '', // ✅ Sugerencia vacía por defecto
          },
        ];
      }
      return prev;
    });
  };

  // ✅ Nueva función para actualizar sugerencias
  const updateSugerencia = (codigo_interno: string, sugerencia: string) => {
    console.log("🟡 Actualizando sugerencia para:", codigo_interno, "Nueva sugerencia:", sugerencia);
    setCart((prev) =>
      prev.map((i) =>
        i.codigo_interno === codigo_interno
          ? { ...i, sugerencia }
          : i
      )
    );
  };

  const clearCart = () => {
    console.log("🟡 Limpiando carrito completo");
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      changeQuantity, 
      setItemQuantity, 
      updateSugerencia, // ✅ Exportar nueva función
      clearCart 
    }}>
      {children}
    </CartContext.Provider>
  );
}