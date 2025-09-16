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
        
        {/* Skeleton del botón */}
        <div className="mt-auto flex items-center justify-between">
          <div className="h-10 bg-gray-300 rounded-lg w-20"></div>
        </div>
      </div>
    </div>
  );
}