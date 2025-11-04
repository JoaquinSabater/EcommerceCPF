import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // ✅ Para Next.js 15.3.1 - deshabilita la verificación estricta
    serverComponentsExternalPackages: [],
  },
  // ✅ Configuración para resolver problemas de pre-renderizado
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // ✅ Configuración de output para build
  output: 'standalone',
};

export default nextConfig;
