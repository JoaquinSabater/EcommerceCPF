'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

interface ProspectoData {
  id: number;
  nombre: string;
  email: string;
  telefono: string;
  cuit: string;
  negocio: string;
}

export function useProspectoMode() {
  const [isProspectoMode, setIsProspectoMode] = useState(false);
  const [isChatbotMode, setIsChatbotMode] = useState(false); // ✅ NUEVO
  const [prospectoData, setProspectoData] = useState<ProspectoData | null>(null);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // ✅ SI HAY UN USUARIO AUTENTICADO, NO ACTIVAR MODO PROSPECTO NI CHATBOT
    if (user) {
      setIsProspectoMode(false);
      setIsChatbotMode(false);
      setProspectoData(null);
      return;
    }

    // ✅ VERIFICAR SI HAY TOKEN EN LA URL
    const tokenFromUrl = searchParams.get('token');
    
    if (tokenFromUrl) {
      console.log('🔍 Token detectado en URL, validando...');
      validateTokenFromUrl(tokenFromUrl);
      return;
    }

    // Solo verificar modo prospecto/chatbot existente si NO hay usuario autenticado y NO hay token en URL
    const prospectoModeActive = localStorage.getItem('prospecto_mode') === 'true';
    const chatbotModeActive = localStorage.getItem('chatbot_mode') === 'true'; // ✅ NUEVO
    const prospectoDataStored = localStorage.getItem('prospecto_data');
    
    if (prospectoModeActive && prospectoDataStored) {
      setIsProspectoMode(true);
      setProspectoData(JSON.parse(prospectoDataStored));
    } else if (chatbotModeActive && prospectoDataStored) { // ✅ NUEVO
      setIsChatbotMode(true);
      setProspectoData(JSON.parse(prospectoDataStored));
    } else {
      setIsProspectoMode(false);
      setIsChatbotMode(false);
      setProspectoData(null);
    }
  }, [user, searchParams]);

  const validateTokenFromUrl = async (token: string) => {
    setIsValidatingToken(true);
    
    try {
      console.log('🔍 Validando token...');
      
      const response = await fetch('/api/prospectos/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();

      if (data.success && data.prospecto) {
        console.log('✅ Token válido, activando modo:', data.isChatbot ? 'chatbot' : 'prospecto');
        
        // ✅ NUEVO: Activar modo según el tipo de token
        if (data.isChatbot) {
          setIsChatbotMode(true);
          setIsProspectoMode(false);
          localStorage.setItem('chatbot_mode', 'true');
          localStorage.setItem('prospecto_mode', 'false');
        } else {
          setIsProspectoMode(true);
          setIsChatbotMode(false);
          localStorage.setItem('prospecto_mode', 'true');
          localStorage.setItem('chatbot_mode', 'false');
        }
        
        setProspectoData(data.prospecto);
        
        // Guardar en localStorage
        localStorage.setItem('prospecto_data', JSON.stringify(data.prospecto));
        localStorage.setItem('prospecto_token', token);
        
        // ✅ REDIRIGIR AL LOBBY SIN TOKEN EN URL
        router.replace('/public');
        
      } else {
        console.error('❌ Token inválido:', data.message);
        clearProspectoSession();
        router.push(`/?error=${encodeURIComponent(data.message || 'Token inválido')}`);
      }
    } catch (error) {
      console.error('❌ Error validando token:', error);
      clearProspectoSession();
      router.push('/?error=Error al validar el acceso');
    } finally {
      setIsValidatingToken(false);
    }
  };

  const clearProspectoSession = () => {
    localStorage.removeItem('prospecto_mode');
    localStorage.removeItem('chatbot_mode'); // ✅ NUEVO
    localStorage.removeItem('prospecto_data');
    localStorage.removeItem('prospecto_cart');
    localStorage.removeItem('prospecto_token');
    setIsProspectoMode(false);
    setIsChatbotMode(false); // ✅ NUEVO
    setProspectoData(null);
  };

  const clearAndReload = () => {
    clearProspectoSession();
    window.location.reload();
  };

  return {
    isProspectoMode,
    isChatbotMode, // ✅ NUEVO
    prospectoData,
    isValidatingToken,
    clearProspectoSession,
    clearAndReload
  };
}