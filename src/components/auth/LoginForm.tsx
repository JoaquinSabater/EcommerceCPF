'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginFormProps {
  onSubmit: (cuil: string, password: string) => void;
  loading: boolean;
  error: string;
}

export default function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [cuil, setCuil] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cuil, password);
  };

  return (
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
          placeholder="20-12345678-9"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Contraseña (opcional)
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder="Ingresa tu contraseña"
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

      <div className="text-xs text-gray-600 text-center">
        💡 Clientes existentes pueden ingresar solo con CUIL
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
        {loading ? 'Verificando...' : 'Entrar'}
      </button>
    </form>
  );
}