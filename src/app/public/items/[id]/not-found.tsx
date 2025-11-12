import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Producto no encontrado
        </h2>
        <p className="text-gray-600 mb-6">
          El producto que buscas no existe o ha sido removido.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}