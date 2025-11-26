"use client";

import React, { useState, useEffect, useRef } from "react";
import { XMarkIcon, PhotoIcon, TrashIcon, StarIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
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
  destacar?: boolean;
  activo?: boolean;
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

const sanitizeValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
};

export default function EditProductModal({ producto, isOpen, onClose, onSave }: EditProductModalProps) {
  const [formData, setFormData] = useState<DetalleProducto>(producto);
  const [images, setImages] = useState<ImageData[]>([]);
  const [fotoPortada, setFotoPortada] = useState<ImageData>({ publicId: '', url: '', isNew: false, toDelete: false });
  const [loading, setLoading] = useState(false);
  // ✅ Referencias para los widgets
  const portadaWidgetRef = useRef<any>(null);
  const imageWidgetRefs = useRef<any[]>([]);

  useEffect(() => {
    if (isOpen && producto) {
      const sanitizedProducto: DetalleProducto = {
        ...producto,
        descripcion: sanitizeValue(producto.descripcion),
        material: sanitizeValue(producto.material),
        espesor: sanitizeValue(producto.espesor),
        proteccion: sanitizeValue(producto.proteccion),
        compatibilidad: sanitizeValue(producto.compatibilidad),
        pegamento: sanitizeValue(producto.pegamento),
        foto1_url: sanitizeValue(producto.foto1_url),
        foto2_url: sanitizeValue(producto.foto2_url),
        foto3_url: sanitizeValue(producto.foto3_url),
        foto4_url: sanitizeValue(producto.foto4_url),
        foto_portada: sanitizeValue(producto.foto_portada),
        destacar: Boolean(producto.destacar),
        activo: Boolean(producto.activo)
      };
      
      setFormData(sanitizedProducto);
      
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
        publicId: extractPublicId(sanitizedProducto.foto_portada || ''),
        url: sanitizedProducto.foto_portada || '',
        isNew: false,
        toDelete: false
      });

      const initialImages: ImageData[] = [
        { publicId: extractPublicId(sanitizedProducto.foto1_url), url: sanitizedProducto.foto1_url, isNew: false, toDelete: false },
        { publicId: extractPublicId(sanitizedProducto.foto2_url || ''), url: sanitizedProducto.foto2_url || '', isNew: false, toDelete: false },
        { publicId: extractPublicId(sanitizedProducto.foto3_url || ''), url: sanitizedProducto.foto3_url || '', isNew: false, toDelete: false },
        { publicId: extractPublicId(sanitizedProducto.foto4_url || ''), url: sanitizedProducto.foto4_url || '', isNew: false, toDelete: false },
      ];
      
      setImages(initialImages);
      // ✅ Inicializar array de referencias
      imageWidgetRefs.current = new Array(4).fill(null);
    }
  }, [isOpen, producto]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: sanitizeValue(value) 
      }));
    }
  };

  const handlePortadaUpload = (result: any) => {
    try {
      if (result?.info && typeof result.info === 'object' && 'public_id' in result.info) {
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
    } catch (error) {
      console.error('Error procesando upload de portada:', error);
    }
  };

  const handleDeletePortada = () => {
    try {
      if (fotoPortada.isNew) {
        setFotoPortada({ publicId: '', url: '', isNew: false, toDelete: false });
      } else {
        setFotoPortada(prev => ({ ...prev, toDelete: true }));
      }
    } catch (error) {
      console.error('Error eliminando portada:', error);
    }
  };

  const handleRestorePortada = () => {
    try {
      setFotoPortada(prev => ({ ...prev, toDelete: false }));
    } catch (error) {
      console.error('Error restaurando portada:', error);
    }
  };

  const handleImageUpload = (result: any, index: number) => {
    try {
      if (result?.info && typeof result.info === 'object' && 'public_id' in result.info) {
        const publicId = result.info.public_id as string;
        const secureUrl = result.info.secure_url as string;

        console.log('Nueva imagen subida:', { publicId, secureUrl, index });

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
    } catch (error) {
      console.error('Error procesando upload de imagen:', error);
    }
  };

  const handleDeleteImage = (index: number) => {
    try {
      setImages(prev => {
        const newImages = [...prev];
        if (newImages[index].isNew) {
          newImages[index] = { publicId: '', url: '', isNew: false, toDelete: false };
        } else {
          newImages[index] = { ...newImages[index], toDelete: true };
        }
        return newImages;
      });
    } catch (error) {
      console.error('Error eliminando imagen:', error);
    }
  };

  const handleRestoreImage = (index: number) => {
    try {
      setImages(prev => {
        const newImages = [...prev];
        newImages[index] = { ...newImages[index], toDelete: false };
        return newImages;
      });
    } catch (error) {
      console.error('Error restaurando imagen:', error);
    }
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
      
      const statusMessages = [];
      if (updatedProduct.destacar) statusMessages.push('marcado como destacado');
      if (updatedProduct.activo) statusMessages.push('detalle activado');
      else statusMessages.push('detalle desactivado');
      
      const statusText = statusMessages.length > 0 ? ` y ${statusMessages.join(', ')}` : '';
      alert(`Producto actualizado exitosamente${statusText}`);
      
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error al guardar el producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Función segura para abrir portada
  const openPortadaWidget = () => {
    try {
      if (portadaWidgetRef.current && typeof portadaWidgetRef.current === 'function') {
        portadaWidgetRef.current();
      } else {
        console.error('Widget de portada no inicializado');
        alert('Error: El selector de imágenes no está listo. Intenta de nuevo en unos segundos.');
      }
    } catch (error) {
      console.error('Error abriendo widget de portada:', error);
      alert('Error al abrir el selector de imágenes. Refresca la página e inténtalo de nuevo.');
    }
  };

  // ✅ Función segura para abrir galería
  const openImageWidget = (index: number) => {
    try {
      if (imageWidgetRefs.current[index] && typeof imageWidgetRefs.current[index] === 'function') {
        imageWidgetRefs.current[index]();
      } else {
        console.error(`Widget de galería ${index} no inicializado`);
        alert('Error: El selector de imágenes no está listo. Intenta de nuevo en unos segundos.');
      }
    } catch (error) {
      console.error(`Error abriendo widget de galería ${index}:`, error);
      alert('Error al abrir el selector de imágenes. Refresca la página e inténtalo de nuevo.');
    }
  };

  // ✅ Componente mejorado para portada
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
              type="button"
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
            type="button"
          >
            Restaurar
          </button>
        </div>
      );
    }

    return (
      <div>
        {/* ✅ Widget invisible para portada */}
        <div className="hidden">
          <CldUploadWidget
            uploadPreset="cpf_upload"
            options={{ 
              maxFiles: 1,
              folder: `productos/${producto.item_id}/portada`,
              clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              maxFileSize: 10000000
            }}
            onSuccess={handlePortadaUpload}
            onError={(error) => {
              console.error('Error en upload de portada:', error);
              alert('Error al subir la imagen de portada. Inténtalo de nuevo.');
            }}
          >
            {({ open }) => {
              // ✅ Guardar referencia del widget
              portadaWidgetRef.current = open;
              return null;
            }}
          </CldUploadWidget>
        </div>
        
        {/* ✅ Botón visible */}
        <button
          type="button"
          className="w-full border-2 border-dashed border-yellow-300 rounded-lg p-4 text-center hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
          onClick={openPortadaWidget}
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
        </button>
      </div>
    );
  };

  // ✅ Componente mejorado para imágenes de galería
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
              type="button"
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
            type="button"
          >
            Restaurar
          </button>
        </div>
      );
    }

    return (
      <div>
        {/* ✅ Widget invisible para galería */}
        <div className="hidden">
          <CldUploadWidget
            uploadPreset="cpf_upload"
            options={{ 
              maxFiles: 1,
              folder: `productos/${producto.item_id}/galeria`,
              clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
              maxFileSize: 10000000
            }}
            onSuccess={(result) => handleImageUpload(result, index)}
            onError={(error) => {
              console.error(`Error en upload de imagen ${index + 1}:`, error);
              alert(`Error al subir la imagen ${index + 1}. Inténtalo de nuevo.`);
            }}
          >
            {({ open }) => {
              // ✅ Guardar referencia del widget
              imageWidgetRefs.current[index] = open;
              return null;
            }}
          </CldUploadWidget>
        </div>
        
        {/* ✅ Botón visible */}
        <button
          type="button"
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 hover:bg-orange-50 transition-colors"
          onClick={() => openImageWidget(index)}
        >
          <PhotoIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500 mb-2">
            Haz clic para subir imagen
          </p>
          <p className="text-xs text-orange-500">
            Galería {index + 1}
          </p>
        </button>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />
      
      <div className="relative bg-white rounded-lg shadow-2xl max-w-5xl mx-auto max-h-[95vh] overflow-y-auto w-full">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-semibold">Editar Producto</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" type="button">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sección de controles principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Switch para activar detalle */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo || false}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-blue-300 rounded"
                />
                <label htmlFor="activo" className="flex items-center cursor-pointer">
                  {formData.activo ? (
                    <EyeIcon className="w-5 h-5 text-blue-500 mr-2" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-gray-400 mr-2" />
                  )}
                  <span className="text-sm font-medium text-gray-900">
                    Activar detalle del producto
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-2 ml-8">
                {formData.activo 
                  ? 'Las características se mostrarán en el detalle del producto'
                  : 'Las características estarán ocultas en el detalle del producto'
                }
              </p>
            </div>

            {/* Checkbox para destacar producto */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="destacar"
                  name="destacar"
                  checked={formData.destacar || false}
                  onChange={handleInputChange}
                  className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded"
                />
                <label htmlFor="destacar" className="flex items-center cursor-pointer">
                  <StarIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">
                    Marcar como producto destacado
                  </span>
                </label>
              </div>
              <p className="text-xs text-gray-600 mt-2 ml-8">
                Los productos destacados aparecen en el carrusel de la página principal
              </p>
            </div>
          </div>

          {/* Campos de características - solo visible si activo está marcado */}
          {formData.activo && (
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                <EyeIcon className="w-5 h-5 mr-2" />
                Características del Producto
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Material
                  </label>
                  <input
                    type="text"
                    name="material"
                    value={sanitizeValue(formData.material)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Espesor
                  </label>
                  <input
                    type="text"
                    name="espesor"
                    value={sanitizeValue(formData.espesor)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Protección
                  </label>
                  <input
                    type="text"
                    name="proteccion"
                    value={sanitizeValue(formData.proteccion)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compatibilidad
                  </label>
                  <input
                    type="text"
                    name="compatibilidad"
                    value={sanitizeValue(formData.compatibilidad)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pegamento
                  </label>
                  <input
                    type="text"
                    name="pegamento"
                    value={sanitizeValue(formData.pegamento)}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Mensaje cuando las características están desactivadas */}
          {!formData.activo && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex items-center text-gray-500">
                <EyeSlashIcon className="w-5 h-5 mr-2" />
                <span className="text-sm">
                  Las características están ocultas. Active "Activar detalle del producto" para editarlas.
                </span>
              </div>
            </div>
          )}

          {/* Información básica del producto */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del producto
                <span className="text-xs text-gray-500 ml-2">(No editable)</span>
              </label>
              <input
                type="text"
                name="item_nombre"
                value={sanitizeValue(formData.item_nombre)}
                readOnly={true}
                className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600 cursor-not-allowed"
                title="Este campo no se puede modificar"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={sanitizeValue(formData.descripcion)}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
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

          {/* Galería de imágenes */}
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
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{ backgroundColor: '#ea580c' }}
              type="button"
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