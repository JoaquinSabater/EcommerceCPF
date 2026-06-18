"use client";

import { useState } from 'react';
import { MinusIcon, PlusIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/components/CartContext';
import { Articulo } from '@/types/types';
import { getMaxAllowedQuantity, getQuantityStep, normalizeQuantity } from '@/lib/quantityRules';

interface FiltrosQuantityButtonProps {
  itemId: number;
  codigoInterno: string;
  itemName: string;
  modelo: string;
  maxStock: number;
  precio: number;
  deA10?: number;
  onAddToCart?: (item: any) => void;
  className?: string;
  compact?: boolean;
}

export default function FiltrosQuantityButton({
  itemId,
  codigoInterno,
  itemName,
  modelo,
  maxStock,
  precio,
  deA10 = 0,
  onAddToCart,
  className = "",
  compact = false
}: FiltrosQuantityButtonProps) {
  const [quantity, setQuantity] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const quantityRuleItem = { de_a_10: deA10 };
  const quantityStep = getQuantityStep(quantityRuleItem);
  const maxCantidadPermitida = getMaxAllowedQuantity(maxStock, quantityRuleItem);

  const handleQuantityChange = (newQuantity: number) => {
    setError('');
    
    if (newQuantity < 0) {
      setError('La cantidad no puede ser negativa');
      return;
    }
    
    if (newQuantity > maxCantidadPermitida) {
      setError(`Solo hay ${maxCantidadPermitida} unidades disponibles`);
      return;
    }
    
    setQuantity(normalizeQuantity(newQuantity, quantityRuleItem, maxStock));
  };

  const handleInputChange = (value: string) => {
    if (value === '') {
      setQuantity(0);
      setError('');
      return;
    }
    
    const newQuantity = parseInt(value);
    if (!isNaN(newQuantity)) {
      handleQuantityChange(newQuantity);
    }
  };

  const handleAddToCart = async () => {
    if (quantity === 0) {
      setError('Selecciona una cantidad mayor a 0');
      return;
    }
    
    if (quantity > maxCantidadPermitida) {
      setError(`Solo hay ${maxCantidadPermitida} unidades disponibles`);
      return;
    }

    setIsAdding(true);
    setError('');
    
    try {
      const articulo: Articulo = {
        codigo_interno: codigoInterno,
        item_id: itemId,
        marca_id: 0,
        modelo: modelo,
        code: '',
        precio_venta: Number(precio),
        ubicacion: '',
        stock_actual: maxStock,
        stock_real: maxStock,
        item_nombre: itemName,
        de_a_10: deA10
      };

      addToCart(articulo, itemName, quantity, '');
      
      if (onAddToCart) {
        onAddToCart({
          item_id: itemId,
          codigo_interno: codigoInterno,
          nombre: itemName,
          modelo: modelo,
          precio: precio,
          cantidad: quantity,
          stock_disponible: maxStock,
          de_a_10: deA10
        });
      }

      setQuantity(0);
      
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      setError('Error al agregar al carrito');
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {/* ✅ NUEVO: Selector de cantidad ocupando todo el ancho */}
      <div className="flex items-stretch border border-gray-300 rounded-lg overflow-hidden bg-white w-full">
        {/* Botón menos - lado izquierdo */}
        <button
          onClick={() => handleQuantityChange(quantity - quantityStep)}
          disabled={quantity <= 0}
          className={`flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-gray-200 ${compact ? 'w-9 p-2' : 'w-12 p-3'}`}
          title={quantity <= 0 ? "No se puede reducir más" : "Reducir cantidad"}
        >
          <MinusIcon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600`} />
        </button>
        
        {/* Input número - centro expandido */}
        <input
          type="number"
          min="0"
          max={maxCantidadPermitida}
          step={quantityStep}
          value={quantity === 0 ? '' : quantity}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="0"
          className={`flex-1 text-center border-0 focus:ring-0 font-medium placeholder-gray-400 bg-white ${compact ? 'py-2 text-xs' : 'py-3 text-sm'}`}
        />
        
        {/* Botón plus - lado derecho */}
        <button
          onClick={() => handleQuantityChange(quantity + quantityStep)}
          disabled={quantity + quantityStep > maxCantidadPermitida}
          className={`flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-l border-gray-200 ${compact ? 'w-9 p-2' : 'w-12 p-3'}`}
          title={quantity + quantityStep > maxCantidadPermitida ? `Stock máximo: ${maxCantidadPermitida}` : "Aumentar cantidad"}
        >
          <PlusIcon className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gray-600`} />
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <p className="text-xs text-red-600 text-center bg-red-50 px-2 py-1 rounded">
          {error}
        </p>
      )}

      {/* ✅ NUEVO: Botón agregar ocupando todo el ancho */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || quantity === 0 || quantity > maxCantidadPermitida}
        className={`
          w-full rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2
          ${compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'}
          ${isAdding 
            ? 'bg-green-500 text-white' 
            : quantity === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }
        `}
        style={quantity > 0 && !isAdding ? { backgroundColor: '#ea580c' } : {}}
        title={quantity === 0 ? "Selecciona una cantidad" : quantity > maxCantidadPermitida ? `Stock máximo: ${maxCantidadPermitida}` : "Agregar al carrito"}
      >
        {isAdding ? (
          <>
            ¡Agregado!
          </>
        ) : (
          <>
            {quantity === 0 ? 'Seleccionar' : 'Agregar'}
          </>
        )}
      </button>
      {maxCantidadPermitida <= 5 && maxCantidadPermitida > 0 && quantity < maxCantidadPermitida && (
        <p className={`text-xs text-amber-600 text-center ${compact ? 'hidden' : ''}`}>
          ¡Últimas {maxCantidadPermitida} unidades!
        </p>
      )}

      {quantity + quantityStep > maxCantidadPermitida && maxCantidadPermitida > 0 && (
        <p className={`text-xs text-red-600 text-center bg-red-50 px-2 py-1 rounded-full ${compact ? 'hidden' : ''}`}>
          ¡Máximo disponible!
        </p>
      )}

      {maxCantidadPermitida === 0 && (
        <p className={`text-xs text-red-600 text-center bg-red-50 px-2 py-1 rounded-full ${compact ? 'hidden' : ''}`}>
          Sin stock disponible
        </p>
      )}
    </div>
  );
}
