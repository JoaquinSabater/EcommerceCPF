"use client";

import React, { useState, useEffect } from "react";
import { PencilIcon } from "@heroicons/react/24/outline";
import DetalleMobile from "@/components/DetalleProducto/DetalleMobile";
import DetalleDesktop from "@/components/DetalleProducto/DetalleDesktop";
import ModelosSelector from "@/components/DetalleProducto/ModelosSelector";
import EditProductModal from "@/components/Products/EditProductModal";
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
  foto_portada?: string;
}

interface ProductoFormateado {
  imagen: string;
  imagenes: string[];
  nombre: string;
  descripcion: string;
  precio: number;
  caracteristicas: Caracteristica[];
  sugerencia?: string; // ✅ Agregar sugerencia
}

interface DetalleProductoModalProps {
  itemId: string;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (updatedProduct: any) => void;
}

export default function DetalleProductoModal({ 
  itemId, 
  isOpen, 
  onClose, 
  onUpdate 
}: DetalleProductoModalProps) {
  const [detalleProducto, setDetalleProducto] = useState<DetalleProducto | null>(null);
  const [precio, setPrecio] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sugerenciaActual, setSugerenciaActual] = useState(''); // ✅ Estado para manejar la sugerencia
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
    // ✅ Priorizar foto_portada como imagen principal
    const imagenPrincipal = detalle.foto_portada || detalle.foto1_url || '';
    
    // ✅ Crear array con todas las imágenes disponibles (SIN duplicar la foto_portada)
    const todasLasImagenes = [
      detalle.foto1_url,
      detalle.foto2_url,
      detalle.foto3_url,
      detalle.foto4_url,
    ].filter((img): img is string => typeof img === 'string' && img.trim() !== '');

    return {
      imagen: imagenPrincipal,
      nombre: detalle.item_nombre,
      descripcion: detalle.descripcion,
      precio: precio,
      imagenes: todasLasImagenes,
      sugerencia: sugerenciaActual, // ✅ Incluir la sugerencia actual
      caracteristicas: [
        { label: "Material", value: detalle.material || "No especificado" },
        { label: "Espesor", value: detalle.espesor || "No especificado" },
        { label: "Protección", value: detalle.proteccion || "No especificado" },
        { label: "Compatibilidad", value: detalle.compatibilidad || "No especificado" },
        { label: "Pegamento", value: detalle.pegamento || "No especificado" },
      ],
    };
  };

  // ✅ Callback para recibir cambios de sugerencia desde los componentes hijos
  const handleSugerenciaChange = (nuevaSugerencia: string) => {
    console.log('🟡 Sugerencia actualizada en DetalleProductoModal:', nuevaSugerencia);
    setSugerenciaActual(nuevaSugerencia);
  };

  // Función para abrir el modal de edición
  const handleEditProduct = () => {
    if (detalleProducto) {
      setShowEditModal(true);
    }
  };

  // Función para cerrar el modal de edición
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  // Función para guardar los cambios del producto
  const handleSaveProduct = async (updatedProduct: DetalleProducto) => {
    setIsUpdating(true);
    
    try {
      setDetalleProducto(updatedProduct);
      setShowEditModal(false);
      
      if (onUpdate) {
        onUpdate(updatedProduct);
      }
      
      console.log('✅ Producto actualizado exitosamente:', updatedProduct.item_nombre);
      
    } catch (error) {
      console.error('Error al procesar la actualización:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Cargar datos del producto
  useEffect(() => {
    if (isOpen && itemId) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        // ✅ Resetear sugerencia cuando se abre un nuevo producto
        setSugerenciaActual('');
        
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
        if (showEditModal) {
          setShowEditModal(false);
        } else {
          onClose();
        }
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
  }, [isOpen, showEditModal, onClose]);

  // Función para cerrar el modal principal
  const handleCloseMainModal = () => {
    if (isUpdating) return;
    
    if (showEditModal) {
      setShowEditModal(false);
      return;
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Principal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Overlay */}
        <div 
          className="absolute inset-0 backdrop-blur-sm bg-[rgba(255,255,255,0.1)]"
          onClick={handleCloseMainModal}
        />
        
        {/* Modal Content */}
        <div className="relative bg-white rounded-lg shadow-2xl max-w-[95vw] lg:max-w-6xl xl:max-w-7xl mx-auto max-h-[95vh] overflow-y-auto w-full">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10 rounded-t-lg">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">
                Detalle del Producto
                {isUpdating && (
                  <span className="ml-2 text-sm text-green-600 font-normal">
                    ✅ Actualizado
                  </span>
                )}
              </h2>
              
              {/* ✅ Mostrar sugerencia actual si existe (debug) */}
              {sugerenciaActual && (
                <span className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">
                  Con sugerencia: {sugerenciaActual.substring(0, 30)}...
                </span>
              )}
              
              {/* Botón de editar - Solo visible para admin */}
              {isAdmin && detalleProducto && (
                <button
                  onClick={handleEditProduct}
                  disabled={loading || isUpdating}
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Editar producto"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {loading ? 'Cargando...' : 'Editar'}
                  </span>
                </button>
              )}
            </div>
            
            <button
              onClick={handleCloseMainModal}
              disabled={isUpdating}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full disabled:opacity-50"
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
                  onClick={handleCloseMainModal}
                  className="mt-4 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            ) : detalleProducto ? (
              <div className="min-h-[60vh]">
                {/* Mobile */}
                <div className="md:hidden space-y-6">
                  <DetalleMobile 
                    producto={formatearProducto(detalleProducto, precio)} 
                    onSugerenciaChange={handleSugerenciaChange} // ✅ Pasar callback
                  />
                  <ModelosSelector 
                    subcategoriaId={parseInt(itemId)} 
                    sugerenciaActual={sugerenciaActual} // ✅ Pasar sugerencia al selector de modelos
                  />
                </div>
                
                {/* Desktop */}
                <div className="hidden md:flex flex-col space-y-8">
                  <DetalleDesktop 
                    producto={formatearProducto(detalleProducto, precio)}
                    onSugerenciaChange={handleSugerenciaChange} // ✅ Pasar callback
                  />
                  <ModelosSelector 
                    subcategoriaId={parseInt(itemId)}
                    sugerenciaActual={sugerenciaActual} // ✅ Pasar sugerencia al selector de modelos
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {detalleProducto && (
        <EditProductModal
          producto={detalleProducto}
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSave={handleSaveProduct}
        />
      )}
    </>
  );
}