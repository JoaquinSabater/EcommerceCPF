"use client";

import React, { useState } from "react";
import QuantityButton from "@/components/QuantityButton";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/components/CartContext";

interface SearchQuantityButtonProps {
  itemId: number;
  codigoInterno: string;
  itemName: string;
  modelo: string;
  maxStock: number;
  precio: number;
  onAddToCart?: (item: any) => void;
  className?: string;
}

export default function SearchQuantityButton({ 
  itemId, 
  codigoInterno, 
  itemName,
  modelo,
  maxStock, 
  precio,
  onAddToCart,
  className = "" 
}: SearchQuantityButtonProps) {
  const [quantity, setQuantity] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCart();

  const handleAdd = () => {
    if (quantity < maxStock) {
      setQuantity(prev => prev + 1);
    }
  };

  const handleRemove = () => {
    if (quantity > 0) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleSet = (value: number) => {
    if (value > maxStock) {
      setQuantity(maxStock);
    } else if (value >= 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (quantity === 0) return;
    
    setIsAdding(true);
    
    try {
      // ✅ CORREGIDO: Crear objeto con la estructura correcta que espera CartContext
      const articulo = {
        codigo_interno: codigoInterno,
        item_id: itemId,
        marca_id: 0,
        modelo: modelo,
        code: '',
        precio_venta: Number(precio), // ✅ Asegurar que sea número
        ubicacion: '',
        stock_actual: maxStock,
        stock_real: maxStock, // ✅ IMPORTANTE: CartContext usa stock_real
        item_nombre: itemName
      };

      console.log('🛒 Agregando al carrito desde búsqueda:', {
        articulo,
        nombre: itemName,
        cantidad: quantity
      });

      // ✅ CORREGIDO: Pasar parámetros en el orden correcto
      addToCart(articulo, itemName, quantity, ''); // (articulo, nombre, cantidad, sugerencia)

      if (onAddToCart) {
        const cartItem = {
          itemId,
          codigoInterno,
          itemName,
          modelo,
          precio,
          quantity,
          maxStock
        };
        onAddToCart(cartItem);
      }

      // ✅ CORREGIDO: Mensaje más específico
      alert(`✅ ${quantity} x ${modelo} agregado al carrito`);
      setQuantity(0);
      
    } catch (error) {
      console.error('❌ Error al agregar al carrito:', error);
      alert('❌ Error al agregar al carrito. Intenta nuevamente.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`flex flex-col gap-3 min-w-[120px] ${className}`}>
      <div className="flex justify-center">
        <QuantityButton
          value={quantity}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onSet={handleSet}
          modelo={modelo}
          hideModelo={true}
          size="normal"
          maxStock={maxStock}
        />
      </div>

      {quantity > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || maxStock <= 0}
            className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md min-w-[100px]"
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Agregando...</span>
              </>
            ) : (
              <>
                <ShoppingCartIcon className="w-4 h-4" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}