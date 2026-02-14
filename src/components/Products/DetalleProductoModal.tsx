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
  subcategoria_id: number; // ✅ AGREGAR: Para exclusiones de descuento
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
  destacar?: boolean;
  activo?: boolean;
  // Campos nuevos - Fundas
  interior?: string;
  protector_camara?: string;
  flexibilidad?: string;
  colores_disenos?: string;
  // Campos nuevos - Popsockets
  adhesivo?: string;
  compatibilidad_magsafe?: string;
  soporte?: string;
  // Campos nuevos - Auriculares
  bluetooth?: string;
  duracion_bateria?: string;
  cancelacion_ruido?: string;
  resistencia_agua?: string;
  rgb?: string;
  respuesta_frecuencia?: string;
  sensibilidad?: string;
  capacidad_bateria?: string;
  largo_cable?: string;
  // Campos de visibilidad
  mostrar_descripcion?: boolean;
  mostrar_material?: boolean;
  mostrar_espesor?: boolean;
  mostrar_proteccion?: boolean;
  mostrar_compatibilidad?: boolean;
  mostrar_pegamento?: boolean;
  mostrar_interior?: boolean;
  mostrar_protector_camara?: boolean;
  mostrar_flexibilidad?: boolean;
  mostrar_colores_disenos?: boolean;
  mostrar_adhesivo?: boolean;
  mostrar_compatibilidad_magsafe?: boolean;
  mostrar_soporte?: boolean;
  mostrar_bluetooth?: boolean;
  mostrar_duracion_bateria?: boolean;
  mostrar_cancelacion_ruido?: boolean;
  mostrar_resistencia_agua?: boolean;
  mostrar_rgb?: boolean;
  mostrar_respuesta_frecuencia?: boolean;
  mostrar_sensibilidad?: boolean;
  mostrar_capacidad_bateria?: boolean;
  mostrar_largo_cable?: boolean;
}

interface RangoPrecio {
  precioMinimo: number | null;
  precioMaximo: number | null;
  tieneVariacion: boolean;
  totalArticulos?: number;
  articulosConPrecio?: number;
}

