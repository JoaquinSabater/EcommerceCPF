"use client";

import React from 'react';
import { Check, Clock, X, Truck } from 'lucide-react';

interface EstadoPedidoTrackerProps {
  estadoActual: string;
  esPreliminar?: boolean;
  estaDespachado?: boolean; // ✅ NUEVO: Para saber si el consolidado está despachado
  className?: string;
}

// Estados para pedidos normales (AHORA CON DESPACHADO)
const estadosPedidoNormal = [
  { key: 'solicitud', label: 'Solicitud', descripcion: 'Pedido creado' },
  { key: 'en_proceso', label: 'En Proceso', descripcion: 'Procesando pedido' },
  { key: 'parcial', label: 'Armando', descripcion: 'En proceso de armado' },
  { key: 'armado', label: 'Armado', descripcion: 'Pedido completo' },
  { key: 'despachado', label: 'Despachado', descripcion: 'En camino' }, // ✅ NUEVO ESTADO
];

// Estados para pedidos preliminares (SIN CAMBIOS)
const estadosPedidoPreliminar = [
  { key: 'borrador', label: 'Borrador', descripcion: 'Pedido preliminar' },
  { key: 'pendiente', label: 'Pendiente', descripcion: 'En revisión' },
  { key: 'revisado', label: 'Revisado', descripcion: 'Aprobado' },
  { key: 'cancelado', label: 'Cancelado', descripcion: 'Pedido Cancelado' },
];

export default function EstadoPedidoTracker({ 
  estadoActual, 
  esPreliminar = false,
  estaDespachado = false,
  className = '' 
}: EstadoPedidoTrackerProps) {
  
  let estados = esPreliminar ? estadosPedidoPreliminar : estadosPedidoNormal;
  
  // ✅ FIX 3: Para preliminares, si está revisado, no mostrar cancelado
  if (esPreliminar && estadoActual === 'revisado') {
    estados = estados.filter(estado => estado.key !== 'cancelado');
  }
  
  // ✅ FIX 1: Encontrar el índice del estado actual
  let estadoActualIndex = estados.findIndex(estado => estado.key === estadoActual);
  
  // ✅ FIX 2: Si está despachado (para pedidos normales), agregar ese estado como completado
  if (!esPreliminar && estaDespachado) {
    // Si el consolidado está despachado, el estado efectivo es "despachado"
    estadoActualIndex = estados.findIndex(estado => estado.key === 'despachado');
  }
  
  // Si es cancelado, es un caso especial
  const esCancelado = estadoActual === 'cancelado';
  
  // ✅ FIX 1: FUNCIÓN CORREGIDA - todos los estados hasta el actual (incluyéndolo) deben estar completados
  const estaCompletado = (index: number) => {
    if (esCancelado) {
      return estados[index].key === 'cancelado';
    }
    
    // ✅ CAMBIO PRINCIPAL: <= en lugar de < para incluir el estado actual
    return index <= estadoActualIndex;
  };
  
  const esEstadoActual = (index: number) => {
    return index === estadoActualIndex;
  };

  // Debug para ver qué está pasando
  console.log('EstadoPedidoTracker Debug:', {
    estadoActual,
    esPreliminar,
    estaDespachado,
    estadoActualIndex,
    estados: estados.map(e => e.key)
  });

  return (
    <div className={`w-full ${className}`}>
      {/* Vista Desktop - Horizontal */}
      <div className="hidden md:flex items-center justify-between w-full">
        {estados.map((estado, index) => (
          <React.Fragment key={estado.key}>
            {/* Círculo del estado */}
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                ${estaCompletado(index) 
                  ? esCancelado && estado.key === 'cancelado' 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-600'
                }
                ${esEstadoActual(index) ? 'ring-4 ring-orange-200' : ''}
              `}>
                {estaCompletado(index) ? (
                  esCancelado && estado.key === 'cancelado' ? (
                    <X className="w-4 h-4" />
                  ) : estado.key === 'despachado' ? (
                    <Truck className="w-4 h-4" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              
              {/* Label del estado */}
              <div className="mt-2 text-center">
                <p className={`text-xs font-medium ${
                  estaCompletado(index) ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {estado.label}
                </p>
                <p className={`text-xs ${
                  estaCompletado(index) ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {estado.descripcion}
                </p>
                {esEstadoActual(index) && (
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <Clock className="w-3 h-3 text-orange-500" />
                    <span className="text-xs text-orange-600 font-medium">Actual</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Línea conectora */}
            {index < estados.length - 1 && !esCancelado && (
              <div className={`
                flex-1 h-0.5 mx-2 transition-all duration-300
                ${index < estadoActualIndex ? 'bg-green-500' : 'bg-gray-300'}
              `} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Vista Móvil - Vertical */}
      <div className="md:hidden space-y-3">
        {estados.map((estado, index) => (
          <div key={estado.key} className="flex items-start gap-3">
            {/* Círculo del estado */}
            <div className="flex flex-col items-center">
              <div className={`
                w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300
                ${estaCompletado(index) 
                  ? esCancelado && estado.key === 'cancelado' 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-600'
                }
                ${esEstadoActual(index) ? 'ring-4 ring-orange-200' : ''}
              `}>
                {estaCompletado(index) ? (
                  esCancelado && estado.key === 'cancelado' ? (
                    <X className="w-3 h-3" />
                  ) : estado.key === 'despachado' ? (
                    <Truck className="w-3 h-3" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </div>
              
              {/* Línea conectora vertical */}
              {index < estados.length - 1 && !esCancelado && (
                <div className={`
                  w-0.5 h-6 mt-1 transition-all duration-300
                  ${index < estadoActualIndex ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
            
            {/* Información del estado */}
            <div className="flex-1 pb-2">
              <p className={`text-sm font-medium ${
                estaCompletado(index) ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {estado.label}
              </p>
              <p className={`text-xs mt-1 ${
                estaCompletado(index) ? 'text-gray-600' : 'text-gray-400'
              }`}>
                {estado.descripcion}
              </p>
              {esEstadoActual(index) && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-orange-500" />
                  <span className="text-xs text-orange-600 font-medium">Estado actual</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}