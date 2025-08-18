"use client";

import React, { useState, useEffect } from "react";
import { XMarkIcon, PhotoIcon, TrashIcon, StarIcon } from "@heroicons/react/24/outline";
import { CldImage, CldUploadWidget } from 'next-cloudinary';

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
  foto_portada?: string;
}

interface EditProductModalProps {
  producto: DetalleProducto;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: DetalleProducto) => void;
}

interface ImageData {
  publicId: string;
  url: string;
  isNew: boolean;
  toDelete: boolean;
}

export default function EditProductModal({ producto, isOpen, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<DetalleProducto>(producto);
  const [images, setImages] = useState<ImageData[]>([]);
  const [fotoPortada, setFotoPortada] = useState<ImageData>({ publicId: '', url: '', isNew: false, toDelete: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && producto) {
      setFormData(producto);
      
      const extractPublicId = (url: string) => {
        if (!url) return '';
        if (!url.startsWith('http')) return url;
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(part => part === 'upload');
        if (uploadIndex !== -1 && uploadIndex + 2 < parts.length) {
          return parts.slice(uploadIndex + 2).join('/').split('.')[0];
        }
        return url;
      };

      setFotoPortada({
        publicId: extractPublicId(producto.foto_portada || ''),
        url: producto.foto_portada || '',
        isNew: false,
        toDelete: false
      });

      const initialImages: ImageData[] = [
        { publicId: extractPublicId(producto.foto1_url), url: producto.foto1_url, isNew: false, toDelete: false },
        { publicId: extractPublicId(producto.foto2_url || ''), url: producto.foto2_url || '', isNew: false, toDelete: false },
        { publicId: extractPublicId(producto.foto3_url || ''), url: producto.foto3_url || '', isNew: false, toDelete: false },
        { publicId: extractPublicId(producto.foto4_url || ''), url: producto.foto4_url || '', isNew: false, toDelete: false },
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

  const handlePortadaUpload = (result: any) => {
    if (result.info && typeof result.info === 'object' && 'public_id' in result.info) {
      const publicId = result.info.public_id as string;
      const secureUrl = result.info.secure_url as string;
      
      console.log('Nueva foto de portada subida:', { publicId, secureUrl });
      
      setFotoPortada({
        publicId: publicId,
        url: secureUrl,
        isNew: true,
        toDelete: false
      });
    }
  };

  const handleDeletePortada = () => {
    if (fotoPortada.isNew) {
      setFotoPortada({ publicId: '', url: '', isNew: false, toDelete: false });
    } else {
      setFotoPortada(prev => ({ ...prev, toDelete: true }));
    }
  };

  const handleRestorePortada = () => {
    setFotoPortada(prev => ({ ...prev, toDelete: false }));
  };

  const handleImageUpload = (result: any, index: number) => {
    if (result.info && typeof result.info === 'object' && 'public_id' in result.info) {
      const publicId = result.info.public_id as string;
      const secureUrl = result.info.secure_url as string;
      
      console.log('Nueva imagen subida:', { publicId, secureUrl });
      
      setImages(prev => {
        const newImages = [...prev];
        newImages[index] = {
          publicId: publicId,
          url: secureUrl,
          isNew: true,
          toDelete: false
        };
        return newImages;
      });
    }
  };

  const handleDeleteImage = (index: number) => {
    setImages(prev => {
      const newImages = [...prev];
      if (newImages[index].isNew) {
        newImages[index] = { publicId: '', url: '', isNew: false, toDelete: false };
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

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const updatedProduct: DetalleProducto = {
        ...formData,
        foto_portada: fotoPortada.toDelete ? '' : (fotoPortada.publicId || ''),
        foto1_url: images[0].toDelete ? '' : (images[0].publicId || ''),
        foto2_url: images[1].toDelete ? undefined : (images[1].publicId || '') || undefined,
        foto3_url: images[2].toDelete ? undefined : (images[2].publicId || '') || undefined,
        foto4_url: images[3].toDelete ? undefined : (images[3].publicId || '') || undefined,
      };

      console.log('Datos a enviar al servidor:', {
        item_id: updatedProduct.item_id,
        foto_portada: updatedProduct.foto_portada,
        foto1_url: updatedProduct.foto1_url
      });

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
      console.log('Respuesta del servidor:', result);

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

  // ✅ Renderizar foto de portada con key única
  const renderPortadaSlot = () => {
    if (fotoPortada.publicId && !fotoPortada.toDelete) {
      return (
        <div className="relative">
          <CldImage
            src={fotoPortada.publicId}
            alt="Foto de portada"
            width={300}
            height={200}
            className="w-full h-40 object-cover rounded bg-gray-100"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <div className="bg-yellow-500 text-white p-1 rounded-full">
              <StarIcon className="w-3 h-3" />
            </div>
            <button
              onClick={handleDeletePortada}
              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
          <div className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
            Portada
          </div>
        </div>
      );
    }

    if (fotoPortada.toDelete) {
      return (
        <div className="text-center p-4 bg-red-50 rounded border-2 border-dashed border-red-300">
          <p className="text-red-500 text-sm mb-2">Imagen de portada eliminada</p>
          <button
            onClick={handleRestorePortada}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            Restaurar
          </button>
        </div>
      );
    }

    return (
      <CldUploadWidget
        key={`portada-${producto.item_id}`} // ✅ Key única para portada
        uploadPreset="cpf_upload"
        options={{ 
          maxFiles: 1,
          folder: `productos/${producto.item_id}/portada`
        }}
        onSuccess={handlePortadaUpload}
      >
        {({ open }) => (
          <div 
            className="border-2 border-dashed border-yellow-300 rounded-lg p-4 text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors cursor-pointer"
            onClick={() => {
              console.log('Abriendo widget de portada');
              if (open) open();
            }}
          >
            <div className="flex items-center justify-center mb-2">
              <StarIcon className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Haz clic para subir imagen de portada
            </p>
            <p className="text-xs text-yellow-600 font-semibold">
              FOTO PRINCIPAL (Se muestra en las cards)
            </p>
          </div>
        )}
      </CldUploadWidget>
    );
  };

  // ✅ Renderizar imágenes de galería con keys únicas
  const renderImageSlot = (image: ImageData, index: number) => {
    if (image.publicId && !image.toDelete) {
      return (
        <div className="relative">
          <CldImage
            src={image.publicId}
            alt={`Imagen ${index + 1}`}
            width={300}
            height={200}
            className="w-full h-32 object-cover rounded bg-gray-100"
          />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              onClick={() => handleDeleteImage(index)}
              className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <TrashIcon className="w-3 h-3" />
            </button>
          </div>
        </div>
      );
    }

    if (image.toDelete) {
      return (
        <div className="text-center p-4 bg-red-50 rounded border-2 border-dashed border-red-300">
          <p className="text-red-500 text-sm mb-2">Imagen eliminada</p>
          <button
            onClick={() => handleRestoreImage(index)}
            className="text-xs text-blue-500 hover:text-blue-600"
          >
            Restaurar
          </button>
        </div>
      );
    }

    return (
      <CldUploadWidget
        key={`galeria-${producto.item_id}-${index}`} // ✅ Key única para cada slot de galería
        uploadPreset="cpf_upload"
        options={{ 
          maxFiles: 1,
          folder: `productos/${producto.item_id}/galeria`
        }}
        onSuccess={(result) => handleImageUpload(result, index)}
      >
        {({ open }) => (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors cursor-pointer"
            onClick={() => {
              console.log(`Abriendo widget de galería ${index + 1}`);
              if (open) open();
            }}
          >
            <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-2">
              Haz clic para subir imagen
            </p>
            <p className="text-xs text-orange-500">
              Galería {index + 1}
            </p>
          </div>
        )}
      </CldUploadWidget>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-2xl max-w-5xl mx-auto max-h-[95vh] overflow-y-auto w-full">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Editar Producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Formulario de campos */}
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

          {/* Foto de portada */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <span className="flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                Foto de Portada (Se muestra en las cards del catálogo)
              </span>
            </label>
            
            <div className="max-w-md">
              {renderPortadaSlot()}
            </div>
          </div>

          {/* ✅ Galería de imágenes con keys únicas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Galería de imágenes del producto (máximo 4)
            </label>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={`image-slot-${producto.item_id}-${index}`}>
                  {renderImageSlot(image, index)}
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