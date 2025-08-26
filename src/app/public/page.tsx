"use client";

import { useState } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import HomeCarousel from '@/components/home/HomeCarrousel/HomeCarousel';
import HomeCarouselManager from '@/components/home/HomeCarrousel/HomeCarouselManager';
import CardsInformativas from '@/components/home/CardsInformativas/CardsInformativas';
import CardsInformativasManager from '@/components/home/CardsInformativas/CardsInformativasManager';
import CategoriasGrid from '@/components/home/CategoriasGrid/CategoriasGrid';
import CategoriasManager from '@/components/home/CategoriasGrid/CategoriasManager';
import InfoCardSpecial from '@/components/home/InfoCardSpecial/InfoCardSpecial';
import InfoCardSpecialManager from '@/components/home/InfoCardSpecial/InfoCardSpecialManager';
import ProductosDestacados from '@/components/home/ProductosDestacados';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [showCarouselAdmin, setShowCarouselAdmin] = useState(false);
  const [showCardsAdmin, setShowCardsAdmin] = useState(false);
  const [showCategoriasAdmin, setShowCategoriasAdmin] = useState(false);
  const [showInfoCardSpecialAdmin, setShowInfoCardSpecialAdmin] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="relative">
          {isAdmin && (
            <button
              onClick={() => setShowCarouselAdmin(!showCarouselAdmin)}
              className="absolute top-4 left-4 z-20 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all backdrop-blur-sm"
              title="Administrar carousel"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          )}
          
          <HomeCarousel />
        </div>
      </section>

      {showCarouselAdmin && isAdmin && (
        <section className="container mx-auto px-4 pb-8">
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

      {/* Nueva sección de Productos Destacados */}
      <section className="bg-white">
        <ProductosDestacados />
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="relative">
          {isAdmin && (
            <button
              onClick={() => setShowCardsAdmin(!showCardsAdmin)}
              className="absolute top-0 right-0 z-10 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
              title="Administrar cards informativas"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          )}

          <CardsInformativas />
        </div>
      </section>

      {showCardsAdmin && isAdmin && (
        <section className="container mx-auto px-4 pb-8">
          <CardsInformativasManager />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowCardsAdmin(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar Administración Cards
            </button>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-8">
        <div className="relative">
          {isAdmin && (
            <button
              onClick={() => setShowInfoCardSpecialAdmin(!showInfoCardSpecialAdmin)}
              className="absolute top-0 right-0 z-10 bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700 transition-colors"
              title="Administrar card informativa especial"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          )}

          <InfoCardSpecial />
        </div>
      </section>

      {showInfoCardSpecialAdmin && isAdmin && (
        <section className="container mx-auto px-4 pb-8">
          <InfoCardSpecialManager />
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowInfoCardSpecialAdmin(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar Administración Card Especial
            </button>
          </div>
        </section>
      )}

      <section className="container mx-auto px-4 py-8">
        <div className="relative">
          {isAdmin && (
            <button
              onClick={() => setShowCategoriasAdmin(!showCategoriasAdmin)}
              className="absolute top-0 right-0 z-10 bg-orange-600 text-white p-2 rounded-full hover:bg-orange-700 transition-colors"
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