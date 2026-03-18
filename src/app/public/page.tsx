"use client";

import { useState } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import HomeCarousel from '@/components/home/HomeCarrousel/HomeCarousel';
import HomeCarouselManager from '@/components/home/HomeCarrousel/HomeCarouselManager';
import CategoriasGrid from '@/components/home/CategoriasGrid/CategoriasGrid';
import CategoriasManager from '@/components/home/CategoriasGrid/CategoriasManager';
import ProductosDestacados from '@/components/home/ProductosDestacados';
import CategoriasProductos from '@/components/home/CategoriasProductos';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [showCarouselAdmin, setShowCarouselAdmin] = useState(false);
  const [showCategoriasAdmin, setShowCategoriasAdmin] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ✅ CAROUSEL FUERA DEL CONTENEDOR - Edge to edge en mobile */}
      <section className="relative">
        {/* Contenedor solo para el botón de admin en desktop */}
        <div className="container mx-auto px-4 relative z-10">
          {isAdmin && (
            <button
              onClick={() => setShowCarouselAdmin(!showCarouselAdmin)}
              className="absolute top-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all backdrop-blur-sm"
              title="Administrar carousel"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        
        {/* ✅ Carousel sin contenedor - Full width */}
        <div className="w-full">
          <HomeCarousel />
        </div>
      </section>

      {/* ✅ Admin del carousel con padding normal */}
      {showCarouselAdmin && isAdmin && (
        <section className="container mx-auto px-4 py-6">
          <HomeCarouselManager />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowCarouselAdmin(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar Administración Carousel
            </button>
          </div>
        </section>
      )}

      <section className="bg-gradient-to-b from-gray-50 to-white">
        <CategoriasProductos />
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="relative">
          {isAdmin && (
            <button
              onClick={() => setShowCategoriasAdmin(!showCategoriasAdmin)}
              className="absolute top-0 right-0 z-10 text-white p-2 rounded-full transition-colors"
              style={{ backgroundColor: '#ea580c' }}
              title="Administrar categorías"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          )}

          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Nuestras Categorías
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explora nuestra amplia gama de productos para proteger y personalizar tus dispositivos
            </p>
          </div>

          <CategoriasGrid />
        </div>
      </section>

      {showCategoriasAdmin && isAdmin && (
        <section className="container mx-auto px-4 pb-8">
          <CategoriasManager />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowCategoriasAdmin(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar Administración Categorías
            </button>
          </div>
        </section>
      )}
    </div>
  );
}