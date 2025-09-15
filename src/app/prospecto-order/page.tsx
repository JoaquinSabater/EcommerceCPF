'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

function ProspectoOrderContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Token no válido');
      setLoading(false);
      return;
    }

    validateToken(token);
  }, [token]);

  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/prospectos/validate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // ✅ LIMPIAR COMPLETAMENTE CUALQUIER SESIÓN EXISTENTE
        localStorage.clear(); // Limpiar todo el localStorage
        
        // ✅ CONFIGURAR MODO PROSPECTO LIMPIO
        localStorage.setItem('prospecto_mode', 'true');
        localStorage.setItem('prospecto_token', token);
        localStorage.setItem('prospecto_data', JSON.stringify(data.prospecto));
        localStorage.setItem('prospecto_cart', JSON.stringify([]));
        
        console.log('✅ Modo prospecto activado para:', data.prospecto.nombre);
        console.log('💡 Token válido por 4 días con acceso múltiple');
        
        // Mostrar éxito y redirigir después de 2 segundos
        setSuccess(true);
        setLoading(false);
        
        setTimeout(() => {
          window.location.href = '/public';
        }, 2000);
        
      } else {
        setError(data.message || 'Token inválido o expirado');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error validando token:', error);
      setError('Error al validar token');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Validando acceso...</h2>
          <p className="text-gray-600">Preparando tu experiencia de compra personalizada</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="mb-4">
            <svg className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">¡Acceso concedido!</h2>
          <p className="text-gray-600 mb-6">
            Bienvenido, puedes navegar y simular pedidos. 
            <br />Redirigiendo en unos segundos...
          </p>
          <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded">
            💡 <strong>Modo de prueba activado:</strong><br/>
            • Válido por 4 días<br/>
            • Puedes volver a usar este link las veces que quieras<br/>
            • Para comprar necesitarás registrarte como cliente
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <div className="mb-4">
            <svg className="h-16 w-16 text-red-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Link no válido</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <p className="text-sm text-gray-500">Posibles causas:</p>
            <ul className="text-xs text-gray-500 text-left space-y-1">
              <li>• Han pasado más de 4 días</li>
              <li>• El link es incorrecto</li>
              <li>• Solicita un nuevo link</li>
            </ul>
            <a 
              href="/" 
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors inline-block mt-4"
            >
              Ir al ecommerce
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function ProspectoOrderPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    }>
      <ProspectoOrderContent />
    </Suspense>
  );
}