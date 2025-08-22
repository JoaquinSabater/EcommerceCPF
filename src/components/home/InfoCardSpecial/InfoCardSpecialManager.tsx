"use client";

import { useState, useEffect } from 'react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface InfoCardSpecialData {
  id: number;
  titulo: string;
  subtitulo: string;
  imagen: string;
  enlace: string;
  precio_destacado: string;
  orden: number;
  activo: boolean;
}

export default function InfoCardSpecialManager() {
  const [cards, setCards] = useState<InfoCardSpecialData[]>([]);
  const [editingCard, setEditingCard] = useState<InfoCardSpecialData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) fetchCards();
  }, [isAdmin]);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/info-card-special');
      if (response.ok) {
        const data = await response.json();
        setCards(data);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const isLocalImage = (imagen: string) => {
    return imagen === 'not-image' || imagen.startsWith('/') || imagen.startsWith('not-image');
  };

  const handleEdit = (card: InfoCardSpecialData) => {
    setEditingCard({ ...card });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingCard({
      id: 0,
      titulo: '',
      subtitulo: '',
      imagen: 'not-image',
      enlace: '',
      precio_destacado: '',
      orden: cards.length + 1,
      activo: true
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingCard?.titulo || !editingCard?.subtitulo || !editingCard?.imagen || !editingCard?.enlace || !editingCard?.precio_destacado) {
      alert('Todos los campos son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const isCreating = editingCard.id === 0;
      const url = isCreating ? '/api/info-card-special' : `/api/info-card-special/${editingCard.id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCard)
      });

      if (response.ok) {
        await fetchCards();
        setIsEditing(false);
        setEditingCard(null);
      }
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar card?')) return;

    try {
      const response = await fetch(`/api/info-card-special/${id}`, { method: 'DELETE' });
      if (response.ok) await fetchCards();
    } catch (error) {
      console.error('Error deleting card:', error);
    }
  };

  const handleImageUpload = (result: any) => {
    if (result.info?.public_id && editingCard) {
      setEditingCard({ ...editingCard, imagen: result.info.public_id });
    }
  };

  if (!isAdmin || loading) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Gestión de Cards Especiales ({cards.length})</h3>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
        >
          <PlusIcon className="w-5 h-5" />
          Agregar Card
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="border rounded-lg p-4">
            <div className="relative overflow-hidden rounded-lg h-32 mb-3 bg-white border">
              <div className="flex h-full">
                <div className="flex-1 p-3 flex items-center space-x-3">
                  <div className="w-6 h-6 bg-pink-600 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800 mb-1">{card.titulo}</p>
                    <p className="text-xs text-gray-600 truncate">{card.subtitulo}</p>
                  </div>
                </div>
                
                <div className="relative w-1/2 h-full">
                  {isLocalImage(card.imagen) ? (
                    <Image src="/not-image.png" alt={card.titulo} fill className="object-cover" />
                  ) : (
                    <CldImage src={card.imagen} alt={card.titulo} fill className="object-cover" />
                  )}
                  <div className="absolute inset-0 bg-pink-600 bg-opacity-20"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-lg font-black text-pink-600">{card.precio_destacado}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <h4 className="font-medium mb-1">{card.titulo}</h4>
            <p className="text-sm text-gray-600 mb-2 truncate">{card.enlace}</p>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Orden: {card.orden}</span>

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleEdit(card)} className="flex-1 p-2 text-pink-600 hover:bg-pink-50 rounded">
                <PencilIcon className="w-4 h-4 mx-auto" />
              </button>
              <button onClick={() => handleDelete(card.id)} className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded">
                <TrashIcon className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsEditing(false)} />
          
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-bold mb-4">
              {editingCard.id === 0 ? 'Crear Card Especial' : 'Editar Card Especial'}
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                value={editingCard.titulo}
                onChange={(e) => setEditingCard({ ...editingCard, titulo: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-pink-500"
                placeholder="MINIMO DE COMPRA"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Subtítulo *</label>
              <textarea
                value={editingCard.subtitulo}
                onChange={(e) => setEditingCard({ ...editingCard, subtitulo: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-pink-500"
                rows={3}
                placeholder="Nuestro mínimo de compra es de $220.000..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Enlace *</label>
              <input
                type="text"
                value={editingCard.enlace}
                onChange={(e) => setEditingCard({ ...editingCard, enlace: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-pink-500"
                placeholder="/public/categoria"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Precio Destacado *</label>
              <input
                type="text"
                value={editingCard.precio_destacado}
                onChange={(e) => setEditingCard({ ...editingCard, precio_destacado: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-pink-500"
                placeholder="U$D200"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Imagen de Fondo *</label>
              <div className="flex items-center gap-3">
                <CldUploadWidget uploadPreset="cpf_upload" onSuccess={handleImageUpload}>
                  {({ open }) => (
                    <button type="button" onClick={() => open?.()} className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                      {editingCard.imagen === 'not-image' ? 'Subir' : 'Cambiar'}
                    </button>
                  )}
                </CldUploadWidget>
                
                {editingCard.imagen && (
                  <div className="w-[60px] h-[60px] relative">
                    {isLocalImage(editingCard.imagen) ? (
                      <Image src="/not-image.png" alt="Preview" fill className="rounded object-cover" />
                    ) : (
                      <CldImage src={editingCard.imagen} alt="Preview" fill className="rounded object-cover" />
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">La imagen ocupará toda la sección derecha como fondo</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Orden</label>
              <input
                type="number"
                min="1"
                value={editingCard.orden}
                onChange={(e) => setEditingCard({ ...editingCard, orden: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}