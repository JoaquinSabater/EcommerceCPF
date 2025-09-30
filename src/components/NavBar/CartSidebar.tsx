'use client';

import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { useCart } from '@/components/CartContext';
import QuantityButton from '../QuantityButton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProspectoMode } from '@/hooks/useProspectoMode';

export default function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { cart, changeQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { isProspectoMode, prospectoData } = useProspectoMode();
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

  const totalEnPesos = cart.reduce(
    (sum, item) => sum + (item.cantidad * item.precio_venta * dolar),
    0
  );

  const handleBuy = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      const itemsCarrito = cart.map(item => ({
        codigo_interno: item.codigo_interno,
        modelo: item.modelo,
        cantidad: item.cantidad,
        precio: item.precio_venta,
        item_nombre: item.item_nombre,
        sugerencia: item.sugerencia || ''
      }));

      let response;

      if (isProspectoMode) {
        // ✅ PROSPECTO: Crear pedido preliminar sin cliente/vendedor (NULLs)
        response = await fetch('/api/pedidos-prospecto', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prospectoData,
            itemsCarrito,
            observaciones: `Pedido de prospecto ${prospectoData?.nombre} - Total: $${Math.round(totalEnPesos).toLocaleString()} ARS`
          }),
        });
      } else {
        // ✅ CLIENTE: Crear pedido preliminar normal
        if (!user) {
          alert('Debes iniciar sesión para realizar una compra');
          router.push('/auth/login');
          return;
        }

        response = await fetch('/api/pedidos-preliminares', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clienteId: user.id,
            itemsCarrito,
            observaciones: `Pedido creado desde el carrito - Total: $${Math.round(totalEnPesos).toLocaleString()} ARS`
          }),
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        clearCart();
        onClose();
        
        if (isProspectoMode) {
          alert(`¡Solicitud enviada exitosamente! Número de pedido preliminar: ${data.pedidoPreliminarId}. El vendedor se pondrá en contacto contigo pronto.`);
        } else {
          alert(`¡Pedido creado exitosamente! Número de pedido preliminar: ${data.pedidoPreliminarId}`);
          router.push('/admin/pedidos');
        }
      } else {
        throw new Error(data.error || 'Error al crear el pedido');
      }

    } catch (error) {
      console.error('Error al crear pedido:', error);
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
        className={`fixed top-0 right-0 z-50 h-full w-96 max-w-full bg-white text-black shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* ✅ HEADER MÁS COMPACTO */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🛒 Mi carrito
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
              <Image src="/cart.svg" width={40} height={40} alt="Empty cart" className="opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-700 mb-1">Tu carrito está vacío</p>
              <p className="text-sm text-gray-500">Agrega algunos productos para comenzar</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100%-64px)]">
            {/* ✅ LISTA DE PRODUCTOS - MÁS COMPACTA */}
            <div className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-3">
                {cart.map((item) => (
                  <li key={item.codigo_interno} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">{item.modelo}</div>
                        <div className="text-xs text-gray-500 mb-2">{item.item_nombre}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-orange-600 font-bold text-sm">
                            ${Math.round(item.precio_venta * dolar).toLocaleString()}
                          </span>
                          <span className="text-xs text-gray-500">c/u</span>
                        </div>
                        {item.sugerencia && (
                          <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                            <div className="text-xs font-medium text-blue-800">💡 Sugerencia:</div>
                            <div className="text-xs text-blue-700">{item.sugerencia}</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0">
                        <QuantityButton
                          value={item.cantidad}
                          onAdd={() => changeQuantity(item.codigo_interno, 1)}
                          onRemove={() => changeQuantity(item.codigo_interno, -1)}
                          onSet={(val) => changeQuantity(item.codigo_interno, val - item.cantidad)}
                          modelo={item.modelo}
                          hideModelo={true}
                          size="normal"
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* ✅ FOOTER MÁS COMPACTO */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">Total</span>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    ${Math.round(totalEnPesos).toLocaleString()} ARS
                  </div>
                  <div className="text-xs text-gray-500">
                    USD ${cart.reduce((sum, item) => sum + (item.cantidad * item.precio_venta), 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 rounded-lg font-bold transition-all transform hover:scale-[1.02] hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                onClick={handleBuy}
                disabled={isCreatingOrder || cart.length === 0}
              >
                {isCreatingOrder ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : (
                  isProspectoMode ? '📝 Enviar pedido al vendedor' : '💳 Realizar pedido'
                )}
              </button>

              {/* ✅ MENSAJE PARA PROSPECTOS - MÁS COMPACTO */}
              {isProspectoMode && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500 text-sm">👋</span>
                    <div>
                      <p className="text-orange-800 font-semibold text-xs">
                        ¡Hola {prospectoData?.nombre}!
                      </p>
                      <p className="text-orange-700 text-xs">
                        Tu pedido será enviado al vendedor para que se contacte contigo
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}