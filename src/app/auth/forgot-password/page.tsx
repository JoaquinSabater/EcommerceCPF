'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { sendResetPasswordEmailClient } from '@/lib/email';

export const dynamic = 'force-dynamic';


export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    // console.log('🔍 Debug: Iniciando proceso de forgot password para:', email);

    try {
      // console.log('🔍 Debug: Llamando a API forgot-password...');
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // console.log('🔍 Debug: Response status:', response.status);
      const data = await response.json();
      // console.log('🔍 Debug: Respuesta de API:', data);

      if (response.ok && data.success) {
        if (data.emailData && data.emailConfig) {
          console.log('🔍 Debug: Datos de email recibidos:', {
            email: data.emailData.email,
            nombre: data.emailData.nombre,
            tokenLength: data.emailData.resetToken?.length
          });
          console.log('🔍 Debug: Configuración EmailJS recibida:', data.emailConfig);
          
          try {
            console.log('🔍 Debug: Intentando enviar email con EmailJS...');
            const emailResult = await sendResetPasswordEmailClient(
              data.emailData.email,
              data.emailData.resetToken,
              data.emailData.nombre,
              data.emailConfig
            );
            console.log('✅ Email enviado exitosamente:', emailResult);
          } catch (emailError) {
            console.error('❌ Error enviando email:', emailError);
            console.error('❌ Stack trace completo:', emailError);
            
            const errorMsg = emailError instanceof Error ? emailError.message : 'Error desconocido';
            setError(`Error al enviar email: ${errorMsg}. El token fue generado pero no se pudo enviar el email.`);
            setLoading(false);
            return;
          }
        } else {
          console.log('🔍 Debug: No hay emailData o emailConfig en la respuesta');
        }
        
        setMessage(data.message);
        setEmailSent(true);
      } else {
        console.error('❌ Error en API response:', data);
        setError(data.message || 'Error al procesar la solicitud');
      }
    } catch (error) {
      console.error('❌ Error general:', error);
      setError('Error al enviar la solicitud. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Email enviado</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="space-y-3">
              <Link 
                href="/" 
                className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-block text-center"
              >
                Volver al login
              </Link>
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                  setMessage('');
                }}
                className="w-full text-gray-600 hover:text-gray-800 text-sm"
              >
                Enviar a otro email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="mb-6">
          <Link 
            href="/" 
            className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver al login
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Recuperar contraseña</h1>
          <p className="text-gray-600 mt-2">
            Ingresa tu email y te enviaremos instrucciones para restablecer tu contraseña.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="tu@email.com"
              required
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Enviando...' : 'Enviar instrucciones'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Revisa también tu carpeta de spam si no recibes el email.
          </p>
        </div>
      </div>
    </div>
  );
}