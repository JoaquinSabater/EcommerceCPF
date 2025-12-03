interface ModelosSelectorHeaderProps {
  esSinDescuento: boolean; // ✅ CAMBIAR: de esElectronica a esSinDescuento
  isDistribuidor: () => boolean;
  sugerenciaActual: string;
}

export default function ModelosSelectorHeader({ 
  esSinDescuento, 
  isDistribuidor, 
  sugerenciaActual 
}: ModelosSelectorHeaderProps) {
  return (
    <h3 className="text-lg font-bold mb-3 text-gray-800">
      Selección de modelos
      {!esSinDescuento && isDistribuidor() && (
        <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
          20% OFF Distribuidor 🎉
        </span>
      )}
      {esSinDescuento && (
        <span className="ml-2 text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
          Sin descuento especial 📦
        </span>
      )}
      {sugerenciaActual && (
        <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
          Con sugerencias especiales ✨
        </span>
      )}
    </h3>
  );
}