'use client';

import { useEffect, useRef, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { CldImage } from 'next-cloudinary'; 
import { useCart } from '@/components/CartContext';
import QuantityButton from '../QuantityButton';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useProspectoMode } from '@/hooks/useProspectoMode';
import { useDolar } from '@/contexts/DolarContext';
import { showError, showInfo, showSuccess, showWarning } from '@/lib/swal';

interface PromoAPIResponse {
  active: boolean;
  promotion: {
    id: number;
    nombre: string;
    fecha_inicio: string;
    fecha_fin: string;
    descuento_percent: number;
    max_pedidos_por_cliente: number;
  } | null;
}

export default function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { cart, changeQuantity, clearCart, getStockWarnings } = useCart(); 
  const { user, getPrecioConDescuento, isDistribuidor, esCategoriaExcluida, updateUser } = useAuth();
  const { isProspectoMode, isChatbotMode, prospectoData } = useProspectoMode();
  const router = useRouter();
  const { dolar } = useDolar(); // ✅ Usar contexto compartido

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [promoData, setPromoData] = useState<PromoAPIResponse | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // ✅ Estados para swipe
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // ✅ Obtener advertencias de stock
  const stockValidation = getStockWarnings();

  useEffect(() => {
    let isMounted = true;

    const fetchPromo = async () => {
      if (!user || isProspectoMode || isChatbotMode) {
        if (isMounted) {
          setPromoData(null);
          setPromoError(null);
        }
        return;
      }

      setPromoLoading(true);
      setPromoError(null);

      try {
        const response = await fetch('/api/promociones');
        if (!response.ok) {
          throw new Error('Respuesta no válida');
        }
        const data: PromoAPIResponse = await response.json();
        if (isMounted) {
          setPromoData(data);
        }
      } catch (error) {
        console.error('Error cargando promoción activa:', error);
        if (isMounted) {
          setPromoError('No pudimos cargar la promoción.');
        }
      } finally {
        if (isMounted) {
          setPromoLoading(false);
        }
      }
    };

    fetchPromo();

    return () => {
      isMounted = false;
    };
  }, [user?.id, isProspectoMode, isChatbotMode]);

  // ✅ Funciones para manejar swipe
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

  // ✅ NUEVO: Función para calcular precio final con exclusiones
  const maxPedidosPromo = promoData?.promotion?.max_pedidos_por_cliente ?? 0;
  const descuentoPromo = promoData?.promotion?.descuento_percent ?? 0;
  const pedidosUsados = user?.promocionPedidosCount ?? 0;
  const pedidosRestantes = Math.max(maxPedidosPromo - pedidosUsados, 0);
  const promoActivaParaCliente = Boolean(
    promoData?.active &&
    user &&
    !isProspectoMode &&
    !isChatbotMode &&
    maxPedidosPromo > 0 &&
    pedidosRestantes > 0 &&
    descuentoPromo > 0
  );

  const itemExcluidoDePromo = (item: any) => {
    // Priorizar subcategoria_id cuando exista para excluir TODA la pestana "Otros".
    // Algunos flujos de carrito no lo traen de inicio, por eso dejamos fallback por nombre.
    if (typeof item?.subcategoria_id === 'number' && esCategoriaExcluida(item.subcategoria_id)) {
      return true;
    }

    const nombreCategoria = String(item?.item_nombre || '').toLowerCase();
    return nombreCategoria.includes('celulares') ||
      nombreCategoria.includes('auriculares') ||
      nombreCategoria.includes('proyector') ||
      nombreCategoria.includes('electronica') ||
      nombreCategoria.includes('electrónica');
  };

  const calcularPrecioFinal = (item: any) => {
    // Usar item_id para verificar exclusión de descuento
    const itemExcluido = itemExcluidoDePromo(item);
    
    let precioCalculado = itemExcluido
      ? item.precio_venta
      : getPrecioConDescuento(item.precio_venta, { id: item.item_id });

    if (promoActivaParaCliente && !itemExcluido) {
      precioCalculado = precioCalculado * (1 - descuentoPromo / 100);
    }

    return precioCalculado;
  };

  const hayPromoAplicadaEnCarrito = promoActivaParaCliente && cart.some((item) => !itemExcluidoDePromo(item));

  // ✅ Calcular total VISUAL (con descuento) pero mantener precios originales en cart
  const totalEnPesos = cart.reduce(
    (sum, item) => {
      const precioConDescuento = calcularPrecioFinal(item);
      return sum + (item.cantidad * precioConDescuento * dolar);
    },
    0
  );

  const handleBuy = async () => {
    if (isChatbotMode) {
      showInfo('Modo chatbot', 'Este carrito es solo para consultas. No se pueden realizar pedidos en modo chatbot.');
      return;
    }

    if (cart.length === 0) {
      showInfo('Carrito vacio', 'Agrega productos antes de continuar.');
      return;
    }

    // ✅ Validar stock antes de proceder
    if (stockValidation.hasWarnings) {
      const errorsMessage = stockValidation.warnings.join('\n');
      showWarning('Problemas de stock', `${errorsMessage}\n\nAjusta las cantidades antes de continuar.`);
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
          showWarning('Inicia sesion', 'Debes iniciar sesión para realizar una compra.');
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
          showSuccess('Solicitud enviada', `Número de pedido preliminar: ${data.pedidoPreliminarId}. El vendedor se pondrá en contacto contigo pronto.`);
        } else {
          showSuccess('Pedido creado', `Número de pedido preliminar: ${data.pedidoPreliminarId}`);
          if (typeof data.promocionPedidosCount === 'number' && user) {
            updateUser({ ...user, promocionPedidosCount: data.promocionPedidosCount });
          }
          router.push('/admin/pedidos');
        }
      } else {
        throw new Error(data.error || 'Error al crear el pedido');
      }

    } catch (error) {
      console.error('Error al crear pedido:', error);
      showError('Error al crear el pedido', 'Por favor, intentalo de nuevo.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  // ✅ Manejo de eventos con prevención de scroll
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
      {/* ✅ Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
          onClick={onClose}
        />
      )}

      {/* ✅ Panel del carrito CON SWIPE */}
      <div
        ref={sidebarRef}
        className="fixed top-0 right-0 z-50 h-full w-96 max-w-full bg-white text-black"
        style={{
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ✅ HEADER CON BADGES */}
        <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: '#e5e7eb', background: 'linear-gradient(to right, #fff7ed, #ffedd5)' }}>
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1f2937' }}>
            🛒 Mi carrito
            {isDistribuidor() && (
              <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                20% OFF
              </span>
            )}
            <span className="text-xs ml-2" style={{ color: '#6b7280' }}>Desliza para cerrar →</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full"
          >
            <XMarkIcon className="h-5 w-5" style={{ color: '#4b5563' }} />
          </button>
        </div>

        {/* ✅ Advertencias de stock */}
        {stockValidation.hasWarnings && (
          <div className="p-3 border-b" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
            <div className="text-sm font-medium mb-1" style={{ color: '#991b1b' }}>⚠️ Problemas de stock:</div>
            {stockValidation.warnings.map((warning, index) => (
              <div key={index} className="text-xs" style={{ color: '#b91c1c' }}>{warning}</div>
            ))}
          </div>
        )}

        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 p-8">
            <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
              <Image src="/cart.svg" width={40} height={40} alt="Empty cart" className="opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold mb-1" style={{ color: '#374151' }}>Tu carrito está vacío</p>
              <p className="text-sm" style={{ color: '#6b7280' }}>Agrega algunos productos para comenzar</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100%-64px)]">
            {/* ✅ LISTA DE PRODUCTOS CON IMÁGENES Y PRECIOS CON DESCUENTO Y STOCK */}
            <div className="flex-1 overflow-y-auto p-3">
              <ul className="space-y-3">
                {cart.map((item) => {
                  const precioConDescuento = calcularPrecioFinal(item);
                  const precioFinalPesos = Math.round(precioConDescuento * dolar);
                  const stockDisponible = Number(item.stock_real || 0);
                  const stockColor = item.cantidad > stockDisponible ? '#dc2626' : 
                                   stockDisponible > 10 ? '#16a34a' : '#ca8a04';
                  
                  // ✅ NUEVO: Verificar si el item está excluido del descuento
                  const itemExcluido = itemExcluidoDePromo(item);
                  const hayDescuentoAplicado = isDistribuidor() && !itemExcluido && (precioConDescuento < item.precio_venta);
                  const muestraPromoBadge = promoActivaParaCliente && !itemExcluido;
                  
                  return (
                    <li key={item.codigo_interno} className="bg-white border rounded p-3" style={{ borderColor: '#e5e7eb' }}>
                      {/* ✅ MODIFICADO: Layout reorganizado */}
                      <div className="flex flex-col gap-3">
                        {/* ✅ Fila superior: Imagen + Info + QuantityButton */}
                        <div className="flex items-start justify-between gap-3">
                          {/* ✅ Imagen del producto */}
                          <div className="flex-shrink-0 w-16 h-16 rounded overflow-hidden" style={{ backgroundColor: '#f3f4f6' }}>
                            {item.foto_portada || item.foto1_url ? (
                              <CldImage
                                src={item.foto_portada || item.foto1_url || ''}
                                alt={item.modelo}
                                width={64}
                                height={64}
                                className="object-contain w-full h-full"
                                crop="fit"
                                quality="auto"
                                format="auto"
                                onError={(e) => {
                                  console.warn(`Error cargando imagen del carrito: ${item.foto_portada || item.foto1_url}`);
                                  // Fallback a imagen por defecto
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.parentElement!.innerHTML = `
                                    <img src="/not-image.png" alt="${item.modelo}" 
                                         class="object-contain w-full h-full" />
                                  `;
                                }}
                              />
                            ) : (
                              <img
                                src="/not-image.png"
                                alt={item.modelo}
                                className="object-contain w-full h-full"
                              />
                            )}
                          </div>
                          
                          {/* ✅ Info del producto (sin descripción) */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm leading-tight mb-1" style={{ color: '#111827' }}>{item.modelo}</div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm" style={{ color: '#ea580c' }}>
                                ${precioFinalPesos.toLocaleString()}
                              </span>
                              <span className="text-xs" style={{ color: '#6b7280' }}>c/u</span>
                              {/* ✅ Mostrar descuento solo si aplica */}
                              {hayDescuentoAplicado && (
                                <span className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                                  -20%
                                </span>
                              )}
                              {/* ✅ Mostrar badge para items excluidos */}
                              {itemExcluido && isDistribuidor() && (
                                <span className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: '#ffedd5', color: '#9a3412' }}>
                                  📱 Sin desc.
                                </span>
                              )}
                            </div>
                              {muestraPromoBadge && (
                                <span className="text-xs px-1 py-0.5 rounded border" style={{ backgroundColor: '#fefce8', color: '#854d0e', borderColor: '#fde68a' }}>
                                  -{descuentoPromo}% promo
                                </span>
                              )}
                          </div>
                          
                          {/* ✅ QuantityButton */}
                          <div className="flex-shrink-0">
                            <QuantityButton
                              value={item.cantidad}
                              onAdd={() => changeQuantity(item.codigo_interno, 1)}
                              onRemove={() => changeQuantity(item.codigo_interno, -1)}
                              onSet={(val) => changeQuantity(item.codigo_interno, val - item.cantidad)}
                              modelo={item.modelo}
                              hideModelo={true}
                              size="normal"
                              maxStock={stockDisponible}
                            />
                          </div>
                        </div>
                        
                        {/* ✅ NUEVO: Descripción del producto DEBAJO del QuantityButton */}
                        <div className="text-xs p-2 rounded" style={{ color: '#6b7280', backgroundColor: '#f9fafb' }}>
                          {item.item_nombre}
                        </div>
                        
                        {/* ✅ Sugerencia (si existe) */}
                        {item.sugerencia && (
                          <div className="border rounded p-2" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                            <div className="text-xs" style={{ color: '#1d4ed8' }}>
                              <strong>Sugerencia:</strong> {item.sugerencia}
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            
            {/* ✅ FOOTER CON TOTAL Y BOTONES */}
            <div className="border-t p-4" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }}>
              {promoLoading && user && !isProspectoMode && !isChatbotMode && (
                <div className="mb-4 p-3 rounded border animate-pulse" style={{ backgroundColor: '#fff7ed', borderColor: '#fde68a' }}>
                  <div className="h-3 bg-orange-100 rounded mb-2"></div>
                  <div className="h-2 bg-orange-50 rounded w-1/2"></div>
                </div>
              )}

              {promoError && (
                <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#fef2f2', borderColor: '#fecaca' }}>
                  <p className="text-xs" style={{ color: '#b91c1c' }}>{promoError}</p>
                </div>
              )}

              {promoActivaParaCliente && user && !isProspectoMode && !isChatbotMode && (
                <div className="mb-4 p-3 rounded border" style={{ backgroundColor: '#ecfccb', borderColor: '#bef264' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: '#365314' }}>
                      Promo -{descuentoPromo}% (21 al 31)
                    </span>
                    {maxPedidosPromo > 0 && (
                      <span className="text-xs" style={{ color: '#4d7c0f' }}>
                        {Math.min(pedidosUsados, maxPedidosPromo)} / {maxPedidosPromo} pedidos
                      </span>
                    )}
                  </div>
                  {maxPedidosPromo > 0 && (
                    <div className="h-2 rounded-full bg-white overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min((pedidosUsados / maxPedidosPromo) * 100, 100)}%`,
                          backgroundColor: '#4ade80'
                        }}
                      ></div>
                    </div>
                  )}
                  <p className="text-xs mt-2" style={{ color: '#4d7c0f' }}>
                    {`Te ${pedidosRestantes === 1 ? 'queda' : 'quedan'} ${pedidosRestantes} pedido${pedidosRestantes === 1 ? '' : 's'} con descuento.`}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <span className="font-bold" style={{ color: '#111827' }}>
                  Total
                  {isDistribuidor() && (
                    <span className="ml-2 text-xs" style={{ color: '#16a34a' }}>(con descuentos)</span>
                  )}
                  {hayPromoAplicadaEnCarrito && (
                    <span className="ml-2 text-xs" style={{ color: '#6b7280' }}>
                      + promo -{descuentoPromo}%
                    </span>
                  )}
                </span>
                <div className="text-right">
                  <div className="text-xl font-bold" style={{ color: '#111827' }}>
                    ${Math.round(totalEnPesos).toLocaleString()} ARS
                  </div>
                  <div className="text-xs" style={{ color: '#6b7280' }}>
                    USD ${cart.reduce((sum, item) => {
                      const precioConDescuento = calcularPrecioFinal(item);
                      return sum + (item.cantidad * precioConDescuento);
                    }, 0).toFixed(2)}
                    {isDistribuidor() && (
                      <span className="ml-1" style={{ color: '#16a34a' }}>(con desc.)</span>
                    )}
                  </div>
                </div>
              </div>

              <button
                className="w-full py-3 rounded font-bold text-white"
                style={{
                  background: isChatbotMode
                    ? '#9ca3af'
                    : stockValidation.hasWarnings
                      ? '#dc2626'
                      : '#ea580c',
                  color: isChatbotMode ? '#4b5563' : 'white',
                  cursor: (isCreatingOrder || cart.length === 0 || stockValidation.hasWarnings || isChatbotMode) ? 'not-allowed' : 'pointer',
                  opacity: (isChatbotMode || stockValidation.hasWarnings) ? 0.75 : 1
                }}
                onClick={handleBuy}
                disabled={isCreatingOrder || cart.length === 0 || stockValidation.hasWarnings || isChatbotMode}
              >
                {isChatbotMode ? (
                  '🔒 Modo consulta - Sin pedidos'
                ) : isCreatingOrder ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </div>
                ) : stockValidation.hasWarnings ? (
                  '⚠️ Ajustar cantidades'
                ) : (
                  isProspectoMode ? 'Enviar pedido al vendedor' : 'Realizar pedido'
                )}
              </button>

              {/* ✅ NUEVO: Mensaje para modo chatbot */}
              {isChatbotMode && (
                <div className="mt-3 p-3 border rounded" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: '#3b82f6' }}>💬</span>
                    <div>
                      <p className="font-semibold text-xs" style={{ color: '#1e40af' }}>
                        Modo Consulta Activado
                      </p>
                      <p className="text-xs" style={{ color: '#1d4ed8' }}>
                        Este carrito es solo para consultas. No se pueden realizar pedidos.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ MENSAJE PARA PROSPECTOS */}
              {isProspectoMode && !isChatbotMode && (
                <div className="mt-3 p-3 border rounded" style={{ backgroundColor: '#fff7ed', borderColor: '#fed7aa' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: '#f97316' }}>👋</span>
                    <div>
                      <p className="font-semibold text-xs" style={{ color: '#9a3412' }}>
                        ¡Hola {prospectoData?.nombre}!
                      </p>
                      <p className="text-xs" style={{ color: '#c2410c' }}>
                        Tu pedido será enviado al vendedor para que se contacte contigo
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {isDistribuidor() && !isProspectoMode && !isChatbotMode && (
                <div className="mt-3 p-3 border rounded" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: '#22c55e' }}>🎉</span>
                    <div>
                      <p className="font-semibold text-xs" style={{ color: '#166534' }}>
                        Descuentos Aplicados
                      </p>
                      <p className="text-xs" style={{ color: '#15803d' }}>
                        Los precios mostrados incluyen descuentos donde aplica
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