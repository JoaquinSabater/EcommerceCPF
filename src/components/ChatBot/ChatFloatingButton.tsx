'use client';

import { useState, useRef, useEffect } from 'react';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export default function ChatFloatingButton() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu mensaje.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay invisible para cerrar el chat cuando se toca afuera */}
      {open && (
        <div
          className="fixed inset-0 z-[9998]"
          onClick={() => setOpen(false)}
          aria-label="Cerrar chat"
        />
      )}

      {/* Panel de chat que emerge desde abajo */}
      <div
        ref={modalRef}
        className={`fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl z-[9999] transition-transform duration-300 ease-in-out ${
          open ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ height: '400px' }}
        onClick={(e) => e.stopPropagation()} // Prevenir que el click se propague al overlay
      >
        <div className="h-full flex flex-col">
          {/* Header del chat */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                  <path d="M7 17h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Zm0 0v3l3-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold">Asistente Virtual</h2>
                <p className="text-xs text-orange-100">Estoy aquí para ayudarte</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-orange-100">En línea</span>
            </div>
          </div>

          {/* Área de mensajes */}
          <div className="flex-1 overflow-y-auto px-6 py-4 bg-gray-50/80">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24">
                    <path d="M7 17h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Zm0 0v3l3-3" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-sm">¡Hola! ¿En qué puedo ayudarte hoy?</p>
                <p className="text-xs text-gray-400 mt-1">Escribe tu mensaje para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-orange-500 text-white rounded-br-sm'
                          : 'bg-white/90 text-gray-800 shadow-sm border rounded-bl-sm backdrop-blur-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-white/90 text-gray-800 shadow-sm border rounded-2xl rounded-bl-sm px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-500">Escribiendo...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input area integrada con el botón */}
          <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-6 py-4">
            <form onSubmit={sendMessage} className="flex items-end gap-3">
              {/* Botón toggle - ahora primero, a la izquierda */}
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="text-white rounded-full p-3 transition-all duration-300 flex-shrink-0 shadow-md"
                style={{ backgroundColor: '#ea580c' }}
                aria-label={open ? "Cerrar chat" : "Abrir chat"}
              >
                <svg 
                  width="20" 
                  height="20" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              
              <div className="flex-1">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  disabled={loading}
                  className="w-full border border-gray-300 rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none disabled:opacity-50 bg-white/90 backdrop-blur-sm"
                />
              </div>
              
              {/* Botón de enviar - al final, a la derecha */}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="text-white rounded-full p-3 transition-colors duration-200 flex-shrink-0"
                style={{ backgroundColor: !input.trim() || loading ? '#d1d5db' : '#ea580c' }}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Botón flotante - solo cuando el chat está cerrado */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-[10000] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
          style={{ backgroundColor: '#ea580c' }}
          aria-label="Abrir chat"
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <path d="M7 17h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Zm0 0v3l3-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      )}
    </>
  );
}