interface ProductoFormateado {
  imagen: string;
  imagenes: string[];
  nombre: string;
  descripcion: string;
  rangoPrecio: RangoPrecio | null;
  caracteristicas: Caracteristica[];
  sugerencia?: string;
  mostrarCaracteristicas?: boolean;
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
  const [rangoPrecio, setRangoPrecio] = useState<RangoPrecio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sugerenciaActual, setSugerenciaActual] = useState('');
  const { isAdmin } = useAuth(); 

  const fetchProductoDetalle = async (id: string) => {
    try {
      const response = await fetch(`/api/detalle?id=${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener detalles del producto');
      }
      const data = await response.json();
      console.log('🔍 Detalle obtenido del API (Modal):', {
        item_id: data.detalle.item_id,
        subcategoria_id: data.detalle.subcategoria_id,
        item_nombre: data.detalle.item_nombre
      });
      return data.detalle as DetalleProducto;
    } catch (error) {
      console.error("Error al obtener detalles del producto:", error);
      throw error;
    }
  };

  const fetchRangoPrecio = async (id: string) => {
    try {
      const response = await fetch(`/api/rangoPrecio?itemId=${id}`);
      if (!response.ok) {
        throw new Error('Error al obtener rango de precio');
      }
      const data = await response.json();
      return data as RangoPrecio;
    } catch (error) {
      console.error("Error al obtener el rango de precio:", error);
      return null;
    }
  };

  const formatearProducto = (detalle: DetalleProducto, rangoPrecio: RangoPrecio | null): ProductoFormateado => {
    const imagenPrincipal = detalle.foto_portada || detalle.foto1_url || '';
    
    const todasLasImagenes = [
      detalle.foto1_url,
      detalle.foto2_url,
      detalle.foto3_url,
      detalle.foto4_url,
    ].filter((img): img is string => typeof img === 'string' && img.trim() !== '');

    const mostrarCaracteristicas = Boolean(detalle.activo);

    // ✅ Construir características dinámicamente según los campos mostrar_*
    const caracteristicas: Caracteristica[] = [];

    // Campos generales/existentes
    if (detalle.mostrar_material) {
      caracteristicas.push({ label: "Material", value: detalle.material || "No especificado" });
    }
    if (detalle.mostrar_espesor) {
      caracteristicas.push({ label: "Espesor", value: detalle.espesor || "No especificado" });
    }
    if (detalle.mostrar_proteccion) {
      caracteristicas.push({ label: "Protección", value: detalle.proteccion || "No especificado" });
    }
    if (detalle.mostrar_compatibilidad) {
      caracteristicas.push({ label: "Compatibilidad", value: detalle.compatibilidad || "No especificado" });
    }
    if (detalle.mostrar_pegamento) {
      caracteristicas.push({ label: "Pegamento", value: detalle.pegamento || "No especificado" });
    }

    // Campos para Fundas
    if (detalle.mostrar_interior) {
      caracteristicas.push({ label: "Interior", value: detalle.interior || "No especificado" });
    }
    if (detalle.mostrar_protector_camara) {
      caracteristicas.push({ label: "Protector de Cámara", value: detalle.protector_camara || "No especificado" });
    }
    if (detalle.mostrar_flexibilidad) {
      caracteristicas.push({ label: "Flexibilidad", value: detalle.flexibilidad || "No especificado" });
    }
    if (detalle.mostrar_colores_disenos) {
      caracteristicas.push({ label: "Colores/Diseños", value: detalle.colores_disenos || "No especificado" });
    }

    // Campos para Popsockets
    if (detalle.mostrar_adhesivo) {
      caracteristicas.push({ label: "Adhesivo", value: detalle.adhesivo || "No especificado" });
    }
    if (detalle.mostrar_compatibilidad_magsafe) {
      caracteristicas.push({ label: "Compatibilidad MagSafe", value: detalle.compatibilidad_magsafe || "No especificado" });
    }
    if (detalle.mostrar_soporte) {
      caracteristicas.push({ label: "Soporte", value: detalle.soporte || "No especificado" });
    }

    // Campos para Auriculares
    if (detalle.mostrar_bluetooth) {
      caracteristicas.push({ label: "Bluetooth", value: detalle.bluetooth || "No especificado" });
    }
    if (detalle.mostrar_duracion_bateria) {
      caracteristicas.push({ label: "Duración de Batería", value: detalle.duracion_bateria || "No especificado" });
    }
    if (detalle.mostrar_cancelacion_ruido) {
      caracteristicas.push({ label: "Cancelación de Ruido", value: detalle.cancelacion_ruido || "No especificado" });
    }
    if (detalle.mostrar_resistencia_agua) {
      caracteristicas.push({ label: "Resistencia al Agua", value: detalle.resistencia_agua || "No especificado" });
    }
    if (detalle.mostrar_rgb) {
      caracteristicas.push({ label: "RGB", value: detalle.rgb || "No especificado" });
    }
    if (detalle.mostrar_respuesta_frecuencia) {
      caracteristicas.push({ label: "Respuesta de Frecuencia", value: detalle.respuesta_frecuencia || "No especificado" });
    }
    if (detalle.mostrar_sensibilidad) {
      caracteristicas.push({ label: "Sensibilidad", value: detalle.sensibilidad || "No especificado" });
    }
    if (detalle.mostrar_capacidad_bateria) {
      caracteristicas.push({ label: "Capacidad de Batería", value: detalle.capacidad_bateria || "No especificado" });
    }
    if (detalle.mostrar_largo_cable) {
      caracteristicas.push({ label: "Largo del Cable", value: detalle.largo_cable || "No especificado" });
    }

    return {
      imagen: imagenPrincipal,
      nombre: detalle.item_nombre,
      descripcion: detalle.descripcion,
      rangoPrecio: rangoPrecio,
      imagenes: todasLasImagenes,
      sugerencia: sugerenciaActual,
      mostrarCaracteristicas: mostrarCaracteristicas,
      caracteristicas: caracteristicas,
    };
  };

  const handleSugerenciaChange = (nuevaSugerencia: string) => {
    setSugerenciaActual(nuevaSugerencia);
  };

  const handleEditProduct = () => {
    if (detalleProducto) {
      setShowEditModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  const handleSaveProduct = async (updatedProduct: DetalleProducto) => {
    setIsUpdating(true);
    
    try {
      setDetalleProducto(updatedProduct);
      setShowEditModal(false);
      
      if (onUpdate) {
        onUpdate(updatedProduct);
      }
      
    } catch (error) {
      console.error('Error al procesar la actualización:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (isOpen && itemId) {
      const loadData = async () => {
        setLoading(true);
        setError(null);
        setSugerenciaActual('');
        
        try {
          const [detalleData, rangoPrecioData] = await Promise.all([
            fetchProductoDetalle(itemId),
            fetchRangoPrecio(itemId)
          ]);
          
          setDetalleProducto(detalleData);
          setRangoPrecio(rangoPrecioData);
          
        } catch (err) {
          setError('Error al cargar los datos del producto');
          console.error('❌ Error cargando datos:', err);
        } finally {
          setLoading(false);
        }
      };

      loadData();
    }
  }, [isOpen, itemId]);

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
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 backdrop-blur-sm bg-[rgba(255,255,255,0.1)]"
          onClick={handleCloseMainModal}
        />
        
        <div className="relative bg-white rounded-lg shadow-2xl max-w-[95vw] lg:max-w-6xl xl:max-w-7xl mx-auto max-h-[95vh] overflow-y-auto w-full">
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
              
              {detalleProducto && (
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    detalleProducto.activo 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                  </span>
                  
                  {detalleProducto.destacar && (
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      ⭐ Destacado
                    </span>
                  )}
                </div>
              )}
              
              {sugerenciaActual && (
                <span className="text-xs text-gray-500 bg-blue-100 px-2 py-1 rounded">
                  📝 Con sugerencia: {sugerenciaActual.substring(0, 20)}...
                </span>
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
                  className="mt-4 px-6 py-3 text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#ea580c' }}
                >
                  Cerrar
                </button>
              </div>
            ) : detalleProducto ? (
              <div className="min-h-[60vh]">
                <div className="md:hidden space-y-6">
                  <DetalleMobile 
                    producto={formatearProducto(detalleProducto, rangoPrecio)} 
                    subcategoriaId={detalleProducto.subcategoria_id}
                    onSugerenciaChange={handleSugerenciaChange} 
                  />
                  <ModelosSelector
                    subcategoriaId={detalleProducto.subcategoria_id} 
                    itemId={parseInt(itemId)} 
                    sugerenciaActual={sugerenciaActual} 
                  />
                </div>
                
                <div className="hidden md:flex flex-col space-y-8">
                  <DetalleDesktop 
                    producto={formatearProducto(detalleProducto, rangoPrecio)}
                    subcategoriaId={detalleProducto.subcategoria_id}
                    onSugerenciaChange={handleSugerenciaChange} 
                  />
                  <ModelosSelector 
                    subcategoriaId={detalleProducto.subcategoria_id} 
                    itemId={parseInt(itemId)}
                    sugerenciaActual={sugerenciaActual} 
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}