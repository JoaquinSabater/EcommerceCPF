export default function CategoriaCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full animate-pulse">
      {/* Skeleton de imagen */}
      <div className="relative bg-gray-200 p-2 flex justify-center items-center h-72 md:h-80 border-b border-gray-100">
        <div className="w-full h-full bg-gray-300 rounded"></div>
      </div>
      
      {/* Skeleton de contenido */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Skeleton del título */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
        
        {/* Skeleton del contenido inferior */}
        <div className="mt-auto flex items-center justify-between">
          {/* ✅ Skeleton del rango de precios */}
          <div className="flex-1">
            {/* Precio principal */}
            <div className="space-y-1 mb-2">
              <div className="h-5 bg-gray-300 rounded w-32"></div>
              <div className="h-3 bg-gray-300 rounded w-24"></div>
            </div>
            
            {/* Badge de descuento */}
            <div className="h-5 bg-gray-300 rounded-full w-20 mb-1"></div>
            
            {/* Info adicional */}
            <div className="h-3 bg-gray-300 rounded w-28"></div>
          </div>
          
          {/* Skeleton del botón */}
          <div className="h-10 bg-gray-300 rounded-lg w-16 ml-auto flex items-center justify-center">
            <div className="w-12 h-4 bg-gray-400 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}