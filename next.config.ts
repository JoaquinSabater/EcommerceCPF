import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Configuración corregida según la nueva estructura de Next.js 15
  serverExternalPackages: [], // ✅ Movido fuera de experimental

  experimental: {
    // ✅ Cache del Router en el cliente: las páginas dinámicas visitadas
    // se mantienen en cache 60s, así al volver atrás no se recargan.
    staleTimes: {
      dynamic: 300, // páginas dinámicas: 5 minutos en cache del cliente
      static: 300,  // páginas estáticas: 5 minutos
    },
  },

  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // ✅ OPTIMIZADO: Configuración de imágenes para reducir bandwidth
  images: {
    formats: ['image/webp', 'image/avif'], // WebP/AVIF automático (80% menos tamaño)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Tamaños responsive
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Tamaños para iconos
    minimumCacheTTL: 3600, // Cache de 1 hora en el cliente
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // ✅ OPTIMIZADO: Habilitar compresión Gzip/Brotli
  compress: true,
  
  // ⚠️ DESHABILITADO: output: 'standalone' causa problemas de permisos en Windows con pnpm
  // output: 'standalone',
};

export default nextConfig;
