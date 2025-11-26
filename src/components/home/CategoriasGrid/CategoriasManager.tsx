"use client";

import { useState, useEffect } from 'react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import Image from 'next/image';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface Categoria {
  id: number;
  nombre: string;
  imagen: string;
  url: string;
  orden: number;
  activo: boolean;
}

export default function CategoriasManager() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) fetchCategorias();
  }, [isAdmin]);

  const fetchCategorias = async () => {
    try {
      const response = await fetch('/api/categorias-home');
      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función para determinar si es imagen local o de Cloudinary
  const isLocalImage = (imagen: string) => {
    return imagen === 'not-image' || imagen.startsWith('/') || imagen.startsWith('not-image');
  };

  const handleEdit = (categoria: Categoria) => {
    setEditingCategoria({ ...categoria });
    setIsEditing(true);
  };

  const handleCreate = () => {
    setEditingCategoria({
      id: 0,
      nombre: '',
      imagen: 'not-image', // ✅ Imagen predeterminada para nuevas categorías
      url: '',
      orden: categorias.length + 1,
      activo: true
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingCategoria?.nombre || !editingCategoria?.imagen || !editingCategoria?.url) {
      alert('Todos los campos son obligatorios');
      return;
    }

    setSaving(true);
    try {
      const isCreating = editingCategoria.id === 0;
      const url = isCreating ? '/api/categorias-home' : `/api/categorias-home/${editingCategoria.id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCategoria)
      });

      if (response.ok) {
        await fetchCategorias();
        setIsEditing(false);
        setEditingCategoria(null);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar categoría?')) return;

    try {
      const response = await fetch(`/api/categorias-home/${id}`, { method: 'DELETE' });
      if (response.ok) await fetchCategorias();
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const handleImageUpload = (result: any) => {
    if (result.info?.public_id && editingCategoria) {
      setEditingCategoria({ ...editingCategoria, imagen: result.info.public_id });
    }
  };

  if (!isAdmin || loading) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Gestión de Categorías ({categorias.length})</h3>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 text-white rounded"
          style={{ backgroundColor: '#ea580c' }}
        >
          <PlusIcon className="w-5 h-5" />
          Agregar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="border rounded-lg p-4">
            <div className="aspect-square relative mb-3 bg-gray-50 rounded">
              {/* ✅ Renderizado condicional en el manager */}
              {isLocalImage(categoria.imagen) ? (
                <Image
                  src="/not-image.png"
                  alt={categoria.nombre}
                  fill
                  className="object-cover rounded"
                />
              ) : (
                <CldImage 
                  src={categoria.imagen} 
                  alt={categoria.nombre} 
                  fill 
                  className="object-cover rounded" 
                />
              )}
            </div>
            
            <h4 className="font-medium mb-1">{categoria.nombre}</h4>
            <p className="text-sm text-gray-600 mb-2 truncate">{categoria.url}</p>
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">Orden: {categoria.orden}</span>

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleEdit(categoria)} className="flex-1 p-2 text-orange-600 hover:bg-orange-50 rounded">
                <PencilIcon className="w-4 h-4 mx-auto" />
              </button>
              <button onClick={() => handleDelete(categoria.id)} className="flex-1 p-2 text-red-600 hover:bg-red-50 rounded">
                <TrashIcon className="w-4 h-4 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isEditing && editingCategoria && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsEditing(false)} />
          
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full">
            <h4 className="text-lg font-bold mb-4">
              {editingCategoria.id === 0 ? 'Crear Categoría' : 'Editar Categoría'}
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nombre *</label>
              <input
                type="text"
                value={editingCategoria.nombre}
                onChange={(e) => setEditingCategoria({ ...editingCategoria, nombre: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">URL *</label>
              <input
                type="text"
                value={editingCategoria.url}
                onChange={(e) => setEditingCategoria({ ...editingCategoria, url: e.target.value })}
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
                      {editingCategoria.imagen === 'not-image' ? 'Subir' : 'Cambiar'}
                    </button>
                  )}
                </CldUploadWidget>
                
                {/* ✅ Preview con renderizado condicional */}
                {editingCategoria.imagen && (
                  <div className="w-[60px] h-[60px] relative">
                    {isLocalImage(editingCategoria.imagen) ? (
                      <Image
                        src="/not-image.png"
                        alt="Preview"
                        fill
                        className="rounded object-cover"
                      />
                    ) : (
                      <CldImage 
                        src={editingCategoria.imagen} 
                        alt="Preview" 
                        fill
                        className="rounded object-cover" 
                      />
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
                value={editingCategoria.orden}
                onChange={(e) => setEditingCategoria({ ...editingCategoria, orden: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-white rounded disabled:opacity-50" style={{ backgroundColor: '#ea580c' }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}