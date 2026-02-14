import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import ProductWithSuggestions from '@/components/DetalleProducto/ProductWithSuggestions';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import BackButton from '@/components/ui/BackButton';
import EditProductButton from '@/components/ui/EditProductButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Caracteristica {
  label: string;
  value: string;
}

interface DetalleProducto {
  item_id: number;
  subcategoria_id: number;
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

// Funciones para obtener datos del servidor
async function fetchProductoDetalle(id: string): Promise<DetalleProducto> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/detalle?id=${id}`, {
    cache: 'no-store'
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener detalles del producto');
  }
  
  const data = await response.json();
  return data.detalle as DetalleProducto;
}

async function fetchRangoPrecio(id: string): Promise<RangoPrecio | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/rangoPrecio?itemId=${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener el rango de precios:", error);
    return null;
  }
}

function formatearProducto(detalle: DetalleProducto, rangoPrecio: RangoPrecio | null): ProductoFormateado {
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
    sugerencia: '',
    mostrarCaracteristicas: mostrarCaracteristicas,
    caracteristicas: caracteristicas,
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // Obtener datos en paralelo
    const [detalleProducto, rangoPrecio] = await Promise.all([
      fetchProductoDetalle(id),
      fetchRangoPrecio(id)
    ]);

    if (!detalleProducto) {
      notFound();
    }

    const productoFormateado = formatearProducto(detalleProducto, rangoPrecio);

    console.log(`🔍 Página producto - Item ID: ${id}, Subcategoria ID: ${detalleProducto.subcategoria_id}`);

    return (
      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <BackButton />
            <EditProductButton producto={detalleProducto} />
          </div>

          <div className="space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductWithSuggestions 
                producto={productoFormateado} 
                subcategoriaId={detalleProducto.subcategoria_id}
                itemId={parseInt(id)}
              />
            </Suspense>
          </div>
        </div>
      </main>
    );

  } catch (error) {
    console.error('Error al cargar el producto:', error);
    notFound();
  }
}