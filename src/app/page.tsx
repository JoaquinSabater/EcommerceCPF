'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginResponse } from '@/types/types';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon} from '@heroicons/react/24/outline';

export default function LoginPage() {
  const router = useRouter();
  const [cuil, setCuil] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [clienteDeshabilitado, setClienteDeshabilitado] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setClienteDeshabilitado(false); // Reset estado

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cuil, password }),
      });

      const data: LoginResponse = await response.json();

      if (response.ok && data.success) {
        //console.log('Usuario logueado:', data.cliente?.nombre);
        localStorage.setItem('user', JSON.stringify(data.cliente));
        localStorage.setItem('token', data.token || '');
        
        if (data.requiresPasswordSetup) {
          const wantsToSetPassword = confirm(
            'Por seguridad, ¿te gustaría configurar una contraseña ahora? (Puedes hacerlo después desde tu perfil)'
          );
          
          if (wantsToSetPassword) {
            router.push('/auth/set-password');
            return;
          }
        }
        
        router.push("/public");
      } else {
        setError(data.message || 'Error al iniciar sesión');
        
        // ✅ AQUÍ es donde debes verificar si está deshabilitado (DESPUÉS de obtener data)
        if (data.disabled) {
          setClienteDeshabilitado(true);
        }
      }
    } catch (error) {
      setError('Error al iniciar sesión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar estado especial si cliente está deshabilitado
  if (clienteDeshabilitado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cuenta no habilitada</h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta aún no está habilitada para usar el carrito de compras. 
            Por favor, contacta a tu vendedor para solicitar la activación.
          </p>
          <button 
            onClick={() => {
              setClienteDeshabilitado(false);
              setError('');
              setCuil('');
              setPassword('');
            }}
            className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Intentar con otro CUIL
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h1>
        
        {/* Campo CUIL */}
        <input
          type="text"
          placeholder="CUIL (ej: 20123456789)"
          value={cuil}
          onChange={e => setCuil(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />

        {/* Campo Contraseña */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña (opcional)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full border rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
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

        <div className="text-xs text-gray-600 text-center">
          💡 Solo clientes habilitados pueden acceder al carrito
        </div>

        {error && (
          <div className="text-red-600 text-sm text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-600 text-white rounded py-2 font-semibold hover:bg-orange-700 transition disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Entrar'}
        </button>

        {/* Enlaces */}
        <div className="flex flex-col gap-2 text-sm text-center">
          <Link 
            href="/auth/forgot-password" 
            className="text-orange-600 hover:text-orange-700 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
          <Link 
            href="/auth/set-password" 
            className="text-blue-600 hover:text-blue-700 hover:underline"
          >
            Configurar contraseña
          </Link>
        </div>
      </form>
    </div>
  );
}