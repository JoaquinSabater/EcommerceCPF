'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, EyeIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';

export default function SetPasswordPage() {
  const router = useRouter();
  const [cuil, setCuil] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [hasExistingPassword, setHasExistingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cuil, newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } else {
        setError(data.message || 'Error al configurar la contraseña');
        
        // ✅ Detectar si ya tiene contraseña
        if (data.hasPassword) {
          setHasExistingPassword(true);
        }
      }
    } catch (error) {
      setError('Error al procesar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Pantalla especial si ya tiene contraseña
  if (hasExistingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
            <LockClosedIcon className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contraseña ya configurada</h2>
          <p className="text-gray-600 mb-6">
            Ya tienes una contraseña configurada en tu cuenta. Por seguridad, no puedes cambiarla desde aquí.
          </p>
          <div className="space-y-3">
            <Link 
              href="/auth/forgot-password" 
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-block"
            >
              Recuperar contraseña
            </Link>
            <Link 
              href="/" 
              className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors inline-block"
            >
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">¡Contraseña configurada!</h2>
          <p className="text-gray-600 mb-6">
            Tu contraseña ha sido configurada exitosamente. Ahora puedes iniciar sesión con tu CUIL y contraseña.
          </p>
          <Link 
            href="/" 
            className="bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors inline-block"
          >
            Ir al login
          </Link>
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
          <h1 className="text-2xl font-bold text-gray-900">Configurar contraseña</h1>
          <p className="text-gray-600 mt-2">
            Configura una contraseña para mayor seguridad en tu cuenta.
          </p>
          {/* ✅ Advertencia de que es solo para primera vez */}
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Importante:</strong> Esta opción es solo para configurar tu primera contraseña. 
              Si ya tienes una, usa "Recuperar contraseña".
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cuil" className="block text-sm font-medium text-gray-700 mb-1">
              CUIL
            </label>
            <input
              type="text"
              id="cuil"
              value={cuil}
              onChange={(e) => setCuil(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              placeholder="20123456789"
              required
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Nueva contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Mínimo 6 caracteres"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Confirma tu contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
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
            {loading ? 'Configurando...' : 'Configurar contraseña'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-xs text-gray-500">
            Al configurar una contraseña, podrás usar tanto tu CUIL solo como CUIL + contraseña para iniciar sesión.
          </p>
          <Link 
            href="/auth/forgot-password" 
            className="text-orange-600 hover:text-orange-700 text-sm"
          >
            ¿Ya tienes contraseña? Recupérala aquí
          </Link>
        </div>
      </div>
    </div>
  );
}