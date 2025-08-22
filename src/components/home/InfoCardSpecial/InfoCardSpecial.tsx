"use client";

import { useState, useEffect } from 'react';
import { CldImage } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';

interface InfoCardSpecialData {
  id: number;
  titulo: string;
  subtitulo: string;
  imagen: string;
  enlace: string;
  precio_destacado: string;
  orden: number;
  activo: boolean;
}

export default function InfoCardSpecial() {
  const [cardData, setCardData] = useState<InfoCardSpecialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCardData();
  }, []);

  const fetchCardData = async () => {
    try {
      const response = await fetch('/api/info-card-special');
      if (response.ok) {
        const data = await response.json();
        if (data.length > 0) {
          setCardData(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching info card special:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLocalImage = (imagen: string) => {
    return imagen === 'not-image' || imagen.startsWith('/') || imagen.startsWith('not-image');
  };

  if (loading) {
    return (
      <div className="bg-gray-200 animate-pulse rounded-lg h-64 md:h-80 w-full"></div>
    );
  }

  if (!cardData) {
    return null;
  }

  const CardContent = () => (
    <div className="relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer w-full bg-white">
      <div className="block md:hidden">
        <div className="relative h-48 w-full">
          {isLocalImage(cardData.imagen) ? (
            <Image
              src="/not-image.png"
              alt={cardData.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <CldImage
              src={cardData.imagen}
              alt={cardData.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
        
        <div className="flex">
          <div className="w-12 bg-pink-600 flex items-center justify-center">
            <div 
              className="text-white font-bold text-sm tracking-wider"
              style={{ 
                writingMode: 'vertical-rl',
                textOrientation: 'mixed'
              }}
            >
              info
            </div>
          </div>
          
          <div className="flex-1 p-6">
            <h3 className="text-xl font-bold mb-2 uppercase tracking-wide text-gray-800">
              {cardData.titulo}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              {cardData.subtitulo}
            </p>
            <div className="inline-block">
              <span className="text-pink-600 font-semibold uppercase tracking-wide border-b-2 border-pink-600 group-hover:border-pink-700 transition-colors">
                VER MAS
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex h-64 lg:h-80">
        <div className="w-12 lg:w-16 bg-pink-600 flex items-center justify-center">
          <div 
            className="text-white font-bold text-lg lg:text-xl tracking-wider"
            style={{ 
              writingMode: 'vertical-rl',
              textOrientation: 'mixed'
            }}
          >
            info
          </div>
        </div>

        <div className="w-1/2 flex flex-col justify-center p-6 lg:p-8">
          <h3 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 lg:mb-4 uppercase tracking-wide text-gray-800">
            {cardData.titulo}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-6 lg:mb-8 text-sm lg:text-base">
            {cardData.subtitulo}
          </p>
          
          <div className="inline-block">
            <span className="text-pink-600 font-semibold uppercase tracking-wide border-b-2 border-pink-600 group-hover:border-pink-700 transition-colors text-sm lg:text-base">
              VER MAS
            </span>
          </div>
        </div>

        <div className="w-1/2 relative">
          {isLocalImage(cardData.imagen) ? (
            <Image
              src="/not-image.png"
              alt={cardData.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <CldImage
              src={cardData.imagen}
              alt={cardData.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
        </div>
      </div>
    </div>
  );

  return cardData.enlace ? (
    <Link href={cardData.enlace} className="block">
      <CardContent />
    </Link>
  ) : (
    <CardContent />
  );
}