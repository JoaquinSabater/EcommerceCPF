'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginResponse } from '@/types/types';
import Link from 'next/link';
import { EyeIcon, EyeSlashIcon} from '@heroicons/react/24/outline';


export default function LoginPage() {
  const router = useRouter();
  const [cuil, setCuil] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        console.log('Usuario logueado:', data.user?.nombre);
        localStorage.setItem('user', JSON.stringify(data.user));
        
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
      }
    } catch (error) {
      setError('Error al iniciar sesión');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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
          💡 Clientes existentes pueden ingresar solo con CUIL
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