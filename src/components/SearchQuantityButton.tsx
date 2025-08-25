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
    if (value <= maxStock && value >= 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = async () => {
    if (quantity === 0) return;
    
    setIsAdding(true);
    
    try {
      // Crear objeto Articulo compatible con CartContext
      const articulo = {
        codigo_interno: codigoInterno,
        item_id: itemId,
        marca_id: 0, // Valor por defecto
        modelo: modelo,
        code: '', // Valor por defecto
        precio_venta: precio,
        ubicacion: '', // Valor por defecto
        stock_actual: maxStock,
        item_nombre: itemName
      };

      // Usar el CartContext
      addToCart(articulo, itemName, quantity);

      // Callback opcional
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

      // Mostrar confirmación
      alert(`${quantity} ${itemName} agregado al carrito`);
      
      // Resetear cantidad después de agregar
      setQuantity(0);
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('Error al agregar al carrito');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 min-w-[100px] ${className}`}>
      {/* Quantity Button */}
      <div className="flex justify-center">
        <QuantityButton
          value={quantity}
          onAdd={handleAdd}
          onRemove={handleRemove}
          onSet={handleSet}
          modelo={modelo}
          hideModelo={true}
          size="xs"
        />
      </div>

      {/* Botón Agregar - aparece cuando quantity > 0 */}
      {quantity > 0 && (
        <div className="flex justify-center">
          <button
            onClick={handleAddToCart}
            disabled={isAdding || maxStock <= 0}
            className="flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md min-w-[80px]"
          >
            {isAdding ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                <span>Agregando...</span>
              </>
            ) : (
              <>
                <ShoppingCartIcon className="w-3.5 h-3.5" />
                <span>Agregar</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}