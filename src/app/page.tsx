'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginResponse } from '@/types/types'; // ← Importar tipo

export default function LoginPage() {
  const router = useRouter();
  const [cuil, setCuil] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        body: JSON.stringify({ cuil }),
      });

      const data: LoginResponse = await response.json(); // ← Tipado de la respuesta

      if (response.ok && data.success) {
        console.log('Usuario logueado:', data.user.nombre);
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push("/public");
      } else {
        setError('CUIL no encontrado');
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
        className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-xs"
      >
        <h1 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h1>
        <input
          type="text"
          placeholder="CUIL (ej: 20-12345678-9)"
          value={cuil}
          onChange={e => setCuil(e.target.value)}
          className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          required
        />
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
      </form>
    </div>
  );
}