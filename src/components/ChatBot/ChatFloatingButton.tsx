'use client';

import { useState, useRef } from 'react';

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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const res = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages }),
    });

    const data = await res.json();

    setMessages([...newMessages, { role: 'assistant', content: data.message }]);
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition"
        aria-label="Abrir chat"
      >
        <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
          <path d="M7 17h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2Zm0 0v3l3-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-start"
          onClick={handleBackdropClick}
        >
          <div
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-xs mx-4 mb-24 px-4 py-4 border"
            style={{ borderRadius: '20px' }}
          >
            <div
              className="absolute left-5 -bottom-5 w-0 h-0"
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

            <div className="text-sm text-gray-500 mb-2 max-h-60 overflow-y-auto">
              {messages.map((m, i) => (
                <div key={i} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg ${m.role === 'user' ? 'bg-orange-100 text-gray-800' : 'bg-gray-100 text-gray-700'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && <p className="text-xs text-gray-400">Pensando...</p>}
            </div>

            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 mt-4"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
