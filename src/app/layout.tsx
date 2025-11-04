import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import ChatFloatingButton from "@/components/ChatBot/ChatFloatingButton";
import RouteGuard from '@/components/RouteGuard';
import { Suspense } from 'react';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CPF | Ecommerce",
  description: "Carrito de compras cpf",
};

// ✅ Loading component para RouteGuard
function RouteGuardLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mb-4"></div>
        <p className="text-gray-600">Cargando...</p>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* ✅ Envolver RouteGuard en Suspense */}
        <Suspense fallback={<RouteGuardLoading />}>
          <RouteGuard>
            <CartProvider>
              {children}
              {/* <ChatFloatingButton /> */}
            </CartProvider>
          </RouteGuard>
        </Suspense>
      </body>
    </html>
  );
}