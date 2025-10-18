import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/components/CartContext";
import ChatFloatingButton from "@/components/ChatBot/ChatFloatingButton";
import RouteGuard from '@/components/RouteGuard';

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <RouteGuard>
          <CartProvider>
            {children}
            {/* <ChatFloatingButton /> */}
          </CartProvider>
        </RouteGuard>
      </body>
    </html>
  );
}