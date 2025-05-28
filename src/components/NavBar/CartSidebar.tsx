'use client';

import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import QuantityButton from '../QuantityButton';
import { useRouter } from 'next/navigation';


export default function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { cart, changeQuantity } = useCart();
  const router = useRouter();

  const dolar = Number(process.env.NEXT_PUBLIC_DOLAR || 1);

  const totalUSD = cart.reduce(
    (sum, item) => sum + (item.cantidad * item.precio_venta) / dolar,
    0
  );

  const handleBuy = () => {
    // Guarda el carrito en localStorage para que la página de resumen lo lea
    localStorage.setItem('cartItems', JSON.stringify(cart));
    router.push('/carrito');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        window.innerWidth >= 768
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 z-50 h-full w-80 max-w-full bg-white text-black shadow-lg transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            Mi carrito
          </h2>
          <button onClick={onClose} className="p-2 border rounded text-black bg-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <Image src="/cart.svg" width={48} height={48} alt="Empty cart" />
            <p className="text-xl font-semibold text-center">Tu carrito está vacío</p>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100%-64px)]">
            <ul className="space-y-4 flex-1 overflow-y-auto p-4">
              {cart.map((item) => (
                <li key={item.codigo_interno} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{item.modelo}</div>
                    <div className="text-xs text-gray-500">{item.item_nombre}</div>
                  </div>
                  <QuantityButton
                    onAdd={() => changeQuantity(item.codigo_interno, 1)}
                    onRemove={() => changeQuantity(item.codigo_interno, -1)}
                  >
                    {item.cantidad}
                  </QuantityButton>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-200 pt-4 px-4 pb-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">
                  {totalUSD.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition"
                onClick={handleBuy}
              >
                Comprar
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}