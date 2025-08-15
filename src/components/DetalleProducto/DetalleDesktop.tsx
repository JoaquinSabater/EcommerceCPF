import { CldImage } from 'next-cloudinary';

export default function DetalleDesktop({ producto }: { producto: any }) {
  return (
    <div className="rounded-lg bg-white shadow-sm">
      <div className="flex w-full items-start p-6">
        <div className="flex-1 flex flex-col justify-start pr-8">
          <div className="mb-2 text-xs text-gray-500">Vidrio templado</div>
          <div className="font-bold text-3xl mb-2">{producto.nombre}</div>
          <div className="text-gray-700 mb-4 text-lg">{producto.descripcion}</div>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl font-semibold text-orange-600">${producto.precio.toLocaleString()}</div>
            {producto.precio > 0 && (
              <div className="text-sm bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full">
                Precio actualizado
              </div>
            )}
          </div>
          <div className="mb-2 font-bold text-orange-600 text-xl">CARACTERÍSTICAS</div>
          <div className="flex-1 flex flex-col justify-between">
            <table className="w-full text-base">
              <tbody>
                {producto.caracteristicas.map((c: any) => (
                  <tr key={c.label} className="border-b align-top">
                    <td className="py-2 text-gray-500">{c.label}:</td>
                    <td className="py-2 font-bold text-gray-800">{c.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex-1 flex items-start justify-center">
          <CldImage
            src={producto.imagen || 'no-image_i7m08e'}
            alt={producto.nombre}
            width={380}
            height={500}
            className="object-contain rounded max-h-[500px] w-auto bg-gray-100"
          />
        </div>
      </div>
    </div>
  );
}