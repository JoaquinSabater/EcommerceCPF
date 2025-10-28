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
  const { cart, changeQuantity, clearCart, getStockWarnings } = useCart(); 
  const { user, getPrecioConDescuento, isDistribuidor } = useAuth();
  const { isProspectoMode, prospectoData } = useProspectoMode();
  const router = useRouter();

  const [dolar, setDolar] = useState<number>(1);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // ✅ NUEVO: Estados para swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  // ✅ NUEVO: Obtener advertencias de stock
  const stockValidation = getStockWarnings();

  // ✅ NUEVO: Funciones para manejar swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) {
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -50;

    if (isRightSwipe) {
      onClose();
    }

    setIsDragging(false);
    setTouchStart(0);
    setTouchEnd(0);
  };

  // ✅ Calcular total VISUAL (con descuento) pero mantener precios originales en cart
  const totalEnPesos = cart.reduce(
    (sum, item) => {
      const precioConDescuento = getPrecioConDescuento(item.precio_venta);
      return sum + (item.cantidad * precioConDescuento * dolar);
    },
    0
  );

  const handleBuy = async () => {
    if (cart.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    // ✅ NUEVO: Validar stock antes de proceder
    if (stockValidation.hasWarnings) {
      const errorsMessage = stockValidation.warnings.join('\n');
      alert(`⚠️ Hay problemas de stock:\n\n${errorsMessage}\n\nPor favor, ajusta las cantidades antes de continuar.`);
      return;
    }

    setIsCreatingOrder(true);
    
    try {
      // ✅ IMPORTANTE: Enviar precios ORIGINALES al pedido (sin descuento)
      const itemsCarrito = cart.map(item => ({
        codigo_interno: item.codigo_interno,
        modelo: item.modelo,
        cantidad: item.cantidad,
        precio: item.precio_venta, // ✅ Precio original (sin descuento)
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
            observaciones: `Pedido de prospecto ${prospectoData?.nombre} - Total: $${Math.round(totalEnPesos).toLocaleString()} ARS${isDistribuidor() ? ' (precio mostrado con descuento distribuidor)' : ''}`
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
            observaciones: `Pedido creado desde el carrito - Total: $${Math.round(totalEnPesos).toLocaleString()} ARS${isDistribuidor() ? ' (precio mostrado con descuento distribuidor)' : ''}`
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

  // ✅ MEJORADO: Manejo de eventos con prevención de scroll
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
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* ✅ NUEVO: Overlay con backdrop blur */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* ✅ Panel del carrito CON SWIPE */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 z-50 h-full w-96 max-w-full bg-white text-black shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ✅ HEADER CON BADGE DISTRIBUIDOR */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            🛒 Mi carrito
            {isDistribuidor() && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                20% OFF
              </span>
            )}
            <span className="text-xs text-gray-500 ml-2">Desliza para cerrar →</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white rounded-full transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* ✅ NUEVO: Advertencias de stock */}
        {stockValidation.hasWarnings && (
          <div className="p-3 bg-red-50 border-b border-red-200">
            <div className="text-red-800 text-sm font-medium mb-1">⚠️ Problemas de stock:</div>
            {stockValidation.warnings.map((warning, index) => (
              <div key={index} className="text-red-700 text-xs">{warning}</div>
            ))}
          </div>
        )}

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
            {/* ✅ LISTA DE PRODUCTOS CON PRECIOS CON DESCUENTO Y STOCK */}
            <div className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-3">
                {cart.map((item) => {
                  const precioConDescuento = getPrecioConDescuento(item.precio_venta);
                  const precioFinalPesos = Math.round(precioConDescuento * dolar);
                  const stockDisponible = Number(item.stock_real || 0);
                  const stockColor = item.cantidad > stockDisponible ? 'text-red-600' : 
                                   stockDisponible > 10 ? 'text-green-600' : 'text-yellow-600';
                  
                  return (
                    <li key={item.codigo_interno} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm leading-tight mb-1">{item.modelo}</div>
                          <div className="text-xs text-gray-500 mb-2">{item.item_nombre}</div>
                          <div className="flex items-center gap-2">
                            <span className="text-orange-600 font-bold text-sm">
                              ${precioFinalPesos.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">c/u</span>
                            {isDistribuidor() && (
                              <span className="text-xs bg-green-100 text-green-700 px-1 py-0.5 rounded">
                                -20%
                              </span>
                            )}
                          </div>
                          {/* ✅ NUEVO: Mostrar info de stock */}
                          <div className={`text-xs ${stockColor} mt-1`}>
                            Stock: {stockDisponible} 
                            {item.cantidad > stockDisponible && (
                              <span className="ml-1 font-medium">⚠️ Excede stock</span>
                            )}
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
                            maxStock={stockDisponible} // ✅ NUEVO: Pasar stock máximo
                          />
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* ✅ FOOTER CON TOTAL CON DESCUENTO */}
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-gray-900">
                  Total
                  {isDistribuidor() && (
                    <span className="ml-2 text-xs text-green-600">(con 20% OFF)</span>
                  )}
                </span>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    ${Math.round(totalEnPesos).toLocaleString()} ARS
                  </div>
                  <div className="text-xs text-gray-500">
                    USD ${cart.reduce((sum, item) => {
                      const precioConDescuento = getPrecioConDescuento(item.precio_venta);
                      return sum + (item.cantidad * precioConDescuento);
                    }, 0).toFixed(2)}
                    {isDistribuidor() && (
                      <span className="ml-1 text-green-600">(-20%)</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                className={`w-full py-3 rounded-lg font-bold transition-all transform hover:scale-[1.02] disabled:transform-none shadow-md ${
                  stockValidation.hasWarnings 
                    ? 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed opacity-75'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                onClick={handleBuy}
                disabled={isCreatingOrder || cart.length === 0 || stockValidation.hasWarnings}
              >
                {isCreatingOrder ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : stockValidation.hasWarnings ? (
                  '⚠️ Ajustar cantidades'
                ) : (
                  isProspectoMode ? '📝 Enviar pedido al vendedor' : '💳 Realizar pedido'
                )}
              </button>

              {/* ✅ MENSAJE PARA PROSPECTOS Y DISTRIBUIDORES */}
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

              {isDistribuidor() && !isProspectoMode && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500 text-sm">🎉</span>
                    <div>
                      <p className="text-green-800 font-semibold text-xs">
                        Descuento Distribuidor Aplicado
                      </p>
                      <p className="text-green-700 text-xs">
                        Los precios mostrados incluyen tu 20% de descuento
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