'use client';

import { useEffect, useMemo, useState } from 'react';
import type { TouchEvent } from 'react';
import { CldImage } from 'next-cloudinary';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import DetalleProductoModal from '@/components/Products/DetalleProductoModal';

export interface DestacadoItem {
  id: number;
  nombre: string;
  foto_portada?: string;
  foto1_url?: string;
}

interface DestacadosCarouselProps {
  productos: DestacadoItem[];
  clubSubDolarMode?: boolean;
}

export default function DestacadosCarousel({
  productos,
  clubSubDolarMode = false,
}: DestacadosCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cardsPerSlide, setCardsPerSlide] = useState(4);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  useEffect(() => {
    const updateCardsPerSlide = () => {
      if (window.innerWidth < 640) {
        setCardsPerSlide(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerSlide(2);
      } else {
        setCardsPerSlide(4);
      }
    };

    updateCardsPerSlide();
    window.addEventListener('resize', updateCardsPerSlide);

    return () => window.removeEventListener('resize', updateCardsPerSlide);
  }, []);

  const slides = useMemo(() => {
    const result: DestacadoItem[][] = [];
    for (let i = 0; i < productos.length; i += cardsPerSlide) {
      result.push(productos.slice(i, i + cardsPerSlide));
    }
    return result;
  }, [productos, cardsPerSlide]);

  if (slides.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const openItemModal = (itemId: number) => {
    setSelectedItemId(String(itemId));
    setModalOpen(true);
  };

  const closeItemModal = () => {
    setModalOpen(false);
    setSelectedItemId(null);
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (slides.length <= 1) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(false);
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (slides.length <= 1) return;
    const currentX = e.touches[0].clientX;
    const diffX = Math.abs(startX - currentX);
    if (diffX > 10) {
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (slides.length <= 1) return;

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

    setTimeout(() => {
      setIsDragging(false);
    }, 100);
    setStartX(0);
  };

  return (
    <>
      <div className="relative">
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slideIndex}
            className={`transition-all duration-500 ease-in-out ${
              slideIndex === currentSlide ? 'block' : 'hidden'
            }`}
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {slide.map((producto, itemIndex) => {
                const imagen = producto.foto_portada || producto.foto1_url || '';
                const priority = slideIndex === 0 && itemIndex < 2;

                return (
                  <button
                    key={producto.id}
                    type="button"
                    onClick={() => {
                      if (!isDragging) {
                        openItemModal(producto.id);
                      }
                    }}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  >
                    <div className="relative h-64 w-full overflow-hidden border-b border-gray-100 bg-white p-3 md:h-72">
                      <div className="absolute left-3 top-3 z-10">
                        <span className="rounded-full border border-yellow-300 bg-gradient-to-r from-yellow-400 to-yellow-500 px-3 py-1 text-xs font-bold text-white shadow">
                          ⭐ DESTACADO
                        </span>
                      </div>

                      {imagen ? (
                        <CldImage
                          src={imagen}
                          alt={producto.nombre}
                          fill
                          className="object-contain p-5 transition-transform duration-300 group-hover:scale-105"
                          crop="fit"
                          quality="auto:eco"
                          format="auto"
                          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 23vw"
                          priority={priority}
                        />
                      ) : (
                        <img
                          src="/not-image.png"
                          alt={producto.nombre}
                          className="h-full w-full object-contain"
                          loading="lazy"
                        />
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="line-clamp-2 min-h-[3.4rem] text-[1.05rem] font-bold leading-7 text-slate-900">
                        {producto.nombre}
                      </h3>

                      <div className="mt-4 flex justify-end">
                        <span className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-2 text-base font-bold text-white transition-colors group-hover:bg-orange-700">
                          ver +
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-3 text-gray-700 shadow-md transition hover:bg-white hover:text-orange-500"
            aria-label="Slide anterior"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/95 p-3 text-gray-700 shadow-md transition hover:bg-white hover:text-orange-500"
            aria-label="Slide siguiente"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>

          <div className="mt-4 flex justify-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 w-2 rounded-full transition ${
                  index === currentSlide ? 'scale-125 bg-orange-500' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
      </div>

      {selectedItemId && (
        <DetalleProductoModal
          itemId={selectedItemId}
          isOpen={modalOpen}
          onClose={closeItemModal}
          clubSubDolarMode={clubSubDolarMode}
        />
      )}
    </>
  );
}
