"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PhotoIcon, TrashIcon } from "@heroicons/react/24/outline";

interface DetalleProducto {
  item_id: number;
  item_nombre: string;
  descripcion: string;
  material: string;
  espesor: string;
  proteccion: string;
  compatibilidad: string;
  pegamento: string;
  foto1_url: string;
  foto2_url?: string;
  foto3_url?: string;
  foto4_url?: string;
}

interface EditProductModalProps {
  producto: DetalleProducto;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: DetalleProducto) => void;
}

interface ImageFile {
  file: File | null;
  url: string;
  isNew: boolean;
  toDelete: boolean;
  publicId?: string; 
}

export default function EditProductModal({ producto, isOpen, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<DetalleProducto>(producto);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    if (isOpen && producto) {
      setFormData(producto);
      
      const initialImages: ImageFile[] = [
        { file: null, url: producto.foto1_url, isNew: false, toDelete: false },
        { file: null, url: producto.foto2_url || '', isNew: false, toDelete: false },
        { file: null, url: producto.foto3_url || '', isNew: false, toDelete: false },
        { file: null, url: producto.foto4_url || '', isNew: false, toDelete: false },
      ];
      
      setImages(initialImages);
    }
  }, [isOpen, producto]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (files: FileList, index: number) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede ser mayor a 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImages(prev => {
        const newImages = [...prev];
        newImages[index] = {
          file: file,
          url: e.target?.result as string,
          isNew: true,
          toDelete: false
        };
        return newImages;
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files, index);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].isNew) {
        newImages[index] = { file: null, url: '', isNew: false, toDelete: false };
      } else {
        newImages[index] = { ...newImages[index], toDelete: true };
      }
      return newImages;
    });
  };

  const handleRestoreImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      newImages[index] = { ...newImages[index], toDelete: false };
      return newImages;
    });
  };

  const uploadImages = async (): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      if (image.isNew && image.file) {
        const formData = new FormData();
        formData.append('file', image.file);
        formData.append('productId', producto.item_id.toString());
        formData.append('imageIndex', index.toString());

        try {
          const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) throw new Error('Error al subir imagen');
          
          const data = await response.json();
          return data.url;
        } catch (error) {
          console.error('Error uploading image:', error);
          return image.url;
        }
      }
      
      if (image.toDelete) {
        return '';
      }
      
      return image.url;
    });

    return Promise.all(uploadPromises);
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const imageUrls = await uploadImages();
      
      const updatedProduct: DetalleProducto = {
        ...formData,
        foto1_url: imageUrls[0] || '',
        foto2_url: imageUrls[1] || undefined,
        foto3_url: imageUrls[2] || undefined,
        foto4_url: imageUrls[3] || undefined,
      };

      const response = await fetch(`/api/actualizar?id=${producto.item_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProduct),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al guardar el producto');
      }

      const result = await response.json();
      console.log('Producto actualizado:', result);

      onSave(updatedProduct);
      onClose();
      alert('Producto actualizado exitosamente');
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error al guardar el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const renderImage = (image: ImageFile, index: number) => {
    if (image.url && !image.toDelete) {
      return (
        <img
          src={image.url}
          alt={`Imagen ${index + 1}`}
          className="w-full h-32 object-cover rounded"
          onError={(e) => {
            console.error('Error loading image:', image.url);
            e.currentTarget.style.display = 'none';
          }}
        />
      );
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-2xl max-w-4xl mx-auto max-h-[95vh] overflow-y-auto w-full">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Editar Producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del producto
                <span className="text-xs text-gray-500 ml-2">(No editable)</span>
              </label>
              <input
                type="text"
                name="item_nombre"
                value={formData.item_nombre}
                readOnly={true}
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                title="Este campo no se puede modificar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Espesor
              </label>
              <input
                type="text"
                name="espesor"
                value={formData.espesor}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Protección
              </label>
              <input
                type="text"
                name="proteccion"
                value={formData.proteccion}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compatibilidad
              </label>
              <input
                type="text"
                name="compatibilidad"
                value={formData.compatibilidad}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pegamento
              </label>
              <input
                type="text"
                name="pegamento"
                value={formData.pegamento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Imágenes del producto (máximo 4)
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <div
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                      dragOver ? 'border-orange-500 bg-orange-50' : 'border-gray-300'
                    } ${image.toDelete ? 'opacity-50 bg-red-50' : ''}`}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    {image.url && !image.toDelete ? (
                      <div className="relative">
                        {renderImage(image, index)}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <button
                            onClick={() => handleDeleteImage(index)}
                            className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : image.toDelete ? (
                      <div className="text-center">
                        <p className="text-red-500 text-sm mb-2">Imagen eliminada</p>
                        <button
                          onClick={() => handleRestoreImage(index)}
                          className="text-xs text-blue-500 hover:text-blue-600"
                        >
                          Restaurar
                        </button>
                      </div>
                    ) : (
                      <div>
                        <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 mb-2">
                          Arrastra una imagen o
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => e.target.files && handleFileSelect(e.target.files, index)}
                          className="hidden"
                          id={`file-${index}`}
                        />
                        <label
                          htmlFor={`file-${index}`}
                          className="text-orange-500 hover:text-orange-600 cursor-pointer text-sm"
                        >
                          selecciona archivo
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}