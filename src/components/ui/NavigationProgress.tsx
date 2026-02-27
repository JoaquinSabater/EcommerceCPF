'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startLoading = () => {
    setProgress(0);
    setIsLoading(true);
  };

  const stopLoading = () => {
    // Lleva la barra al 100% y luego oculta
    setProgress(100);
    setTimeout(() => {
      setIsLoading(false);
      setProgress(0);
    }, 300);
  };

  // Avanzar la barra progresivamente mientras carga
  useEffect(() => {
    if (isLoading) {
      // Arranca en 10% inmediato para dar feedback rápido
      setProgress(10);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          // Avanza rápido al principio, más lento al final (nunca llega a 95%)
          if (prev < 30) return prev + 8;
          if (prev < 60) return prev + 4;
          if (prev < 80) return prev + 2;
          if (prev < 92) return prev + 0.5;
          return prev;
        });
      }, 300);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isLoading]);

  // Cuando cambia la ruta → página lista → completar
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      stopLoading();
      prevPathname.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor || !anchor.href) return;
      try {
        const target = new URL(anchor.href);
        const isSameSite = target.origin === window.location.origin;
        const isDifferentPage = target.pathname !== window.location.pathname;
        const isNormalLink = !anchor.target && !anchor.download;
        if (isSameSite && isDifferentPage && isNormalLink) {
          startLoading();
        }
      } catch {
        // href inválido, ignorar
      }
    };

    const handleNavigationStart = () => startLoading();

    document.addEventListener('click', handleLinkClick, true);
    window.addEventListener('navigation-start', handleNavigationStart);

    return () => {
      document.removeEventListener('click', handleLinkClick, true);
      window.removeEventListener('navigation-start', handleNavigationStart);
    };
  }, []);

  if (!isLoading) return null;

  return (
    <>
      {/* Barra de progreso en la parte superior */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-orange-100">
        <div
          className="h-full transition-all ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: '#ff7100',
            transitionDuration: progress === 100 ? '200ms' : '300ms',
          }}
        />
      </div>

      {/* Overlay con spinner y texto */}
      <div className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
        <div
          className="animate-spin rounded-full h-10 w-10 border-b-2 mb-3"
          style={{ borderColor: '#ff7100' }}
        />
        <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
          Cargando...
        </p>
        <p className="text-xs mt-1" style={{ color: '#1a1a1a', opacity: 0.5 }}>
          Puede tardar unos segundos
        </p>
      </div>
    </>
  );
}

