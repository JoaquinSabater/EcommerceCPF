"use client";

import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import DetalleMobile from "@/components/DetalleProducto/DetalleMobile";
import DetalleDesktop from "@/components/DetalleProducto/DetalleDesktop";
import ModelosSelector from "@/components/DetalleProducto/ModelosSelector";
import { useAuth } from "@/hooks/useAuth";

interface Caracteristica {
  label: string;
  value: string;
}

interface DetalleProducto {
  item_id: number;
  item_nombre: string;
  descripcion: string;
  material: string;
  espesor: string;
  proteccion: string;
  compatibilidad: string;
  pegamento: string;
  foto1_url: string;
  foto2_url?: string;
  foto3_url?: string;
  foto4_url?: string;
}

interface ProductoFormateado {
  imagen: string;
  nombre: string;
  descripcion: string;
  precio: number;
  caracteristicas: Caracteristica[];
}

interface DetalleProductoModalProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function DetalleProductoModal({ itemId, isOpen, onClose }: DetalleProductoModalProps) {
  const [detalleProducto, setDetalleProducto] = useState<DetalleProducto | null>(null);
  const [precio, setPrecio] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAuth(); 

  
  const fetchProductoDetalle = async (id: string) => {
    try {
      const response = await fetch(`/api/detalle?id=${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener detalles del producto');
      }
      const data = await response.json();
      return data as DetalleProducto;
    } catch (error) {
      console.error("Error al obtener detalles del producto:", error);
      throw error;
    }
  };

  const fetchPrecio = async (id: string) => {
    try {
      const response = await fetch(`/api/precio?itemId=${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener precio');
      }
      const data = await response.json();
      return data.precio;
    } catch (error) {
      console.error("Error al obtener el precio:", error);
      return 0;
    }
  };


  const formatearProducto = (detalle: DetalleProducto, precio: number): ProductoFormateado => {
    return {
      imagen: detalle.foto1_url,
      nombre: detalle.item_nombre,
      descripcion: detalle.descripcion,
      precio: precio,
      caracteristicas: [
        { label: "Material", value: detalle.material || "No especificado" },
        { label: "Espesor", value: detalle.espesor || "No especificado" },
        { label: "Protección", value: detalle.proteccion || "No especificado" },
        { label: "Compatibilidad", value: detalle.compatibilidad || "No especificado" },
        { label: "Pegamento", value: detalle.pegamento || "No especificado" },
      ],
    };
  };


  const handleEditProduct = () => {
    console.log('Editando producto con ID:', itemId);
  };

  // Efecto para cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && itemId) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
          const [detalleData, precioData] = await Promise.all([
            fetchProductoDetalle(itemId),
            fetchPrecio(itemId)
          ]);
          
          setDetalleProducto(detalleData);
          setPrecio(precioData);
        } catch (err) {
          setError('Error al cargar los datos del producto');
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [isOpen, itemId]);

  // Cerrar modal con ESC
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay with blur effect - Changed to show page content */}
      <div 
        className="absolute inset-0 backdrop-blur-sm bg-[rgba(255,255,255,0.1)]"
        onClick={onClose}
      />
      
      {/* Modal Content - Made larger */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-[95vw] lg:max-w-6xl xl:max-w-7xl mx-auto max-h-[95vh] overflow-y-auto w-full">
        {/* Header con botón de cerrar y botón de editar */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Detalle del Producto</h2>
            {/* Botón de editar - Solo visible para admin */}
            {isAdmin && (
              <button
                onClick={handleEditProduct}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors"
                title="Editar producto"
              >
                <PencilIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Editar</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">{error}</p>
              <button 
                onClick={onClose}
                className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : detalleProducto ? (
            <div className="min-h-[60vh]">
              {/* Mobile */}
              <div className="md:hidden space-y-6">
                <DetalleMobile producto={formatearProducto(detalleProducto, precio)} />
                <ModelosSelector subcategoriaId={parseInt(itemId)} />
              </div>
              
              {/* Desktop */}
              <div className="hidden md:flex flex-col space-y-8">
                <DetalleDesktop producto={formatearProducto(detalleProducto, precio)} />
                <ModelosSelector subcategoriaId={parseInt(itemId)} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}