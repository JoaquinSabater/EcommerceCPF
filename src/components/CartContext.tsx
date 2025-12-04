"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Articulo } from "@/types/types";

type CartItem = {
  codigo_interno: string;
  modelo: string;
  item_nombre: string;
  cantidad: number;
  precio_venta: number; 
  sugerencia?: string;
  stock_real: number;
  // ✅ NUEVO: Agregar campos de imagen
  foto_portada?: string;
  foto1_url?: string;
  item_id?: number; // Para poder obtener imágenes si no las tenemos
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (articulo: Articulo, nombre: string, cantidad?: number, sugerencia?: string) => void;
  removeFromCart: (codigo_interno: string) => void;
  changeQuantity: (codigo_interno: string, delta: number) => void;
  setItemQuantity: (codigo_interno: string, cantidad: number, articulo?: Articulo) => void;
  updateSugerencia: (codigo_interno: string, sugerencia: string) => void;
  clearCart: () => void;
  getStockWarnings: () => { hasWarnings: boolean; warnings: string[] };
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'ecommerce_cart';

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

// ✅ NUEVO: Función helper para obtener imagen principal
const getCloudinaryImageUrl = (dataDetail: any): string => {
  if (dataDetail.foto_portada && dataDetail.foto_portada.trim() !== '') {
    return dataDetail.foto_portada;
  } else if (dataDetail.foto1_url && dataDetail.foto1_url.trim() !== '') {
    return dataDetail.foto1_url;
  } else if (dataDetail.foto2_url && dataDetail.foto2_url.trim() !== '') {
    return dataDetail.foto2_url;
  } else if (dataDetail.foto3_url && dataDetail.foto3_url.trim() !== '') {
    return dataDetail.foto3_url;
  } else if (dataDetail.foto4_url && dataDetail.foto4_url.trim() !== '') {
    return dataDetail.foto4_url;
  }
  return '';
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      }
    } catch (error) {
      console.error('Error cargando carrito desde localStorage:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar carrito en localStorage cada vez que cambie
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch (error) {
        console.error('Error guardando carrito en localStorage:', error);
      }
    }
  }, [cart, isLoaded]);

  // ✅ Función para obtener advertencias de stock
  const getStockWarnings = () => {
    const warnings: string[] = [];
    
    cart.forEach(item => {
      if (item.cantidad > item.stock_real) {
        warnings.push(`${item.modelo}: solicitado ${item.cantidad}, disponible ${item.stock_real}`);
      }
    });
    
    return {
      hasWarnings: warnings.length > 0,
      warnings
    };
  };

  const addToCart = async (articulo: Articulo, nombre: string, cantidad: number = 1, sugerencia: string = '') => {
    setCart((prev) => {
      const found = prev.find((i) => i.codigo_interno === articulo.codigo_interno);
      if (found) {
        // ✅ SILENCIOSO: No exceder stock disponible (sin alert)
        const stockDisponible = Number(articulo.stock_real || found.stock_real || 0);
        const nuevaCantidad = found.cantidad + cantidad;
        
        if (nuevaCantidad > stockDisponible) {
          // ✅ SILENCIOSO: Solo agregar hasta el máximo disponible
          const cantidadMaximaAAgregar = Math.max(0, stockDisponible - found.cantidad);
          if (cantidadMaximaAAgregar <= 0) {
            return prev; // No se puede agregar nada
          }
          
          const updatedCart = prev.map((i) =>
            i.codigo_interno === articulo.codigo_interno
              ? { 
                  ...i, 
                  cantidad: stockDisponible, // ✅ Establecer al máximo disponible
                  precio_venta: articulo.precio_venta || i.precio_venta,
                  sugerencia: sugerencia || i.sugerencia,
                  stock_real: Number(articulo.stock_real || i.stock_real || 0)
                }
              : i
          );
          return updatedCart;
        }
        
        const updatedCart = prev.map((i) =>
          i.codigo_interno === articulo.codigo_interno
            ? { 
                ...i, 
                cantidad: nuevaCantidad,
                precio_venta: articulo.precio_venta || i.precio_venta,
                sugerencia: sugerencia || i.sugerencia,
                stock_real: Number(articulo.stock_real || i.stock_real || 0)
              }
            : i
        );
        return updatedCart;
      }
      
      // ✅ SILENCIOSO: Stock para nuevo item (sin alert)
      const stockDisponible = Number(articulo.stock_real || 0);
      if (cantidad > stockDisponible) {
        if (stockDisponible <= 0) {
          return prev; // No agregar nada si no hay stock
        }
        // ✅ Agregar solo la cantidad disponible
        cantidad = stockDisponible;
      }
      
      // ✅ NUEVO: Obtener imagen del producto de forma asíncrona
      const nuevoItem: CartItem = {
        codigo_interno: articulo.codigo_interno,
        modelo: articulo.modelo,
        item_nombre: articulo.item_nombre || nombre || 'Sin nombre',
        cantidad: cantidad,
        precio_venta: Number(articulo.precio_venta) || 0,
        sugerencia: sugerencia,
        stock_real: Number(articulo.stock_real || 0),
        item_id: articulo.item_id,
        foto_portada: '',
        foto1_url: ''
      };

      // ✅ Obtener imagen de forma asíncrona después de agregar el item
      if (articulo.item_id) {
        fetch(`/api/detalle?id=${articulo.item_id}`)
          .then(res => res.json())
          .then(dataDetail => {
            const imagenPrincipal = getCloudinaryImageUrl(dataDetail);
            if (imagenPrincipal) {
              setCart(currentCart => 
                currentCart.map(item => 
                  item.codigo_interno === articulo.codigo_interno 
                    ? { 
                        ...item, 
                        foto_portada: dataDetail.foto_portada || '',
                        foto1_url: dataDetail.foto1_url || ''
                      }
                    : item
                )
              );
            }
          })
          .catch(error => {
            console.warn(`No se pudo obtener imagen para ${articulo.modelo}:`, error);
          });
      }
      
      return [...prev, nuevoItem];
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
        .map((i) => {
          if (i.codigo_interno === codigo_interno) {
            const nuevaCantidad = Math.max(i.cantidad + delta, 0);
            
            // ✅ SILENCIOSO: No exceder stock disponible al incrementar (sin alert)
            if (delta > 0) {
              const stockDisponible = Number(i.stock_real || 0);
              if (nuevaCantidad > stockDisponible) {
                return { ...i, cantidad: stockDisponible }; // ✅ Establecer al máximo silenciosamente
              }
            }
            
            return { ...i, cantidad: nuevaCantidad };
          }
          return i;
        })
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
          // ✅ SILENCIOSO: No exceder stock disponible (sin alert)
          const stockDisponible = Number(articulo?.stock_real || found.stock_real || 0);
          const cantidadFinal = Math.min(cantidad, stockDisponible);
          
          return prev.map((i) =>
            i.codigo_interno === codigo_interno
              ? { 
                  ...i, 
                  cantidad: Math.max(cantidadFinal, 0),
                  stock_real: Number(articulo?.stock_real || i.stock_real || 0)
                }
              : i
          );
        }
      } else if (cantidad > 0 && articulo) {
        // ✅ SILENCIOSO: Stock para nuevo item (sin alert)
        const stockDisponible = Number(articulo.stock_real || 0);
        const cantidadFinal = Math.min(cantidad, stockDisponible);
        
        if (cantidadFinal <= 0) {
          return prev; // No agregar si no hay stock
        }
        
        const nuevoItem: CartItem = {
          codigo_interno: articulo.codigo_interno,
          modelo: articulo.modelo,
          item_nombre: articulo.item_nombre || 'Sin nombre',
          cantidad: cantidadFinal,
          precio_venta: articulo.precio_venta,
          sugerencia: '',
          stock_real: Number(articulo.stock_real || 0),
          item_id: articulo.item_id,
          foto_portada: '',
          foto1_url: ''
        };

        // ✅ Obtener imagen de forma asíncrona
        if (articulo.item_id) {
          fetch(`/api/detalle?id=${articulo.item_id}`)
            .then(res => res.json())
            .then(dataDetail => {
              const imagenPrincipal = getCloudinaryImageUrl(dataDetail);
              if (imagenPrincipal) {
                setCart(currentCart => 
                  currentCart.map(item => 
                    item.codigo_interno === articulo.codigo_interno 
                      ? { 
                          ...item, 
                          foto_portada: dataDetail.foto_portada || '',
                          foto1_url: dataDetail.foto1_url || ''
                        }
                      : item
                  )
                );
              }
            })
            .catch(error => {
              console.warn(`No se pudo obtener imagen para ${articulo.modelo}:`, error);
            });
        }

        return [...prev, nuevoItem];
      }
      return prev;
    });
  };

  const updateSugerencia = (codigo_interno: string, sugerencia: string) => {
    setCart((prev) =>
      prev.map((i) =>
        i.codigo_interno === codigo_interno
          ? { ...i, sugerencia }
          : i
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
      console.error('Error limpiando carrito del localStorage:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      changeQuantity, 
      setItemQuantity, 
      updateSugerencia,
      clearCart,
      getStockWarnings
    }}>
      {children}
    </CartContext.Provider>
  );
}