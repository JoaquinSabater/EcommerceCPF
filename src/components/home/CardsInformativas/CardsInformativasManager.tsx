"use client";

import { useState, useEffect } from 'react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface CardInformativa {
  id: number;
  titulo: string;
  subtitulo: string;
  imagen: string;
  enlace: string | null;
  orden: number;
  activo: boolean;
}

// ✅ Color fijo en el código
const CARD_COLOR = '#FF5722';

export default function CardsInformativasManager() {
  const [cards, setCards] = useState<CardInformativa[]>([]);
  const [editingCard, setEditingCard] = useState<CardInformativa | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) fetchCards();
  }, [isAdmin]);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards-informativas');
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

  const handleEdit = (card: CardInformativa) => {
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
      orden: cards.length + 1,
      activo: true
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingCard?.titulo || !editingCard?.subtitulo || !editingCard?.imagen) {
      alert('Título, subtítulo e imagen son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const isCreating = editingCard.id === 0;
      const url = isCreating ? '/api/cards-informativas' : `/api/cards-informativas/${editingCard.id}`;
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
      const response = await fetch(`/api/cards-informativas/${id}`, { method: 'DELETE' });
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
        <h3 className="text-lg font-bold">Gestión de Cards Informativas ({cards.length})</h3>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
        >
          <PlusIcon className="w-5 h-5" />
          Agregar Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.id} className="border rounded-lg p-4">
            {/* Preview de la card con color fijo */}
            <div 
              className="relative overflow-hidden rounded-lg h-32 mb-3"
              style={{ backgroundColor: CARD_COLOR }} // ✅ Color fijo
            >
              <div className="absolute left-0 top-0 bottom-0 w-1/2 flex flex-col justify-center p-3 text-white">
                <p className="text-xs opacity-90 mb-1">{card.titulo}</p>
                <h4 className="text-sm font-bold leading-tight">
                  {card.subtitulo.split('\n').map((line, index) => (
                    <div key={index}>{line}</div>
                  ))}
                </h4>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2">
                {isLocalImage(card.imagen) ? (
                  <Image src="/not-image.png" alt={card.titulo} fill className="object-cover" />
                ) : (
                  <CldImage src={card.imagen} alt={card.titulo} fill className="object-cover" />
                )}
              </div>
            </div>
            
            <h4 className="font-medium mb-1">{card.titulo}</h4>
            <p className="text-sm text-gray-600 mb-2 truncate">{card.enlace || 'Sin enlace'}</p>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Orden: {card.orden}</span>

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleEdit(card)} className="flex-1 p-2 text-orange-600 hover:bg-orange-50 rounded">
                <PencilIcon className="w-4 h-4 mx-auto" />
              </button>
              <button onClick={() => handleDelete(card.id)} className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded">
                <TrashIcon className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal - Sin selector de color */}
      {isEditing && editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsEditing(false)} />
          
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-bold mb-4">
              {editingCard.id === 0 ? 'Crear Card' : 'Editar Card'}
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Título pequeño *</label>
              <input
                type="text"
                value={editingCard.titulo}
                onChange={(e) => setEditingCard({ ...editingCard, titulo: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                placeholder="nueva"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Texto principal * (usa \n para nueva línea)</label>
              <textarea
                value={editingCard.subtitulo}
                onChange={(e) => setEditingCard({ ...editingCard, subtitulo: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                rows={3}
                placeholder="COLECCION\nVOL. 2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Enlace (opcional)</label>
              <input
                type="text"
                value={editingCard.enlace || ''}
                onChange={(e) => setEditingCard({ ...editingCard, enlace: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                placeholder="/public/categoria"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Imagen *</label>
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
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Orden</label>
              <input
                type="number"
                min="1"
                value={editingCard.orden}
                onChange={(e) => setEditingCard({ ...editingCard, orden: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50">
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}