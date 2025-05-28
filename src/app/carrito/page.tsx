'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResumenCarrito() {
  const [items, setItems] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('cartItems');
    if (stored) setItems(JSON.parse(stored));
  }, []);

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">¡Gracias por tu compra!</h2>
      <ul className="mb-6">
        {items.length === 0 ? (
          <li>No hay productos en el carrito.</li>
        ) : (
          items.map((item) => (
            <li key={item.codigo_interno} className="mb-2">
              <strong>{item.modelo}</strong> ({item.item_nombre}) x {item.cantidad}
            </li>
          ))
        )}
      </ul>
      <div className="flex gap-4">
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
          onClick={() => router.push('/')}
        >
          Volver al inicio
        </button>
        <button
          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          onClick={() => router.push('/')}
        >
          Ver más productos
        </button>
      </div>
    </div>
  );
}