import Image from "next/image";
import React from "react";

interface Caracteristica {
  label: string;
  value: string;
}

interface ProductoFormateado {
  imagen: string;
  nombre: string;
  descripcion: string;
  precio: number;
  caracteristicas: Caracteristica[];
  imagenes?: string[];
}

interface DetalleMobileProps {
  producto: ProductoFormateado;
}

export default function DetalleMobile({ producto }: DetalleMobileProps) {
  return (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      <div className="flex-1 flex items-start justify-center">
        <Image
          src={producto.imagen}
          alt={producto.nombre}
          width={380}
          height={500}
          className="object-contain rounded max-h-[500px] w-auto"
        />
      </div>
      <div className="mb-2 text-xs text-gray-500">Vidrio templado</div>
      <div className="font-bold text-xl mb-1">{producto.nombre}</div>
      <div className="text-gray-700 mb-2">{producto.descripcion}</div>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="text-2xl font-semibold text-orange-600">${producto.precio.toLocaleString()}</div>
        {producto.precio > 0 && (
          <div className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
            Precio actualizado
          </div>
        )}
      </div>
      <div className="mb-2 font-bold text-orange-600">CARACTERÍSTICAS</div>
      <table className="w-full text-sm mb-4">
        <tbody>
          {producto.caracteristicas.map((c: any) => (
            <tr key={c.label} className="border-b">
              <td className="py-2 text-gray-500">{c.label}:</td>
              <td className="py-2 font-bold text-gray-800">{c.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}