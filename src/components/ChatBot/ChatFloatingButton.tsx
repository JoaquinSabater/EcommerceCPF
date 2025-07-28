'use client';

import { useState, useRef } from "react";

export default function ChatFloatingButton() {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Cierra el modal si se hace click fuera del contenido
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  return (
    <>
      {/* Botón flotante */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition"
        aria-label="Abrir chat"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path d="M7 17h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Zm0 0v3l3-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-end"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 mb-24 p-4 border"
            style={{ borderRadius: '20px' }}
          >
            {/* Punta del globo */}
            <div className="absolute right-8 -bottom-5 w-0 h-0"
              style={{
                borderLeft: "16px solid transparent",
                borderRight: "16px solid transparent",
                borderTop: "20px solid white",
              }}
            />
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
              aria-label="Cerrar chat"
            >
              &#10005;
            </button>
            <h2 className="text-lg font-bold mb-2">Chatbot</h2>
            <div className="text-sm text-gray-500 mb-2">
              Aquí irá el chatbot...
            </div>
            {/* Chatbox */}
            <form
              className="flex items-center gap-2 mt-4"
              onSubmit={e => {
                e.preventDefault();
                // Aquí puedes manejar el envío del mensaje
              }}
            >
              <input
                type="text"
                placeholder="Escribe tu mensaje..."
                className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}