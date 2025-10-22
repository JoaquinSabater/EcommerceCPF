"use client";

import { useState, useEffect, useRef } from 'react';
import { CldImage } from 'next-cloudinary';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';
import HomeCarouselManager from '@/components/home/HomeCarrousel/HomeCarouselManager';

interface CarouselSlide {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_desktop: string;
  imagen_mobile: string;
  enlace: string;
  orden: number;
  activo: boolean;
}

export default function HomeCarousel() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const { isAdmin } = useAuth();

  // Detectar si es mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Cargar slides (máximo 4)
  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/home-carousel');
      if (response.ok) {
        const data = await response.json();
        setSlides(data.slice(0, 4));
      }
    } catch (error) {
      console.error('Error loading carousel slides:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-advance carousel - 10 segundos
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleSlideClick = (enlace: string) => {
    if (enlace && !isDragging) {
      if (enlace.startsWith('http')) {
        window.open(enlace, '_blank');
      } else {
        window.location.href = enlace;
      }
    }
  };

  // Manejo de swipe en mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (slides.length <= 1) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || slides.length <= 1) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging || slides.length <= 1) return;
    
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    const threshold = 50;

    if (Math.abs(diffX) > threshold) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    setIsDragging(false);
    setStartX(0);
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] md:h-[400px] lg:h-[500px] bg-gray-200 animate-pulse"></div>
    );
  }

  return (
    <>
      {slides.length === 0 ? (
        <div className="w-full h-[600px] md:h-[400px] lg:h-[500px] bg-gradient-to-r from-orange-100 to-orange-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-2xl font-bold text-orange-800 mb-2">CPF - Accesorios</h2>
            <p className="text-orange-600">Próximamente novedades aquí</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-[600px] md:h-[400px] lg:h-[500px] overflow-hidden shadow-xl">
          {/* Slides Container */}
          <div 
            className="relative w-full h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                  index === currentSlide 
                    ? 'opacity-100 transform translate-x-0' 
                    : index < currentSlide 
                      ? 'opacity-0 transform -translate-x-full'
                      : 'opacity-0 transform translate-x-full'
                }`}
              >
                <div 
                  className="relative w-full h-full cursor-pointer group"
                  onClick={() => handleSlideClick(slide.enlace)}
                >
                  <CldImage
                    src={isMobile ? slide.imagen_mobile : slide.imagen_desktop}
                    alt={slide.titulo}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    quality={90}
                    sizes={isMobile ? "100vw" : "1200px"}
                  />
                  
                  {/* Overlay solo en la parte inferior */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent">
                    {slide.descripcion && (
                      <div className="p-4 text-white">
                        <div className="backdrop-blur-sm bg-black/20 rounded-lg p-3">
                          <p className="text-sm md:text-base drop-shadow-lg line-clamp-2 opacity-90">
                            {slide.descripcion}
                          </p>
                          {slide.enlace && (
                            <div className="mt-2">
                              <span className="text-xs md:text-sm text-orange-300 font-medium">
                                Toca para ver más →
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Badge de posición */}
                  <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                    {index + 1}/{slides.length}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Botones de navegación - Solo desktop */}
          {slides.length > 1 && !isMobile && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all backdrop-blur-sm group"
                aria-label="Slide anterior"
              >
                <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              </button>
              
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-all backdrop-blur-sm group"
                aria-label="Slide siguiente"
              >
                <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}

          {/* Indicadores */}
          {slides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-orange-600 scale-125' 
                      : 'bg-white/60 hover:bg-white/80 hover:scale-110'
                  }`}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Instrucción de swipe en mobile */}
          {isMobile && slides.length > 1 && (
            <div className="absolute top-4 left-4 bg-black/30 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              Desliza para ver más
            </div>
          )}
        </div>
      )}
    </>
  );
}