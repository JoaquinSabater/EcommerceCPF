"use client";

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';

interface Categoria {
  id: number;
  nombre: string;
  imagen: string;
  url: string;
  orden: number;
  activo: boolean;
}

export default function CategoriasGrid() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-home');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función para determinar si es imagen local o de Cloudinary
  const isLocalImage = (imagen: string) => {
    return imagen === 'not-image' || imagen.startsWith('/') || imagen.startsWith('not-image');
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="bg-gray-200 animate-pulse rounded-lg aspect-square"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {categorias.map((categoria) => (
        <Link
          key={categoria.id}
          href={categoria.url}
          className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border"
        >
          <div className="aspect-square relative overflow-hidden">
            {/* ✅ Renderizado condicional de imagen */}
            {isLocalImage(categoria.imagen) ? (
              <Image
                src="/not-image.png"
                alt={categoria.nombre}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <CldImage
                src={categoria.imagen}
                alt={categoria.nombre}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
            )}
          </div>
          
          <div className="p-3 text-center">
            <h3 className="text-sm font-medium text-gray-800 group-hover:text-orange-600 transition-colors">
              {categoria.nombre}
            </h3>
          </div>
        </Link>
      ))}
    </div>
  );
}