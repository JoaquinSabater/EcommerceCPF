"use client";

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductoDestacadoCard from './ProductoDestacadoCard';
import { categorias } from '@/types/types';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function ProductosDestacados() {
  const [productosDestacados, setProductosDestacados] = useState<categorias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductosDestacados = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/productos-destacados');
        
        if (!response.ok) {
          throw new Error('Error al cargar productos destacados');
        }
        
        const data = await response.json();
        setProductosDestacados(data);
      } catch (error) {
        console.error('Error fetching productos destacados:', error);
        setError(error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchProductosDestacados();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Productos Destacados
          </h2>
          <p className="text-gray-600">
            Descubre nuestros productos más populares
          </p>
        </div>
        
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Productos Destacados
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (productosDestacados.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Productos Destacados
          </h2>
          <p className="text-gray-600">
            No hay productos destacados en este momento
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
          Productos Destacados
        </h2>
        <p className="text-gray-600">
          Descubre nuestros productos más populares y mejor valorados
        </p>
      </div>

      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{
            prevEl: '.destacados-prev',
            nextEl: '.destacados-next',
          }}
          pagination={{
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active !bg-orange-500',
          }}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
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
          className="productos-destacados-swiper"
        >
          {productosDestacados.map((producto) => (
            <SwiperSlide key={producto.id}>
              <ProductoDestacadoCard 
                categoria={producto} 
                onClick={() => {}}
              />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Botones de navegación personalizados */}
        <button className="destacados-prev absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-orange-500 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <button className="destacados-next absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white hover:text-orange-500 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Indicador de cantidad */}
      <div className="text-center mt-6">
        <span className="text-sm text-gray-500">
          {productosDestacados.length} producto{productosDestacados.length !== 1 ? 's' : ''} destacado{productosDestacados.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}