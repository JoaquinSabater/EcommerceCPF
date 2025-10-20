"use client";

import { useState, useEffect } from 'react';
import { CldUploadWidget, CldImage } from 'next-cloudinary';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/hooks/useAuth';

interface CarouselSlide {
  id: number;
  titulo: string;
  descripcion: string;
  imagen_desktop: string;
  imagen_mobile: string;
  enlace: string;
  orden: number;
  activo: boolean;
}

export default function HomeCarouselManager() {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [editingSlide, setEditingSlide] = useState<CarouselSlide | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // ✅ AGREGAR: Estados para controlar uploads
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);
  const { isAdmin } = useAuth();

  // Cargar slides
  useEffect(() => {
    if (isAdmin) {
      fetchSlides();
    }
  }, [isAdmin]);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/home-carousel');
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      }
    } catch (error) {
      console.error('Error loading slides:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slide: CarouselSlide) => {
    setEditingSlide({ ...slide });
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingSlide({
      id: 0,
      titulo: '',
      descripcion: '',
      imagen_desktop: '',
      imagen_mobile: '',
      enlace: '',
      orden: slides.length + 1,
      activo: true
    });
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editingSlide) return;

    if (!editingSlide.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }
    
    if (!editingSlide.imagen_desktop.trim() || !editingSlide.imagen_mobile.trim()) {
      alert('Ambas imágenes son obligatorias');
      return;
    }

    setSaving(true);
    try {
      const url = isCreating ? '/api/home-carousel' : `/api/home-carousel/${editingSlide.id}`;
      const method = isCreating ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingSlide)
      });

      if (response.ok) {
        await fetchSlides();
        setIsEditing(false);
        setIsCreating(false);
        setEditingSlide(null);
        console.log(`✅ Slide ${isCreating ? 'creada' : 'actualizada'} exitosamente`);
      } else {
        const error = await response.json();
        alert(error.error || 'Error al guardar la slide');
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Error al guardar la slide');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta slide?')) return;

    try {
      const response = await fetch(`/api/home-carousel/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchSlides();
        console.log('✅ Slide eliminada');
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
    }
  };

  // ✅ MEJORAR: Función de upload más robusta
  const handleImageUpload = (result: any, isDesktop: boolean) => {
    if (!editingSlide) return;
    
    console.log('Upload result:', result);
    
    if (result.info && typeof result.info === 'object' && 'public_id' in result.info) {
      const publicId = result.info.public_id as string;
      console.log(`✅ Upload successful:`, { publicId, isDesktop, currentSlide: editingSlide });
      
      // ✅ USAR SPREAD OPERATOR para mantener todo el estado
      setEditingSlide(prevSlide => {
        if (!prevSlide) return null;
        
        const updatedSlide = {
          ...prevSlide,
          [isDesktop ? 'imagen_desktop' : 'imagen_mobile']: publicId
        };
        
        console.log('Updated slide:', updatedSlide);
        return updatedSlide;
      });
    } else {
      console.error('Error en upload:', result);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setIsCreating(false);
    setEditingSlide(null);
    // ✅ LIMPIAR estados de upload
    setUploadingDesktop(false);
    setUploadingMobile(false);
  };

  if (!isAdmin || loading) return null;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Gestión del Carousel ({slides.length}/4)</h3>
        
        {slides.length < 4 && (
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            <PlusIcon className="w-5 h-5" />
            Agregar Slide
          </button>
        )}
      </div>

      <div className="space-y-3">
        {slides.map((slide) => (
          <div key={slide.id} className="flex items-center gap-4 p-3 border rounded">
            <div className="flex gap-2">
              <CldImage
                src={slide.imagen_desktop}
                alt="Desktop"
                width={60}
                height={40}
                className="rounded object-cover"
              />
              <CldImage
                src={slide.imagen_mobile}
                alt="Mobile"
                width={60}
                height={40}
                className="rounded object-cover"
              />
            </div>

            <div className="flex-1">
              <h4 className="font-medium">{slide.titulo}</h4>
              <p className="text-sm text-gray-600 truncate">{slide.descripcion}</p>
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                Orden: {slide.orden}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(slide)}
                className="p-2 text-orange-600 hover:bg-orange-50 rounded"
                title="Editar slide"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(slide.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
                title="Eliminar slide"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="mb-4">No hay slides en el carousel</p>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
          >
            Crear primera slide
          </button>
        </div>
      )}

      {/* Modal de edición/creación */}
      {isEditing && editingSlide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={cancelEdit} />
          
          <div className="relative bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h4 className="text-lg font-bold mb-4">
              {isCreating ? 'Crear Nueva Slide' : 'Editar Slide'}
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Título *</label>
              <input
                type="text"
                value={editingSlide.titulo}
                onChange={(e) => setEditingSlide({ ...editingSlide, titulo: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                placeholder="Título de la slide"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Descripción</label>
              <textarea
                value={editingSlide.descripcion}
                onChange={(e) => setEditingSlide({ ...editingSlide, descripcion: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                rows={2}
                placeholder="Descripción de la slide"
              />
            </div>

            {/* ✅ DEBUG: Mostrar valores actuales */}
            <div className="mb-2 p-2 bg-gray-100 rounded text-xs">
              <strong>Debug:</strong> Desktop: {editingSlide.imagen_desktop || 'vacío'} | Mobile: {editingSlide.imagen_mobile || 'vacío'}
            </div>

            {/* ✅ Imagen Desktop - Mejorada */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Imagen Desktop * (1200x500px recomendado)</label>
              <div className="flex items-center gap-3">
                <CldUploadWidget
                  uploadPreset="cpf_upload"
                  onSuccess={(result) => {
                    setUploadingDesktop(false);
                    handleImageUpload(result, true);
                  }}
                  onError={(error) => {
                    setUploadingDesktop(false);
                    console.error('Error upload desktop:', error);
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadingDesktop(true);
                        open?.();
                      }}
                      disabled={uploadingDesktop}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {uploadingDesktop ? 'Subiendo...' : (editingSlide.imagen_desktop ? 'Cambiar' : 'Subir')} Desktop
                    </button>
                  )}
                </CldUploadWidget>
                
                {editingSlide.imagen_desktop && (
                  <div className="flex items-center gap-2">
                    <CldImage
                      src={editingSlide.imagen_desktop}
                      alt="Preview desktop"
                      width={80}
                      height={50}
                      className="rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, imagen_desktop: '' })}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Imagen Mobile - Mejorada */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Imagen Mobile * (768x250px recomendado)</label>
              <div className="flex items-center gap-3">
                <CldUploadWidget
                  uploadPreset="cpf_upload"
                  onSuccess={(result) => {
                    setUploadingMobile(false);
                    handleImageUpload(result, false);
                  }}
                  onError={(error) => {
                    setUploadingMobile(false);
                    console.error('Error upload mobile:', error);
                  }}
                >
                  {({ open }) => (
                    <button
                      type="button"
                      onClick={() => {
                        setUploadingMobile(true);
                        open?.();
                      }}
                      disabled={uploadingMobile}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {uploadingMobile ? 'Subiendo...' : (editingSlide.imagen_mobile ? 'Cambiar' : 'Subir')} Mobile
                    </button>
                  )}
                </CldUploadWidget>
                
                {editingSlide.imagen_mobile && (
                  <div className="flex items-center gap-2">
                    <CldImage
                      src={editingSlide.imagen_mobile}
                      alt="Preview mobile"
                      width={80}
                      height={50}
                      className="rounded object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingSlide({ ...editingSlide, imagen_mobile: '' })}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Enlace (opcional)</label>
              <input
                type="text"
                value={editingSlide.enlace}
                onChange={(e) => setEditingSlide({ ...editingSlide, enlace: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
                placeholder="/ruta o https://..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-1">Orden</label>
              <input
                type="number"
                min="1"
                max="4"
                value={editingSlide.orden}
                onChange={(e) => setEditingSlide({ ...editingSlide, orden: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="px-4 py-2 text-gray-700 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploadingDesktop || uploadingMobile}
                className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? 'Guardando...' : (isCreating ? 'Crear' : 'Guardar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}