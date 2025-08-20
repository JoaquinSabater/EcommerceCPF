"use client";

import { useState } from 'react';
import { CogIcon } from '@heroicons/react/24/outline';
import HomeCarousel from '@/components/home/HomeCarrousel/HomeCarousel';
import HomeCarouselManager from '@/components/home/HomeCarrousel/HomeCarouselManager';
import CardsInformativas from '@/components/home/CardsInformativas/CardsInformativas';
import CardsInformativasManager from '@/components/home/CardsInformativas/CardsInformativasManager';
import CategoriasGrid from '@/components/home/CategoriasGrid/CategoriasGrid';
import CategoriasManager from '@/components/home/CategoriasGrid/CategoriasManager';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const [showCarouselAdmin, setShowCarouselAdmin] = useState(false);
  const [showCardsAdmin, setShowCardsAdmin] = useState(false);
  const [showCategoriasAdmin, setShowCategoriasAdmin] = useState(false);
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section con Carousel */}
      <section className="container mx-auto px-4 py-6 md:py-8">
        <div className="relative">
          {/* Botón de administración del carousel */}
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

      {/* Panel de Administración del Carousel */}
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

      {/* Sección de Cards Informativas */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative">
          {/* Botón de administración de cards */}
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

      {/* Panel de Administración de Cards */}
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

      {/* Sección de Categorías */}
      <section className="container mx-auto px-4 py-8">
        <div className="relative">
          {/* Botón de administración de categorías */}
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

      {/* Panel de Administración de Categorías */}
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

      {/* Sección de bienvenida */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Bienvenidos a CPF
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Tu tienda de confianza para accesorios y protección de dispositivos móviles
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-semibold mb-2">Protección Premium</h3>
              <p className="text-gray-600">Vidrios templados y fundas de alta calidad</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Instalación Rápida</h3>
              <p className="text-gray-600">Servicio profesional y garantizado</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Amplia Compatibilidad</h3>
              <p className="text-gray-600">Para todos los modelos y marcas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-orange-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Necesitas proteger tu dispositivo?
          </h2>
          <p className="text-lg mb-6 opacity-90">
            Explora nuestro catálogo y encuentra la protección perfecta
          </p>
          <a 
            href="/public/vidrios" 
            className="inline-block bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Ver Catálogo
          </a>
        </div>
      </section>
    </div>
  );
}