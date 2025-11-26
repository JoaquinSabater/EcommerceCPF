'use client';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
        <p className="text-gray-500 mt-2">
          La página que buscas no existe o ha sido movida.
        </p>
        <a 
          href="/"
          className={"mt-6 inline-block text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"} style={{ backgroundColor: '#ea580c' }}
        >
          Volver al inicio
        </a>
      </div>
    </div>
  );
}