import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Configuración corregida según la nueva estructura de Next.js 15
  serverExternalPackages: [], // ✅ Movido fuera de experimental
  
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  output: 'standalone',
};

export default nextConfig;
