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
}

interface ProductoFormateado {
  imagen: string;
  imagenes: string[];
  nombre: string;
  descripcion: string;
  precio: number;
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

async function fetchPrecio(id: string): Promise<number> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/precio?itemId=${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return 0;
    }
    
    const data = await response.json();
    return data.precio || 0;
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    return 0;
  }
}

function formatearProducto(detalle: DetalleProducto, precio: number): ProductoFormateado {
  const imagenPrincipal = detalle.foto_portada || detalle.foto1_url || '';
  
  const todasLasImagenes = [
    detalle.foto1_url,
    detalle.foto2_url,
    detalle.foto3_url,
    detalle.foto4_url,
  ].filter((img): img is string => typeof img === 'string' && img.trim() !== '');

  const mostrarCaracteristicas = Boolean(detalle.activo);

  return {
    imagen: imagenPrincipal,
    nombre: detalle.item_nombre,
    descripcion: detalle.descripcion,
    precio: precio,
    imagenes: todasLasImagenes,
    sugerencia: '',
    mostrarCaracteristicas: mostrarCaracteristicas,
    caracteristicas: [
      { label: "Material", value: detalle.material || "No especificado" },
      { label: "Espesor", value: detalle.espesor || "No especificado" },
      { label: "Protección", value: detalle.proteccion || "No especificado" },
      { label: "Compatibilidad", value: detalle.compatibilidad || "No especificado" },
      { label: "Pegamento", value: detalle.pegamento || "No especificado" },
    ],
  };
}

// ✅ FIX: Cambiar params para ser compatible con Next.js 15+
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ Agregar await aquí

  try {
    // Obtener datos en paralelo
    const [detalleProducto, precio] = await Promise.all([
      fetchProductoDetalle(id),
      fetchPrecio(id)
    ]);

    if (!detalleProducto) {
      notFound();
    }

    const productoFormateado = formatearProducto(detalleProducto, precio);

    return (
      <main className="min-h-screen bg-white"> {/* ✅ Cambiar fondo a blanco */}
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* ✅ Header simplificado - solo botón de regreso y botón editar */}
          <div className="flex items-center justify-between mb-8">
            <BackButton />
            <EditProductButton producto={detalleProducto} />
          </div>

          {/* ✅ REMOVER: Estados del producto, título, etc. */}

          {/* Contenido principal */}
          <div className="space-y-8">
            <Suspense fallback={<LoadingSpinner />}>
              <ProductWithSuggestions 
                producto={productoFormateado} 
                subcategoriaId={parseInt(id)} 
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