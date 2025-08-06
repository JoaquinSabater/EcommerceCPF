import Image from "next/image";

export default function DetalleMobile({ producto }: { producto: any }) {
  return (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      <div className="flex justify-center mb-4">
        <Image
          src={producto.imagen}
          alt={producto.nombre}
          width={220}
          height={220}
          className="object-contain rounded"
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