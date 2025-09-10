'use client';

import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface ResetPasswordFormProps {
  onSubmit: (newPassword: string, confirmPassword: string) => void;
  loading: boolean;
  error: string;
}

export default function ResetPasswordForm({ onSubmit, loading, error }: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(newPassword, confirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
      </button>
    </form>
  );
}