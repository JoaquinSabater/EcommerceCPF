'use client';

import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import QuantityButton from '../QuantityButton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { cart, changeQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [dolar, setDolar] = useState<number>(1);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    async function fetchDolar() {
      try {
        const res = await fetch('/api/dolar');
        const data = await res.json();
        setDolar(data.dolar || 1);
      } catch (e) {
        setDolar(1);
      }
    }
    fetchDolar();
  }, []);

  const totalLocal = cart.reduce(
    (sum, item) => sum + (item.cantidad * item.precio_venta),
    0
  );

  const handleBuy = async () => {
    if (!user) {
      alert('Debes iniciar sesión para realizar una compra');
      router.push('/auth/login');
      return;
    }

    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      // Convertir el carrito al formato que espera la API
      const itemsCarrito = cart.map(item => ({
        codigo_interno: item.codigo_interno,
        modelo: item.modelo,
        cantidad: item.cantidad,
        precio: item.precio_venta,
        item_nombre: item.item_nombre
      }));

      console.log('Enviando pedido preliminar:', {
        clienteId: user.id,
        vendedorId: 1, // Por ahora usamos vendedor ID 1, puedes cambiarlo
        itemsCarrito
      });

      const response = await fetch('/api/pedidos-preliminares', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clienteId: user.id,
          vendedorId: 1, // Puedes obtener esto del contexto o usuario
          itemsCarrito,
          observaciones: `Pedido creado desde el carrito - Total: $${totalLocal.toLocaleString()}`
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Éxito - limpiar carrito y mostrar mensaje
        clearCart();
        onClose();
        
        alert(`¡Pedido creado exitosamente! Número de pedido preliminar: ${data.pedidoPreliminarId}`);
        
        // Opcional: redirigir a una página de confirmación o pedidos
        router.push('/admin/pedidos');
      } else {
        throw new Error(data.error || 'Error al crear el pedido');
      }

    } catch (error) {
      console.error('Error al crear pedido preliminar:', error);
      alert('Error al crear el pedido. Por favor, inténtalo de nuevo.');
    } finally {
      setIsCreatingOrder(false);
    }
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
                      value={item.cantidad}
                      onAdd={() => changeQuantity(item.codigo_interno, 1)}
                      onRemove={() => changeQuantity(item.codigo_interno, -1)}
                      onSet={(val) => changeQuantity(item.codigo_interno, val - item.cantidad)}
                      modelo={item.modelo}
                      hideModelo={true}
                      size="normal"
                    />
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-200 pt-4 px-4 pb-4 bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold">
                    ${totalLocal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              <button
                className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                onClick={handleBuy}
                disabled={isCreatingOrder || cart.length === 0}
              >
                {isCreatingOrder ? 'Creando pedido...' : 'Comprar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}