import DetalleMobile from "@/components/DetalleProducto/DetalleMobile";
import DetalleDesktop from "@/components/DetalleProducto/DetalleDesktop";
import ModelosSelector from "@/components/DetalleProducto/ModelosSelector";
import { notFound } from "next/navigation";


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

async function getProductoDetalle(itemId: string): Promise<DetalleProducto | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/detalle?id=${itemId}`, 
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      console.error('Error al obtener detalles del producto:', await response.text());
      return null;
    }
    
    const data = await response.json();
    return data as DetalleProducto;
  } catch (error) {
    console.error("Error al obtener detalles del producto:", error);
    return null;
  }
}

async function getPrecioFromApi(itemId: string): Promise<number | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/precio?itemId=${itemId}`, { 
      cache: 'no-store' 
    });
    
    if (!response.ok) {
      console.error('Error al obtener precio:', await response.text());
      return null;
    }
    
    const data = await response.json();
    return data.precio;
  } catch (error) {
    console.error("Error al obtener el precio:", error);
    return null;
  }
}

function formatearProducto(detalle: DetalleProducto, precio: number): ProductoFormateado {
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
}

export default async function DetalleProducto({ params }: { params: { id: string } }) {

  const subcategoriaId = parseInt(params.id);
  const detalleProducto = await getProductoDetalle(params.id);

  if (!detalleProducto) {
    return notFound();
  }

  const precioReal = await getPrecioFromApi(params.id) || 0;
  const productoFormateado = formatearProducto(detalleProducto, precioReal);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Mobile */}
      <div className="md:hidden space-y-4">
        <DetalleMobile producto={productoFormateado} />
        <ModelosSelector subcategoriaId={subcategoriaId} />
      </div>
      {/* Desktop */}
      <div className="hidden md:flex flex-col space-y-6">
        <DetalleDesktop producto={productoFormateado} />
        <ModelosSelector subcategoriaId={subcategoriaId} />
      </div>
    </div>
  );
}