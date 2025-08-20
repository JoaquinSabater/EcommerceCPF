"use client";

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';

interface CardInformativa {
  id: number;
  titulo: string;
  subtitulo: string;
  imagen: string;
  enlace: string | null;
  orden: number;
  activo: boolean;
}

// ✅ Color fijo en el código
const CARD_COLOR = '#FF5722'; // Color naranja de la imagen de referencia

export default function CardsInformativas() {
  const [cards, setCards] = useState<CardInformativa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards-informativas');
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLocalImage = (imagen: string) => {
    return imagen === 'not-image' || imagen.startsWith('/') || imagen.startsWith('not-image');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="bg-gray-200 animate-pulse rounded-lg h-64 md:h-80 w-full"></div>
        ))}
      </div>
    );
  }

  if (cards.length === 0) {
    return null; // No mostrar nada si no hay cards
  }

  return (
    <div className="space-y-6">
      {cards.map((card) => {
        const CardContent = () => (
          <div 
            className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer w-full"
            style={{ backgroundColor: CARD_COLOR }}
          >
            {/* Layout Mobile: Imagen arriba, texto abajo */}
            <div className="block md:hidden">
              {/* Imagen - Mobile */}
              <div className="relative h-48 w-full">
                {isLocalImage(card.imagen) ? (
                  <Image
                    src="/not-image.png"
                    alt={card.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <CldImage
                    src={card.imagen}
                    alt={card.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              
              {/* Texto - Mobile */}
              <div className="p-6 text-white">
                <p className="text-sm font-medium opacity-90 mb-1">
                  {card.titulo}
                </p>
                <h3 className="text-2xl font-bold leading-tight mb-4">
                  {card.subtitulo.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </h3>
                <div className="inline-block">
                  <span className="bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium group-hover:bg-gray-100 transition-colors">
                    ver +
                  </span>
                </div>
              </div>
            </div>

            {/* Layout Desktop: Lado a lado */}
            <div className="hidden md:flex h-64 lg:h-80">
              {/* Lado izquierdo - Texto */}
              <div className="w-1/2 flex flex-col justify-center p-6 lg:p-8 text-white">
                <p className="text-sm lg:text-base font-medium opacity-90 mb-2">
                  {card.titulo}
                </p>
                <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-6">
                  {card.subtitulo.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </h3>
                <div className="inline-block">
                  <span className="bg-white text-gray-800 px-4 py-2 lg:px-6 lg:py-3 rounded-full text-sm lg:text-base font-medium group-hover:bg-gray-100 transition-colors">
                    ver +
                  </span>
                </div>
              </div>

              {/* Lado derecho - Imagen */}
              <div className="w-1/2 relative">
                {isLocalImage(card.imagen) ? (
                  <Image
                    src="/not-image.png"
                    alt={card.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <CldImage
                    src={card.imagen}
                    alt={card.titulo}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
            </div>
          </div>
        );

        // Si tiene enlace, wrappear con Link, sino solo mostrar la card
        return card.enlace ? (
          <Link key={card.id} href={card.enlace} className="block">
            <CardContent />
          </Link>
        ) : (
          <div key={card.id}>
            <CardContent />
          </div>
        );
      })}
    </div>
  );
}