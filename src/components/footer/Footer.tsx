"use client";

import Link from 'next/link';
import Image from 'next/image';
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/logo_orange_on_transparent.png"
                width={32}
                height={32}
                alt="CPF Logo"
              />
              <h3 className="text-xl font-semibold text-gray-900">CPF</h3>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              Tu tienda de confianza para accesorios y protección de dispositivos móviles. 
              Calidad garantizada y el mejor servicio.
            </p>
            <div className="flex space-x-4">
              {/* Facebook */}
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              
              {/* Instagram */}
              <a href="#" className="text-gray-400 hover:text-pink-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              
              {/* Pinterest */}
              <a href="#" className="text-gray-400 hover:text-red-600 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>
                </svg>
              </a>
              
              {/* TikTok */}
              <a href="#" className="text-gray-400 hover:text-black transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* ...existing code... */}
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/public" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/public/vidrios" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Vidrios Templados
                </Link>
              </li>
              <li>
                <Link href="/public/fundas" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Fundas
                </Link>
              </li>
              <li>
                <Link href="/public/accesorios" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link href="/public/baterias" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Baterías
                </Link>
              </li>
              <li>
                <Link href="/public/cables" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Cables
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Atención al Cliente</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/public/contacto" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/public/envios" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Información de Envíos
                </Link>
              </li>
              <li>
                <Link href="/public/garantia" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Garantías
                </Link>
              </li>
              <li>
                <Link href="/public/devoluciones" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link href="/public/faq" className="text-sm text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    Av. Principal 123<br />
                    Ciudad, CP 12345<br />
                    Argentina
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">+54 11 1234-5678</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">info@cpf.com.ar</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <ClockIcon className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">
                    Lun - Vie: 9:00 - 18:00<br />
                    Sáb: 9:00 - 13:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <TruckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 text-sm">Envío Gratis</h5>
                <p className="text-gray-600 text-xs">En compras superiores a $150.000</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 text-sm">Garantía Extendida</h5>
                <p className="text-gray-600 text-xs">12 meses en todos los productos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-orange-600 p-2 rounded-lg">
                <CreditCardIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900 text-sm">Pago Seguro</h5>
                <p className="text-gray-600 text-xs">Múltiples métodos de pago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-600 text-xs">
              © {currentYear} CPF. Todos los derechos reservados.
            </div>
            <div className="flex space-x-6 text-xs">
              <Link href="/public/privacidad" className="text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                Política de Privacidad
              </Link>
              <Link href="/public/terminos" className="text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                Términos y Condiciones
              </Link>
              <Link href="/public/cookies" className="text-gray-600 hover:text-orange-600 hover:underline underline-offset-4 transition-colors">
                Política de Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}