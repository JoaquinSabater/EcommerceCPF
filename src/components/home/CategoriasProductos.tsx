"use client";

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductoDestacadoCard from './ProductoDestacadoCard';
import { categorias } from '@/types/types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Categoria {
  id: string;
  label: string;
}

const categorias_disponibles: Categoria[] = [
  { id: 'best-sellers', label: 'Best Sellers' },
  { id: 'magsafe', label: 'MagSafe' },
  { id: 'ofertas', label: 'Ofertas' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'nuevos-ingresos', label: 'Nuevos Ingresos' },
];

export default function CategoriasProductos() {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('best-sellers');
  const [productos, setProductos] = useState<categorias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductosPorCategoria = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/productos-por-categoria?categoria=${categoriaSeleccionada}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar productos');
        }
        
        const data = await response.json();
        setProductos(data);
      } catch (error) {
        console.error('Error fetching productos por categoría:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProductosPorCategoria();
  }, [categoriaSeleccionada]);

  const handleCategoriaChange = (categoriaId: string) => {
    setCategoriaSeleccionada(categoriaId);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Find Your Favorites
        </h2>
      </div>

      {/* Selector de categorías */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categorias_disponibles.map((categoria) => (
          <button
            key={categoria.id}
            onClick={() => handleCategoriaChange(categoria.id)}
            className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
              categoriaSeleccionada === categoria.id
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-300/50 scale-105'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-orange-400 hover:shadow-md hover:shadow-orange-200/50'
            }`}
          >
            {categoria.label}
          </button>
        ))}
      </div>

      {/* Contenido de productos */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
              <div className="h-48 md:h-56 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-10 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 shadow-md hover:shadow-lg hover:shadow-orange-300/50 transition-all"
          >
            Reintentar
          </button>
        </div>
      ) : productos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No hay productos en esta categoría en este momento
          </p>
        </div>
      ) : (
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: '.categorias-prev',
              nextEl: '.categorias-next',
            }}
            pagination={{
              clickable: true,
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active !bg-orange-500',
            }}
            breakpoints={{
              480: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
              1280: {
                slidesPerView: 5,
              },
            }}
            className="categorias-productos-swiper"
          >
            {productos.map((producto) => (
              <SwiperSlide key={producto.id}>
                <ProductoDestacadoCard 
                  categoria={producto} 
                  onClick={() => {}}
                />
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botones de navegación personalizados */}
          <button className="categorias-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white rounded-full p-3 shadow-lg hover:shadow-orange-300/50 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>

          <button className="categorias-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white rounded-full p-3 shadow-lg hover:shadow-orange-300/50 transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Indicador de cantidad */}
      {!loading && !error && productos.length > 0 && (
        <div className="text-center mt-6">
          <span className="text-sm text-gray-500">
            {productos.length} producto{productos.length !== 1 ? 's' : ''} en {categorias_disponibles.find(c => c.id === categoriaSeleccionada)?.label}
          </span>
        </div>
      )}
    </div>
  );
}
